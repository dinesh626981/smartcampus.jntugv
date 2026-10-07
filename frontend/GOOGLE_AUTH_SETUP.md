# Google Identity Services Setup Guide - Frontend Microservice

This document outlines frontend client configuration for Google Identity Services in the **Smart College Issue Reporting & Management System**.

---

## 1. Environment Variables Configuration (`frontend/.env`)

Configure the following variable in `frontend/.env`:

```bash
# Public Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# Backend Microservice Endpoint
VITE_API_URL=http://127.0.0.1:5001/api
```

---

## 2. Deployment (Vercel)

1. In Vercel Project Settings > **Environment Variables**:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
   - `VITE_API_URL`: Live Render backend URL (e.g., `https://smartcampus-backend.onrender.com/api`).
2. Add your Vercel production domain to **Authorized JavaScript origins** in Google Cloud Console Credentials.
