# Hospital Management System

A full-stack hospital management application with role-based dashboards for **admins**, **doctors**, and **patients**. The frontend is a React SPA; the backend is a Django REST API with JWT authentication and SQLite for development.

## Features

| Role | Capabilities |
|------|----------------|
| **Patient** | Dashboard, appointments, profile (password change on profile) |
| **Doctor** | Schedule, patient list, appointments, prescriptions and lab report uploads |
| **Admin** | Hospital overview, departments, doctors, patients, appointments, inventory, analytics (Chart.js) |

Shared capabilities include user registration, email/password login, and JWT-protected API access scoped by user type.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, React Router 7, Axios, Chart.js, react-feather, Create React App |
| **Backend** | Django 5.2, Django REST Framework, Simple JWT, django-cors-headers |
| **Database** | SQLite (default in development) |

## Project structure

```
hospital_management_system/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── myproject/          # Django project (settings, root URLs, JWT)
│   └── app/                  # Main app: models, migrations, REST API
│       └── api/              # ViewSets, serializers, auth endpoints
└── frontend/
    ├── package.json
    ├── public/
    └── src/
        ├── App.jsx           # Routes
        └── pages/
            ├── Index.jsx     # Landing, login, shared auth context
            ├── Signup.jsx
            ├── Admin.jsx
            ├── Doctor.jsx
            ├── Patient.jsx
            └── axios_exp.jsx # Axios instance + JWT interceptor
```

## Prerequisites

- **Python** 3.10+ (Django 5.2)
- **Node.js** 18+ and npm
- **PowerShell** (commands below are written for Windows)

## Backend setup

From the repository root, in **PowerShell**:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API runs at **http://127.0.0.1:8000/**.

If `Activate.ps1` is blocked, run once (Current User):  
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Backend notes

- **CORS** allows `http://localhost:3000` with credentials (`backend/myproject/settings.py`).
- **Media uploads** (lab reports, prescriptions) are served under `/media/` when `DEBUG=True`.
- **`requirements.txt` cleanup:** Remove the invalid lines `posts` and `stripe` before `pip install` if pip errors. There is no `posts` Django app in this repo—remove `'posts'` from `INSTALLED_APPS` in `backend/myproject/settings.py` if Django fails to start with `ModuleNotFoundError: No module named 'posts'`.


## Frontend setup

In a **second PowerShell** window, from the repository root:

```powershell
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000/**.

The Axios client uses **`http://127.0.0.1:8000/api/`** as the base URL (`frontend/src/pages/axios_exp.jsx`). Keep the Django server on port 8000, or update that base URL and CORS origins together.

## Running the full stack

1. Backend (PowerShell, `backend/` with venv active): `python manage.py runserver`
2. Frontend (PowerShell, `frontend/`): `npm start`
3. Open **http://localhost:3000**, sign up or log in; you are routed by role to `/admin`, `/doctor`, or `/patient`.

## Frontend routes

| Path | Page |
|------|------|
| `/`, `/index` | Landing and login |
| `/signup` | Registration (patient, doctor, or admin) |
| `/admin` | Admin dashboard |
| `/doctor` | Doctor dashboard |
| `/patient` | Patient dashboard |

Auth state and JWT access tokens are stored in `localStorage` (`token`, `userData`, `isAuthenticated`). Login stores the **access** token in `token` (see `frontend/src/pages/Index.jsx`).

## API overview

Base path: **`/api/`** (included from `backend/myproject/urls.py` → `backend/myproject/api/urls.py` → `backend/app/api/urls.py`).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create user + role profile; returns JWT |
| POST | `/api/auth/login/` | Login with email/password; returns JWT and `role` |
| POST | `/api/auth/login/doctor/` | Doctor-specific login |
| GET | `/api/auth/profile/` | Current user profile (authenticated) |
| POST | `/api/token/` | Obtain JWT pair (Simple JWT) |
| POST | `/api/token/refresh/` | Refresh access token |

### REST resources (JWT required by default)

Registered via DRF routers in `backend/app/api/urls.py`:

- `posts/`, `admins/`, `departments/`, `doctors/`, `doctor-appointments/`
- `appointments/`, `patients/`
- `patient-labreports/`, `patient-prescriptions/`, `patient-bills/`, `patient-paymenthistory/`
- `payments/`, `inventory/`

Querysets are filtered by logged-in user type (admin, doctor, or patient) in the API viewsets.

### Additional endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST, PUT, PATCH | `/api/patients/<patient_id>/change-password/` | Logged-in **patient** changes their own password |

**Change password details**

- `<patient_id>` is the patient’s **`id_from_login`** primary key (same value as `patient.id_from_login` in the patient profile UI—not the Django `User.id`).
- **Headers:** `Authorization: Bearer <access_token>`
- **JSON body:** `current_password`, `new_password`
- **Success:** `200` with `{ "message": "Password updated successfully!" }`
- **Errors:** `403` if the token user does not own that patient profile; `400` for missing fields or wrong current password.

Example (PowerShell, after login):

```powershell
$body = @{ current_password = "old"; new_password = "new" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/patients/1/change-password/" `
  -Method Post -Body $body -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer YOUR_ACCESS_TOKEN" }
```

Other non-router routes exist in code (`POST /api/create-payment-session/`) but are not documented here as a supported product feature.

## Data model (summary)

Core entities in `backend/app/models.py`:

- **User** (custom `AbstractUser`) with `user_type`: patient, doctor, admin
- **Admin**, **Doctor**, **Patient**, **Departments**
- **Appointment** (status, department, optional lab report and prescription files)
- **Patient** sub-records: lab reports, prescriptions, bills, payment history (API available; some patient UI sections are not enabled in `Patient.jsx`)
- **InventoryItem** (admin inventory)

## Django admin

After `createsuperuser`, use **http://127.0.0.1:8000/admin/** for database administration.

## Development tips

- Use **Bearer** tokens: the frontend attaches `Authorization: Bearer <access>` on API requests.
- Default API permission is **`IsAuthenticated`**; registration and login views allow anonymous access.
- For production: set `DEBUG=False`, configure `ALLOWED_HOSTS`, use a production database, move secrets to environment variables, and serve the React build or configure a proper deployment proxy.

## Contributors

- **Backend:** Sarathchandrapalukuru  
- **Frontend:** kirankriteen  
- **Database design:** manishp608  

## issues:
- need to fill all the data to update.
- admin is not setup properly and project is rushed to complete so, a lot of issues are there.

