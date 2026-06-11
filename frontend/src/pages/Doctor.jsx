import React, { useState, useEffect, setLoading } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Clock, Settings, LogOut, Menu, User, FileText, X } from 'react-feather';
import axios from 'axios';
import { useTransfer } from './Index';
import api from './axios_exp';

// Import the new stylesheet
import './Doctor.css';

// --- Static Data (in a real app, this would come from an API) ---
const patientsData = {
  'John Doe': { id: '#P001', gender: 'Male', blood: 'O+', visit: 'Dec 12, 2024', diagnosis: 'Hypertension' },
  'Jane Smith': { id: '#P002', gender: 'Female', blood: 'A-', visit: 'Dec 10, 2024', diagnosis: 'Diabetes Type 2' },
};
// src/api/axios.js

// Create instance




function Doctor() {

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, setUserData } = useTransfer();

  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctor, setDoctor] = useState([]);
  const navigate = useNavigate();

  const handleShowDetails = (patientName) =>
    setSelectedPatient(patientName);
  const handleCloseModal = () => setSelectedPatient(null);
  const handleLogout = () => { setUserData({ id: '' });; navigate('/'); }
  useEffect(() => {
    if ( !(userData.role == 'doctor')  || !userData.id ) {
      navigate('/'); // redirect if not logged in
    }
  }, [userData, navigate]);
   useEffect(() => {
      if (!userData.id) {
        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/');
      }
    }, [userData]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, appointmentsRes] = await Promise.all([
          api.get(`doctors/`),
          api.get(`appointments/`)
        ]);
        setDoctors(doctorsRes.data);
        const myAppointments = appointmentsRes.data.filter(
          (appt) => String(appt.doctor_id) === String(userData.id)
        );
        setAppointments(myAppointments);
        console.log(myAppointments)
        setDoctor(doctors.find((doc) => String(doc.id) == String(userData.id)));
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  const changeView = (view) => {
    setActiveView(view);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'appointments':
        return <AppointmentsView appointments={appointments} onShowDetails={handleShowDetails} />;
      // case 'patients':
      //   return <PatientsView />;
      // case 'schedule':
      //   return <ScheduleView />;
      case 'profile':
        return <ProfileView id={userData.doctor} />;
      default:
        return <DashboardView appointments={appointments} onShowDetails={handleShowDetails} />;
    }
  };


  return (
    <>
      <div className="dashboard-layout">
        <button onClick={() => setIsSidebarOpen(true)} className="sidebar-toggle">
          <Menu size={24} />
        </button>
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        {!loading && (
          <Sidebar
            activeView={activeView}
            changeView={changeView}
            isSidebarOpen={isSidebarOpen}
            handleLogout={handleLogout}
            doctors={doctors}
            userData={userData}
          />
          // <app></>
        )}


        <main className="main-content">{renderView()}</main>
        {selectedPatient && <PatientDetailsModal patient={selectedPatient} onClose={handleCloseModal} />}
      </div>
    </>
  );
}

const Sidebar = ({ activeView, changeView, isSidebarOpen, handleLogout, doctors, userData }) => {
  console.log(doctors)
  console.log(userData.id)
  const doctor = doctors.find((doc) => String(doc.user) === String(userData?.id));
  console.log(doctor)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = React.useState(true);

  // console.log('inside')


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsRes] = await Promise.all([
          api.get(`departments/`)
        ]);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dep = departments.find((d) => d.id == doctor.specialty)
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="doctor-profile">
            <div className="doctor-profile-icon"><User size={20} color="white" /></div>
            <div className="doctor-profile-info">
              <h3>{doctor ? doctor.name : 'Loading...'}</h3>
              <p>{dep ? dep.name : 'loading .. '}</p>
            </div>
          </div>
          <nav>
            <SidebarLink icon={<Home size={20} />} label="Dashboard" view="dashboard" activeView={activeView} onClick={changeView} />
            <SidebarLink icon={<Calendar size={20} />} label="Appointments" view="appointments" activeView={activeView} onClick={changeView} />
            {/* <SidebarLink icon={<Users size={20} />} label="Patients" view="patients" activeView={activeView} onClick={changeView} /> */}
            {/* <SidebarLink icon={<Clock size={20} />} label="Schedule" view="schedule" activeView={activeView} onClick={changeView} /> */}
            <SidebarLink icon={<Settings size={20} />} label="Profile" view="profile" activeView={activeView} onClick={changeView} />
          </nav>
        </div>
        <div className="logout-section">
          <button onClick={handleLogout}><LogOut size={20} /> Logout</button>
        </div>
      </div>
    </aside>
  );
};


