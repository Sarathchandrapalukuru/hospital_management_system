

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from ..models import *
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
# (
#     Post, Departments, Admin, Doctor, Patient,
#     Appointment, Patient_LabReports, Patient_prescriptions,
#     Patient_Bills, Patient_paymenthistory, Doctor_appointments
# )
from .serializers import *
    # (# PostSerializer, DepartmentSerializer, AdminSerializer,
    # # DoctorSerializer, PatientSerializer, AppointmentSerializer,
    # # PatientLabReportsSerializer, PatientPrescriptionsSerializer,
    # # PatientBillsSerializer, PatientPaymentHistorySerializer,
    # # DoctorAppointmentsSerializer, UserSerializer
    # )


# ------------------------------
# JWT TOKEN GENERATOR
# ------------------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def _user_type(user):
    """Normalize role strings like 'PATIENT' and 'patient' to the same value."""
    return (user.user_type or '').lower()


def _get_admin(user):
    try:
        return Admin.objects.get(user=user)
    except Admin.DoesNotExist:
        return None


def _get_patient(user):
    try:
        return Patient.objects.get(user=user)
    except Patient.DoesNotExist:
        return None


def _get_doctor(user):
    try:
        return Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return None


# ------------------------------
# GENERIC MODEL VIEWSETS (scoped per logged-in user)
# ------------------------------
class PostViewSet(ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]


