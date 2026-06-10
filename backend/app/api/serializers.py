from rest_framework import serializers
# from django.contrib.auth.models import User
from ..models import *
#     Post, Departments, Admin, Doctor, Patient,
#     Appointment, Patient_LabReports,
#     Patient_prescriptions, Patient_Bills, Patient_paymenthistory,
#     Doctor_appointments
# )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Create the user
        user = User.objects.create_user(**validated_data)

        # Create related model automatically
        if user.user_type == 'doctor':
            Doctor.objects.create(
                name=user.name,
                email=user.email,
                admin=None,  # You can assign an Admin later if needed
            )
        elif user.user_type == 'patient':
            Patient.objects.create(
                name=user.name,
                email=user.email,
            )
        elif user.user_type == 'admin':
            Admin.objects.create(
                name=user.name,
                email=user.email,
            )

        return user


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = '__all__'


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    lab_report_url = serializers.SerializerMethodField()
    prescription_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'
    
    def get_lab_report_url(self, obj):
        if obj.lab_report:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.lab_report.url)
        return None

    def get_prescription_url(self, obj):
        if obj.prescription:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.prescription.url)
        return None


class PatientLabReportsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientLabReport
        fields = '__all__'


class PatientPrescriptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientPrescription
        fields = '__all__'


class PatientBillsSerializer(serializers.ModelSerializer):
    class Meta:
        model =PatientBill
        fields = '__all__'


class PatientPaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientPaymentHistory
        fields = '__all__'


class DoctorAppointmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAppointment
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'



class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'
        read_only_fields = ['date_added', 'date_updated']
