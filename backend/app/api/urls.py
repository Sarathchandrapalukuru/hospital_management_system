# from django.urls import path
# from rest_framework.routers import DefaultRouter
# from .views import PostViewSet



# from rest_framework.routers import DefaultRouter


# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# # from .views import (
# #     PostViewSet, AdminViewSet,
# #     DepartmentViewSet, DoctorViewSet, DoctorAppointmentsViewSet,
# #     PatientViewSet, AppointmentViewSet,
# #     PatientLabReportsViewSet, PatientPrescriptionsViewSet,
# #     PatientBillsViewSet, PatientPaymentHistoryViewSet,
# # )
# from .views import *

# # ---------------------------------------
# # ROUTER REGISTRATION
# # ---------------------------------------
# router = DefaultRouter()

# # Basic
# router.register(r'posts', PostViewSet)


# # User & Admin
# router.register(r'admins', AdminViewSet)
# router.register(r'appointments', AppointmentViewSet)


# # Departments & Doctors
# router.register(r'departments', DepartmentViewSet)
# router.register(r'doctors', DoctorViewSet)
# router.register(r'doctor-appointments', DoctorAppointmentsViewSet)

# # Patients
# router.register(r'patients', PatientViewSet)

# # Patient Sub-Models
# router.register(r'patient-labreports', PatientLabReportsViewSet)
# router.register(r'patient-prescriptions', PatientPrescriptionsViewSet)
# router.register(r'patient-bills', PatientBillsViewSet)
# router.register(r'patient-paymenthistory', PatientPaymentHistoryViewSet)

# # ---------------------------------------
# # URL PATTERNS
# # ---------------------------------------


# from .views import register_user, login_user, get_user_profile,change_patient_password,doctor_login


# urlpatterns = [
#     path('', include(router.urls)),
#      path('register/', register_user, name='register'),
#     path('login/', login_user, name='login'),
#     path('profile/', get_user_profile, name='profile'),
#      path('patients/<int:patient_id>/change-password/', change_patient_password, name='change-patient-password'),
#      path('login/doctor/', doctor_login, name='doctor-login'),

# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSets
    PostViewSet, AdminViewSet, DepartmentViewSet, DoctorViewSet, DoctorAppointmentsViewSet,
    PatientViewSet, AppointmentViewSet,
    PatientLabReportsViewSet, PatientPrescriptionsViewSet,
    PatientBillsViewSet, PatientPaymentHistoryViewSet,CreateRazorpayOrderView,PaymentViewSet,InventoryItemViewSet,

    # Auth views
    register_user, login_user, get_user_profile,
    change_patient_password, doctor_login
)

# ---------------------------------------
# ROUTER REGISTRATION
# ---------------------------------------
router = DefaultRouter()

# Basic
router.register(r'posts', PostViewSet)

# User & Admin
router.register(r'admins', AdminViewSet)
router.register(r'appointments', AppointmentViewSet)

# Departments & Doctors
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'doctor-appointments', DoctorAppointmentsViewSet)

# Patients
router.register(r'patients', PatientViewSet)

# Patient Sub-Models
router.register(r'patient-labreports', PatientLabReportsViewSet)
router.register(r'patient-prescriptions', PatientPrescriptionsViewSet)
router.register(r'patient-bills', PatientBillsViewSet)
router.register(r'patient-paymenthistory', PatientPaymentHistoryViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'inventory', InventoryItemViewSet, basename='inventory')

# ---------------------------------------
# URL PATTERNS
# ---------------------------------------
urlpatterns = [
    path('', include(router.urls)),

    # Authentication & Profile
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/login/doctor/', doctor_login, name='doctor-login'),
    path('auth/profile/', get_user_profile, name='profile'),
    path('create-payment-session/', CreateRazorpayOrderView.as_view(), name='create-payment-session'),

    # Password Management
    path('patients/<int:patient_id>/change-password/', change_patient_password, name='change-patient-password'),
]