class AdminViewSet(ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Each admin only sees their own profile.
        return Admin.objects.filter(user=self.request.user)


class DepartmentViewSet(ModelViewSet):
    queryset = Departments.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Departments are shared hospital metadata (not private patient data).
        return Departments.objects.all()


class DoctorViewSet(ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'admin':
            # Hospital admin sees every doctor in the system
            return Doctor.objects.all()
        if ut == 'doctor':
            return Doctor.objects.filter(user=user)
        if ut == 'patient':
            patient = _get_patient(user)
            if patient and patient.admin_id:
                return Doctor.objects.filter(admin=patient.admin)
            return Doctor.objects.all()
        return Doctor.objects.none()

    def perform_create(self, serializer):
        admin = _get_admin(self.request.user)
        if not admin:
            raise PermissionDenied("Only admins can add doctors.")
        serializer.save(admin=admin)


class DoctorAppointmentsViewSet(ModelViewSet):
    queryset = DoctorAppointment.objects.all()
    serializer_class = DoctorAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        doctor = _get_doctor(self.request.user)
        if doctor:
            return DoctorAppointment.objects.filter(doctor=doctor)
        return DoctorAppointment.objects.none()


class PatientViewSet(ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'admin':
            # Hospital admin sees every patient in the system
            return Patient.objects.all()
        if ut == 'patient':
            return Patient.objects.filter(user=user)
        if ut == 'doctor':
            doctor = _get_doctor(user)
            if doctor:
                return Patient.objects.filter(doctor=doctor)
            return Patient.objects.none()
        return Patient.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        ut = _user_type(user)
        kwargs = {}
        if ut == 'patient':
            kwargs['user'] = user
        elif ut == 'admin':
            admin = _get_admin(user)
            if not admin:
                raise PermissionDenied("Admin profile not found.")
            kwargs['admin'] = admin
        else:
            raise PermissionDenied("You are not allowed to create patient records.")
        serializer.save(**kwargs)


class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'admin':
            return Appointment.objects.all()
        if ut == 'patient':
            patient = _get_patient(user)
            if patient:
                return Appointment.objects.filter(patient=patient)
            return Appointment.objects.none()
        if ut == 'doctor':
            doctor = _get_doctor(user)
            if doctor:
                return Appointment.objects.filter(doctor=doctor)
            return Appointment.objects.none()
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        ut = _user_type(user)
        kwargs = {}
        if ut == 'patient':
            patient = _get_patient(user)
            if not patient:
                # Repair accounts that have a User but no linked Patient row
                patient = Patient.objects.create(
                    user=user,
                    name=user.name or user.username,
                    email=user.email,
                    phone_number='0000000000',
                )
            kwargs['patient'] = patient
        elif ut == 'admin':
            admin = _get_admin(user)
            if not admin:
                raise PermissionDenied("Admin profile not found.")
            kwargs['admin'] = admin
            if not serializer.validated_data.get('patient'):
                raise PermissionDenied("Patient is required when booking as admin.")
        else:
            raise PermissionDenied("You are not allowed to book appointments.")
        serializer.save(**kwargs)


class _PatientOwnedViewSet(ModelViewSet):
    """Base queryset: only records belonging to the logged-in patient's profile."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'patient':
            patient = _get_patient(user)
            if patient:
                return self.queryset.model.objects.filter(patient=patient)
            return self.queryset.model.objects.none()
        if ut == 'admin':
            admin = _get_admin(user)
            if admin:
                return self.queryset.model.objects.filter(patient__admin=admin)
            return self.queryset.model.objects.none()
        if ut == 'doctor':
            doctor = _get_doctor(user)
            if doctor:
                return self.queryset.model.objects.filter(patient__doctor=doctor)
            return self.queryset.model.objects.none()
        return self.queryset.model.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'patient':
            patient = _get_patient(user)
            if not patient:
                raise PermissionDenied("Patient profile not found.")
            serializer.save(patient=patient)
        elif ut == 'admin':
            admin = _get_admin(user)
            if not admin:
                raise PermissionDenied("Admin profile not found.")
            serializer.save()
        else:
            raise PermissionDenied("You are not allowed to create this record.")


class PatientLabReportsViewSet(_PatientOwnedViewSet):
    queryset = PatientLabReport.objects.all()
    serializer_class = PatientLabReportsSerializer


class PatientPrescriptionsViewSet(_PatientOwnedViewSet):
    queryset = PatientPrescription.objects.all()
    serializer_class = PatientPrescriptionsSerializer


class PatientBillsViewSet(_PatientOwnedViewSet):
    queryset = PatientBill.objects.all()
    serializer_class = PatientBillsSerializer


class PatientPaymentHistoryViewSet(_PatientOwnedViewSet):
    queryset = PatientPaymentHistory.objects.all()
    serializer_class = PatientPaymentHistorySerializer

# ------------------------------
# AUTHENTICATION ENDPOINTS
# ------------------------------


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name')
    user_type = (request.data.get('user_type') or 'patient').lower()

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        name=name,
        user_type=user_type
    )

    # Automatically create the corresponding role record
    if user.user_type == 'doctor':
        Doctor.objects.create(user=user, name=name)
    elif user.user_type == 'admin':
        Admin.objects.create(user=user, name=name, email=email)
    else:
        Patient.objects.create(user=user, name=name, email=email)

    tokens = get_tokens_for_user(user)

    return Response({
        'message': f'{user.user_type} created successfully',
        'id': user.id,
        'email': user.email,
        'username': username,
        'tokens': tokens
    }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user:
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful',
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'role' : user.user_type,
                'tokens': tokens
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST', 'PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def change_patient_password(request, patient_id):
    """
    Allows a logged-in patient to change their own password.
    """
    patient = get_object_or_404(Patient, id_from_login=patient_id)

    # Ensure logged-in user owns this patient profile
    if patient.user != request.user:
        return Response({'error': 'You can only change your own password.'}, status=403)

    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response({'error': 'Both current and new passwords are required.'}, status=400)

    if not request.user.check_password(current_password):
        return Response({'error': 'Current password is incorrect.'}, status=400)

    request.user.set_password(new_password)
    request.user.save()

    return Response({'message': 'Password updated successfully!'}, status=200)

# @csrf_exempt
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def doctor_login(request):
#     email = request.data.get('email')
#     password = request.data.get('password')

#     try:
#         doctor = Doctor.objects.get(email=email)
#     except Doctor.DoesNotExist:
#         return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

#     user = authenticate(username=doctor.email, password=password)
#     if user is not None:
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             'id': doctor.id,
#             'email': doctor.email,
#             'tokens': {
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#             }
#         })
#     else:
#         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def doctor_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = User.objects.get(email=email, user_type='doctor')
    except User.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

    user = authenticate(username=user.username, password=password)
    if user is not None:
        tokens = get_tokens_for_user(user)  
        return Response({
            'id': user.id,
            'email': user.email,
            'user_type':user.user_type,
            'tokens': tokens
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class PaymentViewSet(ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ut = _user_type(user)
        if ut == 'patient':
            patient = _get_patient(user)
            if patient:
                return Payment.objects.filter(appointment__patient=patient)
            return Payment.objects.none()
        if ut == 'admin':
            admin = _get_admin(user)
            if admin:
                return Payment.objects.filter(appointment__admin=admin)
            return Payment.objects.none()
        if ut == 'doctor':
            doctor = _get_doctor(user)
            if doctor:
                return Payment.objects.filter(appointment__doctor=doctor)
            return Payment.objects.none()
        return Payment.objects.none()


import razorpay
from django.conf import settings
from rest_framework.views import APIView

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get("amount")  # Amount in rupees
        currency = "INR"

        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Razorpay requires amount in paise (1 INR = 100 paise)
        amount_in_paise = int(float(amount) * 100)

        try:
            razorpay_order = client.order.create({
                "amount": amount_in_paise,
                "currency": currency,
                "payment_capture": 1  # automatic capture
            })
            return Response({
                "order_id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"]
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        admin = _get_admin(self.request.user)
        if not admin:
            raise PermissionDenied("You must be an admin to view inventory items.")
        return InventoryItem.objects.filter(admin=admin)

    def perform_create(self, serializer):
        admin = _get_admin(self.request.user)
        if not admin:
            raise PermissionDenied("You are not allowed to create inventory items.")
        serializer.save(admin=admin)
