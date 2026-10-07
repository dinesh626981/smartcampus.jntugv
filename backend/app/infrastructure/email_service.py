import sys
from flask import current_app
from flask_mail import Mail, Message

mail = Mail()

def init_mail(app):
    """Initialize the Flask-Mail extension."""
    mail.init_app(app)

def send_email(subject, recipient, body_html, body_text=None):
    """
    Sends an email using Flask-Mail. Fallbacks to printing to console 
    if SMTP credentials are not configured.
    """
    # If mail configuration is missing or set to default local development
    if not current_app.config.get('MAIL_USERNAME'):
        print("\n=== [MOCK EMAIL SENT] ===", file=sys.stderr)
        print(f"To: {recipient}", file=sys.stderr)
        print(f"Subject: {subject}", file=sys.stderr)
        print(f"Body: {body_text or body_html}", file=sys.stderr)
        print("==========================\n", file=sys.stderr)
        return True

    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            body=body_text or "Please view this email in an HTML compatible client.",
            html=body_html,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email to {recipient}: {str(e)}", file=sys.stderr)
        # We don't crash the server because of mail failures in development
        return False

def send_password_reset_email(user_email, temp_password):
    subject = "JNTU-GV SmartCampus System - Password Reset"
    body_html = f"""
    <html>
        <body>
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password for the JNTU-GV SmartCampus Issue Reporting & Management System.</p>
            <p>Your temporary password is: <strong>{temp_password}</strong></p>
            <p>Please log in with this temporary password and change your password in your Profile Settings immediately.</p>
            <br/>
            <p>Best regards,</p>
            <p>JNTU-GV SmartCampus Admin Team</p>
        </body>
    </html>
    """
    body_text = f"JNTU-GV SmartCampus System - Password Reset\n\nYour temporary password is: {temp_password}\nPlease log in and change your password in profile settings."
    return send_email(subject, user_email, body_html, body_text)

def send_complaint_status_email(student_email, complaint_title, status, remarks=None):
    subject = f"Complaint Update: {complaint_title} [{status}]"
    remarks_section = f"<p>Remarks: {remarks}</p>" if remarks else ""
    body_html = f"""
    <html>
        <body>
            <h3>Complaint Status Updated</h3>
            <p>Your complaint "<strong>{complaint_title}</strong>" status has been updated to: <strong>{status}</strong>.</p>
            {remarks_section}
            <p>You can track the progress of this complaint in your student dashboard.</p>
            <br/>
            <p>Best regards,</p>
            <p>JNTU-GV SmartCampus System Support</p>
        </body>
    </html>
    """
    body_text = f"Your complaint '{complaint_title}' status has been updated to: {status}.\n" + (f"Remarks: {remarks}" if remarks else "")
    return send_email(subject, student_email, body_html, body_text)

def send_admin_work_completed_email(admin_email, staff_name, department_name, complaint_id, complaint_title, remarks=None):
    subject = f"Work Completed Alert: Ticket #{complaint_id} Resolved by {staff_name}"
    remarks_section = f"<p><strong>Staff Resolution Remarks:</strong> {remarks}</p>" if remarks else "<p><strong>Staff Remarks:</strong> Work completed as per standard procedure.</p>"
    body_html = f"""
    <html>
        <body>
            <h3 style="color: #16a34a;">Assigned Work Completed by Department Staff</h3>
            <p>Staff member <strong>{staff_name}</strong> from <strong>{department_name or 'Department Staff'}</strong> has completed their assigned work for Ticket <strong>#{complaint_id}</strong>: "<em>{complaint_title}</em>".</p>
            {remarks_section}
            <p>Status: <span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: bold;">RESOLVED</span></p>
            <p>Please review the completed ticket and completion proof in the Administrator Dashboard.</p>
            <br/>
            <p>Automated Alert,</p>
            <p>JNTU-GV SmartCampus System Operations</p>
        </body>
    </html>
    """
    body_text = f"Work Completed Alert: Ticket #{complaint_id} '{complaint_title}' has been RESOLVED by staff member {staff_name} ({department_name or 'Department Staff'}).\nRemarks: {remarks or 'None'}\nPlease review in Admin Dashboard."
    return send_email(subject, admin_email, body_html, body_text)

