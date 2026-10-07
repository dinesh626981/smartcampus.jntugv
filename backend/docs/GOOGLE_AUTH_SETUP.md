# Google Identity Services (Sign in with Google) Setup Guide - Backend Service

This document outlines backend configuration for Google Identity Services in the **Smart College Issue Reporting & Management System**.

> [!IMPORTANT]
> **Authentication-Only Policy**: Google Sign-In operates strictly as a login mechanism. Google never creates or registers accounts. Every account must be provisioned via the registration form with an official **Registration Number** and **Department**.

---

## 1. Google Cloud Console Configuration

### Step 1: Create a Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Enter Project Name: `Smart College System` (or your institution's name) and click **Create**.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select User Type:
   - **Internal**: If your institution has Google Workspace and only domain users can access.
   - **External**: If using standard `@gmail.com` or non-workspace university emails.
3. Fill in required App Information:
   - **App name**: `JNTU-GV SmartCampus`
   - **User support email**: Your admin/support email.
   - **Developer contact information**: Your contact email.
4. Click **Save and Continue** through the Scopes screen (default scopes `email`, `profile`, `openid` are sufficient).
5. **Testing Mode Note**: While in "Testing" status, only Google accounts explicitly listed under **Test users** can sign in. Once ready for all students and staff, click **Publish App** to switch to "In production".

### Step 3: Create Web OAuth Client ID
1. In the left navigation, go to **Credentials**.
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Set **Name**: `Smart College Web Client`.
5. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - Development: `http://localhost:5173`
   - Development (IP): `http://127.0.0.1:5173`
   - Production: `https://your-frontend-deployment.vercel.app`
6. *Authorized redirect URIs*: **Leave empty**. (Google Identity Services ID-token button flow executes directly in the browser and does not require redirect URIs).
7. Click **Create**.
8. Copy the generated **Client ID** (e.g. `1234567890-abcdef123.apps.googleusercontent.com`).

---

## 2. Backend Environment Variables (`backend/.env`)

```bash
# Backend Google ID Token Audience Verification
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Optional: Restrict logins to institutional domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=jntugv.edu.in,college.edu

# Optional: Allow administrator accounts to use Google Sign-In (default is false)
ALLOWED_GOOGLE_ADMIN_LOGIN=false
```

---

## 3. Cryptographic Token Verification

1. **Zero Auto-Registration:**
   - The backend route `/api/auth/google` possesses no database `INSERT` commands.
   - If an unregistered Google email attempts login, it returns `404 ACCOUNT_NOT_REGISTERED` and prompts the user to complete student registration first.
2. **Cryptographic Token Verification:**
   - Client-provided user claims are never trusted. The backend verifies signature, expiration, and issuer directly using Google's public cryptographic keys via `google.oauth2.id_token.verify_oauth2_token`.
3. **Verified Email Requirement:**
   - `email_verified == true` is enforced on every token.
4. **Subject ID Binding (`google_sub`):**
   - Google's stable subject identifier is bound to the user record upon first login, preventing account hijacking or sub conflicts.
5. **Rate Limiting:**
   - The Google authentication endpoint is rate-limited to 10 requests per minute per IP to mitigate credential abuse.
