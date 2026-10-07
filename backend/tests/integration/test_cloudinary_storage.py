import os
import sys
import io
import unittest
from datetime import datetime, timedelta
from PIL import Image

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import create_app
from app.core.database import db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.cleanup_log import CleanupLog
from app.services.image_service import optimize_image_bytes, get_storage_usage

class CloudinaryStorageTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        })
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

            # Create test admin
            self.admin = User(name='Test Admin', email='admin_test@college.com', role='admin')
            self.admin.set_password('admin123')
            db.session.add(self.admin)

            # Create test student
            self.student = User(name='Test Student', email='student_test@college.com', role='student')
            self.student.set_password('student123')
            db.session.add(self.student)
            db.session.commit()

            # Seed complaints: 1 old resolved, 1 old pending (MUST NOT DELETE), 1 recent resolved
            old_date = datetime.utcnow() - timedelta(days=45)
            recent_date = datetime.utcnow() - timedelta(days=5)

            # 1. Old Resolved complaint (eligible candidate)
            c1 = Complaint(
                title='Old Resolved Pipe Leak',
                description='Leaking pipe repaired 45 days ago',
                category='Water Supply',
                location='Block A Room 101',
                priority='Medium',
                status='Resolved',
                student_id=self.student.id,
                created_at=old_date,
                updated_at=old_date,
                image_url='https://res.cloudinary.com/demo/image/upload/v1/complaints/before/test_old.jpg',
                image_public_id='complaints/before/test_old',
                image_bytes=350000,
                completion_image_url='https://res.cloudinary.com/demo/image/upload/v1/complaints/proof/test_old_proof.jpg',
                completion_image_public_id='complaints/proof/test_old_proof',
                completion_image_bytes=420000
            )
            # 2. Old Pending complaint (ACTIVE - MUST NEVER BE PURGED)
            c2 = Complaint(
                title='Old Pending Electrical Issue',
                description='Switchboard not yet repaired',
                category='Electrical',
                location='Block B Room 202',
                priority='High',
                status='Pending',
                student_id=self.student.id,
                created_at=old_date,
                updated_at=old_date,
                image_url='https://res.cloudinary.com/demo/image/upload/v1/complaints/before/test_pending.jpg',
                image_public_id='complaints/before/test_pending',
                image_bytes=280000
            )
            # 3. Recent Resolved complaint (NOT ELIGIBLE due to 30d age threshold)
            c3 = Complaint(
                title='Recent Resolved Desk Repair',
                description='Fixed 5 days ago',
                category='Furniture',
                location='Library 1F',
                priority='Low',
                status='Resolved',
                student_id=self.student.id,
                created_at=recent_date,
                updated_at=recent_date,
                image_url='https://res.cloudinary.com/demo/image/upload/v1/complaints/before/test_recent.jpg',
                image_public_id='complaints/before/test_recent',
                image_bytes=310000
            )
            db.session.add_all([c1, c2, c3])
            db.session.commit()

            self.c1_id = c1.id
            self.c2_id = c2.id
            self.c3_id = c3.id

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def get_admin_token(self):
        res = self.client.post('/api/login', json={
            'email': 'admin_test@college.com',
            'password': 'admin123'
        })
        return res.get_json()['token']

    def test_image_optimization(self):
        """Verifies Pillow downsizes images to max 1600x1600 and compresses into JPEG buffer."""
        img = Image.new('RGB', (2400, 1800), color=(100, 150, 200))
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        buf.name = 'raw_large.jpg'

        opt_buf, size_bytes = optimize_image_bytes(buf)
        processed = Image.open(opt_buf)
        self.assertLessEqual(processed.size[0], 1600)
        self.assertLessEqual(processed.size[1], 1600)
        self.assertGreater(size_bytes, 0)

    def test_storage_usage_calculation(self):
        """Verifies get_storage_usage() returns standardized quota metrics."""
        with self.app.app_context():
            usage = get_storage_usage()
            self.assertIn('storage_used_bytes', usage)
            self.assertIn('credits_used', usage)
            self.assertIn('credits_limit', usage)
            self.assertIn('percent_used', usage)
            self.assertIn('level', usage)
            self.assertIn(usage['level'], ['ok', 'warning', 'critical'])

    def test_preview_cleanup_protects_active_tickets(self):
        """Verifies preview includes only resolved/closed complaints > X days, strictly protecting active tickets."""
        token = self.get_admin_token()
        res = self.client.post(
            '/api/cleanup/preview',
            headers={'Authorization': f'Bearer {token}'},
            json={'days': 30}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        # Should only find the 1 old resolved ticket, NOT the pending or recent one
        self.assertEqual(data['candidate_count'], 1)
        self.assertEqual(data['total_images_count'], 2) # before + proof
        candidate_ids = [c['id'] for c in data['complaints']]
        self.assertIn(self.c1_id, candidate_ids)
        self.assertNotIn(self.c2_id, candidate_ids) # Active Pending is protected
        self.assertNotIn(self.c3_id, candidate_ids) # Recent (<30d) is protected

    def test_cleanup_execution_confirmation_gate(self):
        """Verifies execution is strictly gated by confirm: 'DELETE'."""
        token = self.get_admin_token()
        # Invalid confirm string
        bad_res = self.client.post(
            '/api/cleanup/execute',
            headers={'Authorization': f'Bearer {token}'},
            json={'days': 30, 'confirm': 'yes'}
        )
        self.assertEqual(bad_res.status_code, 400)

        # Valid confirm string
        good_res = self.client.post(
            '/api/cleanup/execute',
            headers={'Authorization': f'Bearer {token}'},
            json={'days': 30, 'confirm': 'DELETE'}
        )
        self.assertEqual(good_res.status_code, 200)

    def test_cleanup_execution_nullifies_and_logs(self):
        """Verifies cleanup nullifies Cloudinary fields, sets deleted_at, and writes to CleanupLog."""
        token = self.get_admin_token()
        res = self.client.post(
            '/api/cleanup/execute',
            headers={'Authorization': f'Bearer {token}'},
            json={'days': 30, 'confirm': 'DELETE'}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['deleted_count'], 2)
        self.assertEqual(data['reclaimed_bytes'], 770000)

        with self.app.app_context():
            # Check complaint 1 state
            c1 = Complaint.query.get(self.c1_id)
            self.assertIsNone(c1.image_url)
            self.assertIsNone(c1.image_public_id)
            self.assertIsNotNone(c1.image_deleted_at)
            self.assertIsNone(c1.completion_image_url)
            self.assertIsNone(c1.completion_image_public_id)
            self.assertIsNotNone(c1.completion_image_deleted_at)
            # Ticket description and record remain intact
            self.assertEqual(c1.status, 'Resolved')
            self.assertEqual(c1.title, 'Old Resolved Pipe Leak')

            # Active complaint 2 was NOT modified
            c2 = Complaint.query.get(self.c2_id)
            self.assertIsNotNone(c2.image_url)
            self.assertIsNone(c2.image_deleted_at)

            # Check CleanupLog record
            log = CleanupLog.query.order_by(CleanupLog.timestamp.desc()).first()
            self.assertIsNotNone(log)
            self.assertEqual(log.deleted_count, 2)
            self.assertEqual(log.reclaimed_bytes, 770000)
            self.assertEqual(log.filter_days, 30)

if __name__ == '__main__':
    unittest.main()
