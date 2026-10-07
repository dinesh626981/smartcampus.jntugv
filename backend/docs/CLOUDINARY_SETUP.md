# Cloudinary Image Storage & Compression Integration Guide

This guide explains how to set up Cloudinary image storage, configure client-side and server-side image optimization, and manage storage cleanup in the **Smart College Issue Reporting & Management System** backend microservice.

---

## 1. Cloudinary Free Plan Overview

Cloudinary provides a generous **Free Tier** suitable for institutional deployments:
- **25 Monthly Credits** (1 credit = 1 GB managed storage, 1 GB net egress bandwidth, or 1,000 image transformations).
- HTTPS delivery with dynamic format and quality negotiation (`f_auto,q_auto`).
- Zero credit card required for registration.

---

## 2. Obtaining Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com) and click **Sign Up For Free**.
2. Complete account registration and log into the **Cloudinary Console**.
3. On your **Dashboard**, find the **Product Environment Credentials** card containing:
   - **Cloud Name** (e.g. `dxy7abc12`)
   - **API Key** (e.g. `981273918273912`)
   - **API Secret** (e.g. `aB_CdEfGhIjKlMnOpQrStUvWxYz`)

---

## 3. Environment Configuration

Add the following three variables to your `backend/.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

> **Note:** Never commit the `.env` file or your `CLOUDINARY_API_SECRET` to version control.

---

## 4. Architecture & Compression Pipeline

### A. Client-Side Image Compression (`browser-image-compression`)
- Runs in a background WebWorker to prevent UI freezing during file selection.
- Raw file upload limit raised from **5MB to 15MB**.
- Automatic downscaling and compression targets files under **400KB** at JPEG 80% quality.
- Displays immediate visual feedback (e.g. `5.4 MB → 310 KB (-94%)`).

### B. Server-Side Normalization (`Pillow`)
- Inspects EXIF metadata and applies orientation transpositions via `ImageOps.exif_transpose`.
- Normalizes color channels to RGB (handling RGBA and paletted images).
- Enforces an upper dimension boundary of **1600×1600** using Lanczos resampling.
- Streams compressed `io.BytesIO` directly to Cloudinary (`complaints/before` and `complaints/proof`).
- No local storage dependency in production ephemeral container or serverless environments.

### C. CDN Delivery Transformations
- Dynamic transformation parameters `f_auto,q_auto,w_{width},c_limit` are injected into media URLs.
- Thumbnails for lists and cards are capped at `w_300`.
- Detailed grievance evidence cards are rendered at `w_900`.
- Full-screen lightbox modals load up to `w_1600`.

---

## 5. Administrative Storage Manager (`/admin/storage`)

Admins can monitor storage quotas and execute media cleanups from the web UI:

1. **Quota Meter**: Displays real-time credit consumption against the 25 credit limit with warning thresholds (Emerald <70%, Amber 70–89%, Rose ≥90%).
2. **Preview Mode**: Filters resolved and closed complaints older than 15, 30, 60, 90, or 180 days to compute candidate file counts and estimated reclaimed megabytes.
3. **ZIP Backup**: Generates an in-memory downloadable archive (`complaints_backup_*.zip`) containing images and a JSON audit manifest prior to purge.
4. **Permanent Purge**: Requires typing the confirmation keyword `DELETE` to execute batch deletion (`cloudinary.api.delete_resources(batch, invalidate=True)`).
5. **Safety Invariants**:
   - Active tickets (`Pending`, `Assigned`, `In Progress`) are **strictly protected** from deletion.
   - Deleted images display a clear historical notice: `"Image removed to free up storage on {date}"`.
   - Ticket text, metadata, technician logs, and student ratings remain completely intact.

---

## 6. Profile Photos: Permanent Asset Protection & Google Import

### A. Two Separate Asset Classes
1. **Complaint Images (`complaints/*`)**:
   - Folders: `complaints/before` and `complaints/proof`.
   - Reclaimable: eligible for administrative storage cleanup when complaints are resolved/closed.
2. **Profile Photos (`profiles/*`)**:
   - Folder: `profiles` only (`profiles/user_{id}`).
   - **Permanent & Protected**: Never touched, listed, or deleted by admin cleanup or bulk purge.
   - Tagged: `['protected', 'profile']`.
   - Managed strictly by account owner (`POST /api/profile/photo` and `DELETE /api/profile/photo`).

### B. Admin Cleanup Allow-List Isolation
- **Explicit Allow-List:** Administrative cleanup queries only the `Complaint` table columns `image_public_id` and `completion_image_public_id`. The `User` model is never queried by cleanup.
- **Server Guard:** Both `delete_image()` and `delete_images_batch()` strictly filter for `complaints/` prefixes. Any `profiles/` ID passed to cleanup code is immediately rejected, logged with a security alert, and reported in the API response as `blocked_protected: n`.
- **Prohibited Operations:** The codebase strictly avoids `delete_resources_by_prefix`, `delete_all_resources`, or tag-based deletion.
