# JNTU-GV SmartCampus Issue Reporting & Management System

A production-grade, enterprise campus issue reporting and facility management platform architected as two decoupled microservices:
1. **Backend Microservice (`backend/`)**: Python Flask REST API with SQLAlchemy ORM, PyJWT authentication, Google Gemini AI automated classification, Cloudinary CDN storage with permanent user profile protection, and Google Identity Services OAuth verification.
2. **Frontend Microservice (`frontend/`)**: React 18 SPA built with Vite, Tailwind CSS, and Google Material 3 Design tokens.

---

## 🔗 Live Deployment & Repository Links

| Target | URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **🚀 Vercel Production Frontend** | [https://frontend-six-gilt-19.vercel.app](https://frontend-six-gilt-19.vercel.app) | `Active` | Production React SPA deployed on Vercel Edge CDN |
| **🌐 Vercel Direct Build** | [https://frontend-90h7p5rlk-dinesh626981.vercel.app](https://frontend-90h7p5rlk-dinesh626981.vercel.app) | `Active` | Production immutable deployment instance |
| **⚙️ Render Backend API** | `https://smartcampus-backend.onrender.com` | `Production` | Gunicorn WSGI Python API microservice |
| **💻 Local Frontend Client** | [http://localhost:5173](http://localhost:5173) | `Local Dev` | Vite local development server |
| **🔌 Local Backend REST API** | [http://127.0.0.1:5001](http://127.0.0.1:5001) | `Local Dev` | Flask REST API service with auto-seeding |
| **📦 GitHub Repository** | [smart-college-issue-reporting-and-management-system-](https://github.com/dinesh626981/smart-college-issue-reporting-and-management-system-) | `Main` | Source code repository |

---

## ✨ System Capabilities & Highlights

### 1. Google Material 3 UI / UX
- **Design Tokens**: Standardized CSS variable architecture supporting light and dark themes based on Google Material 3 (M3).
- **Typography & Surfaces**: Built using Figtree / Google Sans typography with 16px cards, 28px dialogs, 4px floating-label text inputs, and full pill-shaped action buttons.
- **Analytics Visuals**: Operational telemetry and status charts powered by Chart.js adhering to Google M3 color tokens and surface palettes.

### 2. Role-Based Portals & Workflows
- **🎓 Student Portal**:
  - Lodge complaints with client-side WebWorker image compression (`browser-image-compression` targeting <400 KB).
  - Real-time status tracking timeline (`Pending` → `Assigned` → `In Progress` → `Resolved` → `Closed`).
  - Star ratings and satisfaction feedback upon grievance resolution.
  - Interactive Gemini AI grievance assistant chatbot with quick suggested prompts.
  - Profile customization with interactive photo cropping (1x–3x zoom, square boundary).
- **🛠️ Staff & Technician Portal**:
  - Filtered task dispatch queues organized by status and department priority.
  - Progress tracking with state progression and technician resolution notes.
  - Mandatory completion proof upload with automatic EXIF orientation normalization.
  - Real-time notification dispatch to administrators upon grievance completion.
- **👑 Administrator Command Center**:
  - System-wide metric cards, department efficiency breakdowns, and workload distributions.
  - Global complaint management with technician assignment dialogs and priority escalation.
  - Student and staff credential administration with CSV data exports.
  - Automated administrative storage manager with Cloudinary quota tracking, preview mode, ZIP image backups, and selective complaint image purge.

### 3. Dual Asset Storage Strategy (Cloudinary CDN)
- **Complaint Images (`complaints/*`)**:
  - Stored under `complaints/before` and `complaints/proof`.
  - Reclaimable: Eligible for administrative storage cleanup when complaints are resolved/closed older than the selected retention period.
- **Profile Photos (`profiles/*`)**:
  - Stored strictly under `profiles/user_{id}` and tagged `['protected', 'profile']`.
  - **Permanently Protected**: Completely isolated from administrative cleanup and purge actions through strict server-side allow-lists (`complaints/` prefix enforcement).
  - Can only be updated or deleted by the account owner.

### 4. Google Identity Services (OAuth 2.0 ID Token Flow)
- **Authentication-Only Policy**: Google Sign-In operates strictly for login; it never auto-registers accounts, guaranteeing that every user possesses an official department and registration ID.
- **Cryptographic Verification**: ID tokens are verified directly against Google public RSA keys via `google.oauth2.id_token.verify_oauth2_token`.
- **First-Login Avatar Sync**: Automatically imports verified Google profile pictures into the Cloudinary `profiles/` directory on first login if no custom photo was uploaded.

---

## 🏗️ Isolated Microservices Architecture

```
smart-college-system/
├── backend/                            # Python Flask Microservice (REST API)
│   ├── app.py                         # Application Factory & Service Entrypoint
│   ├── config.py                      # Configuration container & URI normalization
│   ├── requirements.txt               # Backend dependencies
│   ├── Procfile                       # Gunicorn deployment process specification
│   ├── render.yaml                    # Standalone Render deployment blueprint
│   ├── .env                           # Local environment secrets
│   ├── .env.example                   # Environment variable template
│   ├── .flake8                        # Flake8 Python linting rules
│   ├── pyproject.toml                 # Black & isort formatter configuration
│   ├── CLOUDINARY_SETUP.md            # Cloudinary storage & asset protection guide
│   ├── GOOGLE_AUTH_SETUP.md           # Backend Google token verification guide
│   ├── .gitignore                     # Python-specific ignore patterns
│   ├── ai/                            # Gemini AI models & classifiers
│   ├── middleware/                    # JWT auth & role validation middleware
│   ├── models/                        # SQLAlchemy ORM domain models
│   ├── routes/                        # REST API controller blueprints
│   ├── services/                      # Domain services (auth, complaint, storage, etc.)
│   ├── utils/                         # Database helpers & Cloudinary services
│   └── tests/                         # Automated test suites
│
├── frontend/                           # React 18 + Vite Single Page Application
│   ├── package.json                   # Node dependencies & build scripts
│   ├── vite.config.js                 # Vite configuration with chunk splitting & proxy
│   ├── vercel.json                    # Vercel SPA routing rules and cache headers
│   ├── tailwind.config.js             # Material 3 Tailwind color extensions
│   ├── .env                           # Frontend environment (VITE_API_URL, etc.)
│   ├── .env.example                   # Frontend environment template
│   ├── .eslintrc.cjs                  # ESLint frontend rules
│   ├── .prettierrc                    # Prettier formatting rules
│   ├── .gitignore                     # Node/dist ignore rules
│   ├── GOOGLE_AUTH_SETUP.md           # Frontend Google button setup guide
│   ├── DESIGN.md                      # Google Material 3 Design specification
│   └── src/                           # Components, pages, hooks, services
│
├── README.md                           # Monorepo documentation
└── REFACTOR_REPORT.md                  # Comprehensive refactoring & audit report
```

---

## 👥 Default Demo Credentials

The login page (`/login`) includes **1-Click Auto-Fill** buttons for immediate role testing:

| Role | Identifier | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **👑 System Administrator** | `admin@college.com` | `admin123` | Full administrative oversight, storage management & analytics |
| **🛠️ Department Staff** | `staff@college.com` *(or `9876543212`)* | `staff123` | Task dispatch queue, progress updates & proof submission |
| **🎓 Student** | `student@college.com` *(or `9876543211`)* | `student123` | Grievance lodging, status tracking & AI assistant |

*New Administrator accounts can also be registered at `/register?role=admin` using the Security Key: `admin123`.*

---

## 💻 Local Development Setup

### 1. Backend Service Setup (Flask API)
```powershell
# Navigate to the backend service
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows PowerShell
# source venv/bin/activate     # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env

# Start the Flask backend (runs on http://127.0.0.1:5001)
python app.py
```
*Health check endpoint: `http://127.0.0.1:5001/health`*

### 2. Frontend Service Setup (React + Vite)
In a separate terminal:
```powershell
# Navigate to the frontend service
cd frontend

# Install Node dependencies
npm install

# Configure environment variables
copy .env.example .env

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🚀 Production Deployment Guide

### A. Deploy Backend to Render
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service** and connect this repository:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT --timeout 120`
   - **Health Check Path**: `/health`
3. Provision a **Render PostgreSQL Database** and add `DATABASE_URL` to environment variables.
4. Set backend secrets in Render (`SECRET_KEY`, `CORS_ORIGINS`, `CLOUDINARY_*`, `GOOGLE_CLIENT_ID`, `LLM_API_KEY`).

### B. Deploy Frontend to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project** and select this repository.
3. Set **Root Directory**: `frontend`.
4. Add environment variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
5. Click **Deploy**.

---

## 📚 Supplementary Documentation

- 🖼️ **[Cloudinary Storage & Profile Protection Guide](backend/CLOUDINARY_SETUP.md)**: Details on the client compression pipeline, server normalization, and permanent profile photo protection.
- 🔑 **[Backend Google Identity Services Guide](backend/GOOGLE_AUTH_SETUP.md)**: Technical walk-through for cryptographic token verification.
- 🔑 **[Frontend Google Identity Services Guide](frontend/GOOGLE_AUTH_SETUP.md)**: Instructions for the frontend button integration.
- 🎨 **[Google Material 3 Design Specification](frontend/DESIGN.md)**: Detailed specification for tokens, typography scales, surfaces, and component characteristics.
- 📋 **[Refactor Report](REFACTOR_REPORT.md)**: Comprehensive report documenting the 11-phase refactoring pass.
