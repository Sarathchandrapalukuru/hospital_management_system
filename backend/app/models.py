
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# ---------------------------------------
# POSTS
# ---------------------------------------
class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()

    def __str__(self):
        return f"Post: {self.title}"


# ---------------------------------------
# DEPARTMENTS, ADMIN & DOCTORS
# ---------------------------------------
class Departments(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=150)

    def __str__(self):
        return self.name


# ---------------------------------------
# CUSTOM USER
# ---------------------------------------
class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=40)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='PATIENT')

    def __str__(self):
        return self.username


# ---------------------------------------
# ADMIN MODEL
# ---------------------------------------
class Admin(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"Admin: {self.name}"


class InventoryItem(models.Model):
    admin = models.ForeignKey(
        'Admin',  # Reference to the Admin model
        on_delete=models.CASCADE,
        related_name='inventory_items'  # Related name to get all inventory items of an admin
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.quantity} in stock)"

# ---------------------------------------
# DOCTOR MODEL
# ---------------------------------------
class Doctor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='doctors', null=True)
    availability = models.CharField(max_length=60, null=True, blank=True)
    name = models.CharField(max_length=40, null=True)
    dob = models.DateField(null=True)
    phone_number = models.CharField(max_length=12, null=True)
    specialty = models.ForeignKey(Departments, on_delete=models.CASCADE, related_name='doctors', null=True)
    doctor_id = models.IntegerField(unique=True, null=True)
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    gender = models.CharField(max_length=30, choices=GENDER_CHOICES, default='male')

    def __str__(self):
        return self.name or f"Doctor {self.doctor_id}"


# ---------------------------------------
# PATIENT MODEL
# ---------------------------------------
class Patient(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile',
        null=True
    )
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='patients', null=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='patients', null=True)
    email = models.EmailField(unique=True,null=True)
    name = models.CharField(max_length=40)
    dob = models.DateField(null=True)
    phone_number = models.CharField(max_length=12)
    id_from_login = models.AutoField(primary_key=True)
    last_visit = models.DateField(null=True)
    primary_diagnosis = models.CharField(max_length=400, null=True)

    def __str__(self):
        return self.name


# ---------------------------------------
# APPOINTMENTS
# ---------------------------------------
class Appointment(models.Model):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='appointments', null=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    datetime = models.DateTimeField(default=timezone.now)
    reason = models.CharField(max_length=300)
    department = models.ForeignKey(Departments, on_delete=models.CASCADE, related_name='appointments')
    STATUS_CHOICES = [('pending', 'Pending'), ('upcoming', 'Upcoming'), ('completed', 'Completed')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # NEW FILE FIELDS
    lab_report = models.FileField(upload_to='lab_reports/', null=True, blank=True)
    prescription = models.FileField(upload_to='prescriptions/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.patient.name} - {self.datetime}"


# ---------------------------------------
# PATIENT SUBMODELS
# ---------------------------------------
class PatientLabReport(models.Model):
    bloodtest_name = models.CharField(max_length=40)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='labreports', null=True)
    STATUS_CHOICES = [('available', 'Results Available'), ('unavailable', 'Results Unavailable')]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='available')
    file = models.FileField(upload_to='app/files')

    def __str__(self):
        return self.bloodtest_name


class PatientPrescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    medication_name = models.CharField(max_length=50)
    dosage = models.IntegerField()
    frequency = models.CharField(max_length=20)
    date = models.DateField(default=timezone.now)
    STATUS_CHOICES = [('active', 'Active'), ('expired', 'Expired')]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return self.medication_name


class PatientBill(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    invoice_id = models.CharField(max_length=10, primary_key=True)
    date = models.DateField(null=True)
    amount = models.IntegerField()
    STATUS_CHOICES = [('due', 'Due'), ('paid', 'Paid')]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='due')

    def __str__(self):
        return f"Bill {self.invoice_id} - {self.status}"


class PatientPaymentHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='payment_history')
    transaction_id = models.CharField(max_length=10, primary_key=True)
    date = models.DateField(null=True)
    amount = models.IntegerField()
    METHOD_CHOICES = [('credit card', 'Credit card'), ('upi', 'UPI'), ('debit card', 'Debit card')]
    method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='upi')

    def __str__(self):
        return f"{self.transaction_id} - {self.method}"


# ---------------------------------------
# DOCTOR SUBMODELS
# ---------------------------------------
class DoctorAppointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='doctor_appointments')
    STATUS_CHOICES = [('upcoming', 'Upcoming'), ('completed', 'Completed')]
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='upcoming')

    def __str__(self):
        return f"{self.doctor.name} - {self.status}"


class Payment(models.Model):
    appointment = models.OneToOneField(
        'Appointment', 
        on_delete=models.CASCADE, 
        related_name='payment',
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2,default=0.00)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed')],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Dynamic property to get the user who should pay
    @property
    def user(self):
        """
        Returns the actual Django user associated with this payment
        via appointment -> patient -> user.
        """
        if self.appointment and self.appointment.patient:
            return self.appointment.patient.user
        return None
    
    def __str__(self):
        return f"Payment for {self.appointment.id if self.appointment else 'N/A'} - {self.amount} - {self.status}"