const SidebarLink = ({ icon, label, view, activeView, onClick }) => (
  <button onClick={() => onClick(view)} className={activeView === view ? 'active' : ''}>{icon} {label}</button>
);


const DashboardView = () => {
  const { userData } = useTransfer();
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [doctorId, setDoctorId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!userData?.id) {
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get all doctors
        const doctorRes = await api.get("doctors/");
        const doctor = doctorRes.data.find(
          (doc) => String(doc.user) === String(userData.id)
        );

        if (!doctor) {
          setError("No doctor profile found for this user.");
          setLoading(false);
          return;
        }

        setDoctorId(doctor.id);

        // 2️⃣ Get your appointments
        const apptRes = await api.get("appointments/");
        const filteredAppointments = apptRes.data.filter(
          (appt) => String(appt.doctor) === String(doctor.id)
        );
        setAppointments(filteredAppointments);

        // 3️⃣ Get unique patient IDs
        const patientIds = [
          ...new Set(filteredAppointments.map((appt) => appt.patient)),
        ];

        // 4️⃣ Fetch all patients and filter to match appointments
        const patientsRes = await api.get("patients/");
        const filteredPatients = patientsRes.data.filter((p) =>
          patientIds.includes(p.id_from_login)
        );

        setPatients(filteredPatients);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  // Helper to get patient name
  const getPatientName = (id) => {
    const patient = patients.find((p) => p.id_from_login == id);
    return patient ? patient.name : "Unknown";
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  // 🔢 Stats
  const totalAppointments = appointments.length;
  const totalPatients = patients.length;

  const pendingAppointments = appointments.filter(
    (appt) => appt.status === "pending"
  ).length;
  return (
    <section>
      <header>
        <h1>Doctor Dashboard</h1>
        {/* <p>Welcome back, Doctor #{userData?.id}! Here's your daily overview.</p> */}
      </header>

      <div className="stats-grid">
        <StatCard
          title="Today's Appointments"
          value={totalAppointments}
          icon={<Calendar size={24} style={{ color: "#2563eb" }} />}
          style={{ backgroundColor: "#dbeafe" }}
        />

        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Users size={24} style={{ color: "#16a34a" }} />}
          style={{ backgroundColor: "#dcfce7" }}
        />

        <StatCard
          title="Pending Appointments"
          value={pendingAppointments}
          icon={<FileText size={24} style={{ color: "#f97316" }} />}
          style={{ backgroundColor: "#ffedd5" }}
        />

        {/* <StatCard
          title="Avg Consult Time"
          value="25 min"
          icon={<Clock size={24} style={{ color: "#9333ea" }} />}
          style={{ backgroundColor: "#f3e8ff" }}
        /> */}
      </div>

      <div className="content-card">
        <h3>My Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments found for you.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{getPatientName(appt.patient)}</td>
                    <td>
                      {appt.datetime
                        ? new Date(appt.datetime).toLocaleString()
                        : "No date"}
                    </td>
                    <td>{appt.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};





const AppointmentsView = () => {
  const { userData } = useTransfer();
  const [appointments, setAppointments] = React.useState([]);
  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [doctorId, setDoctorId] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!userData?.id) {
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    const fetchDoctorAppointmentsAndPatients = async () => {
      try {
        setLoading(true);

        // Get doctor profile
        const doctorRes = await api.get("doctors/");
        const doctor = doctorRes.data.find(
          (doc) => String(doc.user) === String(userData.id)
        );
        if (!doctor) {
          setError("No doctor profile found for this user.");
          setLoading(false);
          return;
        }
        setDoctorId(doctor.id);

        // Get appointments
        const apptRes = await api.get("appointments/");
        const filteredAppointments = apptRes.data.filter(
          (appt) => String(appt.doctor) === String(doctor.id)
        );
        setAppointments(filteredAppointments);

        // Get patients
        const patientIds = [
          ...new Set(filteredAppointments.map((appt) => appt.patient)),
        ];
        const patientsRes = await api.get("patients/");
        const filteredPatients = patientsRes.data.filter((p) =>
          patientIds.includes(p.id_from_login)
        );
        setPatients(filteredPatients);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointmentsAndPatients();
  }, [userData]);

  const getPatientName = (id) => {
    const patient = patients.find((p) => p.id_from_login == id);
    return patient ? patient.name : "Unknown";
  };

  const handleStatusChange = async (apptId, currentStatus) => {
    const newStatus =
      currentStatus === "pending"
        ? "upcoming"
        : currentStatus === "upcoming"
        ? "completed"
        : currentStatus;

    try {
      await api.patch(`appointments/${apptId}/`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId ? { ...appt, status: newStatus } : appt
        )
      );
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("Failed to update appointment status.");
    }
  };

  const handleFileUpload = async (apptId, fileType, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append(fileType, file);

    try {
      setUploading(true);
      const res = await api.patch(`appointments/${apptId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId ? { ...appt, [fileType]: res.data[fileType] } : appt
        )
      );
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentAmountChange = (apptId, amount) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === apptId ? { ...appt, payment_amount: amount } : appt
      )
    );
  };

  const handleCreatePayment = async (apptId, amount) => {
    try {
      await api.post("payments/", {
        appointment: apptId,
        amount: parseFloat(amount),
        status: "pending",
      });
      alert("Payment created!");
      // Refresh appointments
      const apptRes = await api.get("appointments/");
      setAppointments(apptRes.data.filter((a) => a.doctor === doctorId));
    } catch (err) {
      console.error("Payment creation error:", err);
      alert("Failed to create payment.");
    }
  };

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <header>
        <h1>My Appointments</h1>
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
                <th>Lab Report</th>
                <th>Prescription</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{getPatientName(appt.patient)}</td>
                    <td>{appt.datetime ? new Date(appt.datetime).toLocaleString() : "No date"}</td>
                    <td>{appt.reason || "—"}</td>
                    <td>
                      <span className={`status-badge status-${appt.status?.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      {appt.status === "pending" && (
                        <button onClick={() => handleStatusChange(appt.id, appt.status)}>
                          Accept
                        </button>
                      )}
                      {appt.status === "upcoming" && (
                        <button onClick={() => handleStatusChange(appt.id, appt.status)}>
                          Complete
                        </button>
                      )}
                    </td>

                    {/* File uploads */}
                    <td>
                      {appt.status === "completed" && (
                        <div>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(appt.id, "lab_report", e.target.files[0])}
                          />
                          {appt.lab_report && (
                            <a href={appt.lab_report} download target="_blank">Download</a>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {appt.status === "completed" && (
                        <div>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(appt.id, "prescription", e.target.files[0])}
                          />
                          {appt.prescription && (
                            <a href={appt.prescription} download target="_blank">Download</a>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Payment */}
                    <td>
                      {appt.status === "completed" ? (
                        appt.payment ? (
                          <span>{appt.payment.amount} ({appt.payment.status})</span>
                        ) : (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <input
                              type="number"
                              min="0"
                              placeholder="Amount"
                              value={appt.payment_amount || ""}
                              onChange={(e) => handlePaymentAmountChange(appt.id, e.target.value)}
                            />
                            <button onClick={() => handleCreatePayment(appt.id, appt.payment_amount)}>
                              Create
                            </button>
                          </div>
                        )
                      ) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};






// const ScheduleView = () => (
//   <section><header><h1>Manage Schedule</h1></header><div className="content-card"><form className="form-card"><h3>Set Weekly Availability</h3><div className="form-group"><label>Working Days</label><div className="form-group-checkbox"><label><input type="checkbox" defaultChecked /> Mon</label><label><input type="checkbox" defaultChecked /> Tue</label><label><input type="checkbox" defaultChecked /> Wed</label><label><input type="checkbox" defaultChecked /> Thu</label><label><input type="checkbox" defaultChecked /> Fri</label></div></div><div className="content-grid" style={{ gap: '1rem' }}><div className="form-group"><label>Start Time</label><input type="time" defaultValue="09:00" /></div><div className="form-group"><label>End Time</label><input type="time" defaultValue="17:00" /></div></div><div className="form-footer"><button type="submit">Save Schedule</button></div></form></div></section>
// );




const ProfileView = () => {
  const { userData } = useTransfer();
  const [doctor, setDoctor] = React.useState(null);
  const [profile, setProfile] = React.useState({
    name: "",
    specialty: "", // will store department id
    email: "",
    phone_number: "",
    dob: "",
    gender: "male",
  });
  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
  });
  const [departments, setDepartments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors and departments
        const [doctorsRes, departmentsRes] = await Promise.all([
          api.get("doctors/"),
          api.get("departments/"),
        ]);

        const currentDoctor = doctorsRes.data.find(
          (doc) => String(doc.user) === String(userData.id)
        );
        setDoctor(currentDoctor);
        setDepartments(departmentsRes.data);

        if (currentDoctor) {
          setProfile({
            name: currentDoctor.name || "",
            // API returns specialty as department id (number), not an object
            specialty: currentDoctor.specialty != null ? String(currentDoctor.specialty) : "",
            // email lives on the linked User row, exposed by DoctorSerializer
            email: currentDoctor.email || "",
            phone_number: currentDoctor.phone_number || "",
            dob: currentDoctor.dob || "",
            gender: currentDoctor.gender || "male",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!doctor) return;

    try {
      const payload = {
        ...profile,
        specialty: profile.specialty ? parseInt(profile.specialty, 10) : null,
      };

      if (String(passwords.currentPassword) == String(doctor.password)) {
        if (passwords.newPassword)
          payload.password = passwords.newPassword;  // simple, plain text for now
      } else if (passwords.currentPassword != '') {
        alert('current password is wrong')
      }

      await api.patch(`doctors/${doctor.id}/`, payload); // PATCH with id
      setPasswords({ currentPassword: "", newPassword: "" });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!doctor) return <p>No doctor found.</p>;
  // console.log(profile)

  return (
    <section>
      <header>
        <h1>My Profile</h1>
      </header>
      <div className="content-card">
        <form className="form-card" onSubmit={handleUpdate}>
          <h3>Edit Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label>Specialty</label>
            <select name="specialty" value={profile.specialty} onChange={handleProfileChange}>
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={profile.email} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={profile.phone_number} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={profile.dob} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={profile.gender} onChange={handleProfileChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <hr />
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} />
          </div>
          <div className="form-footer">
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </section>
  );
};


// const PatientsView = () => {
//   const { userData } = useTransfer();
//   const [patients, setPatients] = React.useState([]);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState(null);

//   React.useEffect(() => {
//     if (!userData?.id) {
//       setLoading(false);
//       setError("User not logged in.");
//       return;
//     }

//     const fetchPatientsFromAppointments = async () => {
//       try {
//         setLoading(true);

//         // 1️⃣ Get all doctors
//         const doctorRes = await api.get("doctors/");
//         const doctor = doctorRes.data.find(
//           (doc) => String(doc.user) === String(userData.id)
//         );

//         if (!doctor) {
//           setError("Doctor not found for this user.");
//           setLoading(false);
//           return;
//         }

//         const doctorId = doctor.id;

//         // 2️⃣ Get all appointments
//         const appointmentsRes = await api.get("appointments/");
//         // Filter appointments for this doctor
//         const doctorAppointments = appointmentsRes.data.filter(
//           (appt) => String(appt.doctor) === String(doctorId)
//         );
//         // 3️⃣ Extract unique patient IDs from appointments
//         const patientIds = [
//           ...new Set(doctorAppointments.map((appt) => appt.patient)),
//         ];
//         // 4️⃣ Get all patients and filter by patient IDs
//         const patientsRes = await api.get("patients/");
//         const filteredPatients = patientsRes.data.filter((patient) =>
//           patientIds.includes(patient.id_from_login)
//         );
//         console.log('patientview' + filteredPatients)
//         setPatients(filteredPatients);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load patients");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatientsFromAppointments();
//   }, [userData]);

//   if (loading) return <p>Loading patients...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <section>
//       <header>
//         <h1>My Patients</h1>
//       </header>
//       <div className="content-card">
//         <div className="table-wrapper">
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Patient ID</th>
//                 <th>Name</th>
//                 <th>Last Visit</th>
//                 <th>Primary Diagnosis</th>
//               </tr>
//             </thead>
//             <tbody>
//               {patients.map((patient) => (
//                 <tr key={patient.id}>
//                   <td>{patient.id_from_login}</td>
//                   <td>{patient.name}</td>
//                   <td>{patient.last_visit}</td>
//                   <td>{patient.primary_diagnosis}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// };




const StatCard = ({ title, value, icon, style }) => (
  <div className="stat-card"><div className="stat-card-content"><div className="stat-card-info"><p>{title}</p><p>{value}</p></div><div className="stat-card-icon" style={style}>{icon}</div></div></div>
);

const PatientDetailsModal = ({ patient, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3 className="modal-title">{patient.name}</h3><button onClick={onClose} className="modal-close-button"><X size={24} /></button></div>
      <div className="modal-details-grid">
        <div className="modal-details-label">Patient ID</div><div className="modal-details-value">{patient.id}</div>
        <div className="modal-details-label">Gender</div><div className="modal-details-value">{patient.gender}</div>
        <div className="modal-details-label">Blood Type</div><div className="modal-details-value">{patient.blood}</div>
        <div className="modal-details-label">Last Visit</div><div className="modal-details-value">{patient.visit}</div>
        <div className="modal-details-label">Diagnosis</div><div className="modal-details-value">{patient.diagnosis}</div>
      </div>
      <div className="modal-footer"><button onClick={onClose}>Close</button></div>
    </div>
  </div>
);

export default Doctor;