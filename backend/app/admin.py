from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Post)

# Simple registrations (basic admin view)
admin.site.register(Departments)
admin.site.register(User)

admin.site.register(Admin)
admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(PatientLabReport)
admin.site.register(PatientPrescription)
admin.site.register(PatientBill)
admin.site.register(PatientPaymentHistory)
admin.site.register(DoctorAppointment)




# @admin.register(Doctor)
# class DoctorAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'phone_number', 'specialty')
#     search_fields = ('name', 'phone_number')
#     list_filter = ('specialty',)
