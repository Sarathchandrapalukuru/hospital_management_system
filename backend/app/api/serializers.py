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
    email = serializers.EmailField(source='user.email', required=False)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data and 'email' in user_data:
            instance.user.email = user_data['email']
            instance.user.save(update_fields=['email'])
        return super().update(instance, validated_data)


class PatientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_null=True)

    class Meta:
        model = Patient
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Fall back to linked User email when Patient.email is empty
        if not data.get('email') and instance.user_id:
            data['email'] = instance.user.email
        return data


class AppointmentSerializer(serializers.ModelSerializer):
    lab_report_url = serializers.SerializerMethodField()
    prescription_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'
        # patient/admin are set server-side for logged-in patients; admins send patient id
        extra_kwargs = {
            'patient': {'required': False},
            'admin': {'required': False},
        }
    
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
