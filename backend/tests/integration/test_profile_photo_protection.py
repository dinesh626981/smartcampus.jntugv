import os
import sys
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import create_app
from app.core.database import db
from app.models.user import User
from app.models.complaint import Complaint
from app.services.image_service import (
    delete_image,
    delete_profile_photo,
    delete_images_batch,
    upload_profile_photo
)

class ProfilePhotoProtectionTestCase(unittest.TestCase):
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
            self.admin.profile_photo_public_id = 'profiles/user_1'
            self.admin.profile_photo_url = 'https://res.cloudinary.com/demo/image/upload/v1/profiles/user_1.jpg'
            self.admin.profile_photo_bytes = 65000
            self.admin.profile_photo_source = 'uploaded'
            db.session.add(self.admin)

            # Create test student
            self.student = User(name='Test Student', email='student_test@college.com', role='student')
            self.student.set_password('student123')
            self.student.profile_photo_public_id = 'profiles/user_2'
            self.student.profile_photo_url = 'https://res.cloudinary.com/demo/image/upload/v1/profiles/user_2.jpg'
            self.student.profile_photo_bytes = 48000
            self.student.profile_photo_source = 'google_imported'
            db.session.add(self.student)
            db.session.commit()

            # Seed an old resolved complaint eligible for cleanup
            old_date = datetime.utcnow() - timedelta(days=60)
            c1 = Complaint(
                title='Old Leaking Pipe',
                description='Repaired pipe 60 days ago',
                category='Plumbing',
                location='Block B',
                priority='Medium',
                status='Resolved',
                student_id=self.student.id,
                created_at=old_date,
                updated_at=old_date,
                image_url='https://res.cloudinary.com/demo/image/upload/v1/complaints/before/leak1.jpg',
                image_public_id='complaints/before/leak1',
                image_bytes=150000
            )
            db.session.add(c1)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_delete_image_hard_guard_blocks_profiles(self):
        """
        Verify delete_image() strictly refuses any public_id under 'profiles/'
        and refuses any public_id that does not start with 'complaints/'.
        """
        with patch('app.services.image_service.cloudinary') as mock_cloud:
            # 1. Attempt to pass a profile photo public_id
            result = delete_image('profiles/user_1')
            self.assertFalse(result)
            mock_cloud.uploader.destroy.assert_not_called()

            # 2. Attempt to pass an arbitrary non-complaint public_id
            result2 = delete_image('documents/invoice_123')
            self.assertFalse(result2)
            mock_cloud.uploader.destroy.assert_not_called()

    def test_delete_profile_photo_only_allows_profiles_folder(self):
        """
        Verify delete_profile_photo() only accepts public_ids under 'profiles/'
        and raises ValueError for complaints or arbitrary paths.
        """
        # Attempting to delete a complaint image through delete_profile_photo must raise ValueError
        with self.assertRaises(ValueError):
            delete_profile_photo('complaints/before/leak1')

        with self.assertRaises(ValueError):
            delete_profile_photo('avatars/user_1')

    def test_delete_images_batch_drops_profile_ids(self):
        """
        Verify delete_images_batch() filters out any non-complaints public_ids
        and NEVER sends 'profiles/' IDs to Cloudinary bulk destroy.
        """
        with patch('app.services.image_service.cloudinary') as mock_cloud:
            mock_cloud.api.delete_resources.return_value = {'deleted': {'complaints/before/leak1': 'deleted'}}

            # Pass a mixed list containing a complaint image and a profile photo
            mixed_ids = ['complaints/before/leak1', 'profiles/user_1', 'profiles/user_2']
            result = delete_images_batch(mixed_ids)

            self.assertIn('complaints/before/leak1', result)
            self.assertNotIn('profiles/user_1', result)
            self.assertNotIn('profiles/user_2', result)

            # Assert Cloudinary api was only invoked with the allowed complaints ID
            mock_cloud.api.delete_resources.assert_called_once_with(['complaints/before/leak1'])

    def test_admin_cleanup_preview_excludes_profile_photos(self):
        """
        Verify admin cleanup preview only queries Complaint records and
        never includes User profile photos.
        """
        with self.app.app_context():
            token_res = self.client.post('/api/login', json={
                'email': 'admin_test@college.com',
                'password': 'admin123'
            })
            token = token_res.get_json()['token']

            preview_res = self.client.post(
                '/api/cleanup/preview',
                headers={'Authorization': f'Bearer {token}'},
                json={'days': 30}
            )
            self.assertEqual(preview_res.status_code, 200)
            data = preview_res.get_json()

            # Ensure candidate items are strictly complaints
            self.assertEqual(data['candidate_count'], 1)
            for complaint in data['complaints']:
                self.assertNotIn('profiles/', str(complaint))

    def test_admin_storage_usage_breakdown(self):
        """
        Verify GET /api/storage-usage returns separate metrics for
        complaint images vs. protected profile photos.
        """
        with self.app.app_context():
            token_res = self.client.post('/api/login', json={
                'email': 'admin_test@college.com',
                'password': 'admin123'
            })
            token = token_res.get_json()['token']

            usage_res = self.client.get(
                '/api/storage-usage',
                headers={'Authorization': f'Bearer {token}'}
            )
            self.assertEqual(usage_res.status_code, 200)
            data = usage_res.get_json()

            self.assertIn('complaint_images_mb', data)
            self.assertIn('complaint_images_count', data)
            self.assertIn('profile_photos_mb', data)
            self.assertIn('profile_photos_count', data)
            self.assertIn('reclaimable_mb', data)

            self.assertEqual(data['profile_photos_count'], 2)
            self.assertEqual(data['complaint_images_count'], 1)

if __name__ == '__main__':
    unittest.main()
