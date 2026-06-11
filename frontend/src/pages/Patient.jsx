import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, FileText, DollarSign, Settings, LogOut, Menu, User, ChevronDown, Plus, X } from 'react-feather';
// import axios from 'axios';
import api from './axios_exp';

// Import the new stylesheet
import './Patient.css';
import { useTransfer } from './Index';

// --- Main Patient Dashboard Component ---
function Patient() {
  const { userData, setUserData } = useTransfer();
  const [data, setdata] = useState(null)
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const navigate = useNavigate();
  console.log(userData)
  if (!userData.id) {
    console.log('yes! no id')
  }

  const handleLogout = () => {
    // setTransferingPatientData({ id: '' });
    setUserData({ id: '' });
  };
 
  useEffect(() => {
    if ( !(userData.role == 'patient')  || !userData.id ) {
      navigate('/'); // redirect if not logged in
    }
  }, [userData, navigate]);


  const changeView = (view) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const showAppointmentModal = (title) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const renderView = () => {
    switch (activeView) {
      case 'appointments': return <AppointmentsView onBookAppointment={() => showAppointmentModal('Book New Appointment')} />;
      // case 'lab-reports': return <LabReportsView />;
      // case 'prescriptions': return <PrescriptionsView />;
      // case 'view-bills': return <ViewBillsView />;
      // case 'payment-history': return <PaymentHistoryView />;
      case 'profile': return <ProfileView />;
      default: return <DashboardView onReschedule={() => showAppointmentModal('Reschedule Appointment')} />;
    }
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        // 1. Fetch the API root or initial endpoint to get the posts URL
        const response = await api.get('patients/');
        console.log('res=',response)
        const result = await response.data;
        console.log(result)


        console.log('id = ' + userData.id)
        const thechoosenone = result.find(patient => patient.user === userData.id);
        // console.log("updated data" + thechoosenone)

        setdata(thechoosenone);
        console.log('a' + thechoosenone.name)

        console.log(data);


      } catch (error) {
        console.error('Error fetching posts:', error);
        // alert('please login first')
        navigate('/');

      } finally {
        // setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    if (data) {
      console.log("Data updated:", data);
      // You can update UI, trigger other functions, etc.
    }
  }, [data]);



  return (
    <div className="dashboard-layout">
      <button onClick={() => setIsSidebarOpen(true)} className="sidebar-toggle"><Menu size={24} /></button>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <Sidebar
        activeView={activeView}
        changeView={changeView}
        isSidebarOpen={isSidebarOpen}
        handleLogout={handleLogout}
        openSubmenus={openSubmenus}
        toggleSubmenu={toggleSubmenu}
        data={data}
      />
      <main className="main-content">{renderView()}</main>
      {isModalOpen && <AppointmentModal title={modalTitle} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

// --- Reusable & View Components ---

const Sidebar = ({ activeView, changeView, isSidebarOpen, handleLogout, openSubmenus, toggleSubmenu, data }) => (
  <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="patient-profile">
          <div className="patient-profile-icon"><User size={20} color="white" /></div>
          {/* <div className="patient-profile-info"><h3>{data.id}</h3><p>ID: P001</p></div> */}

          <div className="patient-profile-info">
            <h3>{data ? data.name : 'Loading...'}</h3>
            <p>ID: {data ? data.id : '...'}</p>
          </div>

        </div>
        <nav>
          <SidebarLink icon={<Home size={20} />} label="Dashboard" view="dashboard" activeView={activeView} onClick={changeView} />
          <SidebarLink icon={<Calendar size={20} />} label="My Appointments" view="appointments" activeView={activeView} onClick={changeView} />

          {/* <Submenu
            icon={<FileText size={20} />}
            label="Medical Records"
            menuKey="records"
            isOpen={openSubmenus['records']}
            toggle={toggleSubmenu}
          >
            <SidebarLink label="Lab Reports" view="lab-reports" activeView={activeView} onClick={changeView} isSubmenu={true} />
            <SidebarLink label="Prescriptions" view="prescriptions" activeView={activeView} onClick={changeView} isSubmenu={true} />
          </Submenu> */}

          {/* <Submenu
            icon={<DollarSign size={20} />}
            label="Bills & Payments"
            menuKey="billing"
            isOpen={openSubmenus['billing']}
            toggle={toggleSubmenu}
          >
            <SidebarLink label="View Bills" view="view-bills" activeView={activeView} onClick={changeView} isSubmenu={true} />
            <SidebarLink label="Payment History" view="payment-history" activeView={activeView} onClick={changeView} isSubmenu={true} />
          </Submenu> */}

          <SidebarLink icon={<Settings size={20} />} label="My Profile" view="profile" activeView={activeView} onClick={changeView} />
        </nav>
      </div>
      <div className="logout-section"><button onClick={handleLogout}><LogOut size={20} /> Logout</button></div>
    </div>
  </aside>
);

const SidebarLink = ({ icon, label, view, activeView, onClick, isSubmenu = false }) => (
  <button onClick={() => onClick(view)} className={activeView === view ? 'active' : ''}>
    <span>{icon}{label}</span>
  </button>
);

const Submenu = ({ icon, label, menuKey, isOpen, toggle, children }) => (
  <div>
    <button onClick={() => toggle(menuKey)}>
      <span>{icon} {label}</span>
      <ChevronDown size={16} className={`submenu-icon ${isOpen ? 'open' : ''}`} />
    </button>
    <div className={`submenu ${isOpen ? 'open' : ''}`}>{children}</div>
  </div>
);




const DashboardView = ({ onReschedule, currentUserId }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, doctorsRes, departmentsRes] = await Promise.all([
        api.get('appointments/'),
        api.get('doctors/'),
        api.get('departments/')
      ]);

      // Filter appointments for the current user
      const userAppointments = appointmentsRes.data.filter(
        (appt) => appt.patient.user === currentUserId
      );

      setAppointments(userAppointments);
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (id) => {
    const doc = doctors.find((d) => d.id === id);
    return doc ? doc.name : `Doctor #${id}`;
  };

  const getDepartmentName = (id) => {
    const dep = departments.find((d) => d.id === id);
    return dep ? dep.name : `Department #${id}`;
  };

  // Optionally, you could filter by a specific status
  const filteredAppointments = appointments.filter(
    (appt) => appt.status === 'upcoming' // change status if needed
  );

  return (
    <section>
      <header>
        <h1>Patient Dashboard</h1>
        {/* <p>Welcome back, John! Here's your health overview.</p> */}
      </header>

      <div className="content-card">
        <h2>Appointments</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          filteredAppointments.map((appt) => (
            <div key={appt.id} className="appointment-card">
              <div className="appointment-card-header">
                <div>
                  <h3>{getDoctorName(appt.doctor)}</h3>
                  <p>{getDepartmentName(appt.department)}</p>
                  <p className="status">Status: {appt.status}</p>
                </div>
                <div className="appointment-card-actions">
                  {/* <button className="reschedule" onClick={() => onReschedule(appt)}>
                    Reschedule
                  </button>
                  <button className="cancel">Cancel</button> */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};





const AppointmentsView = ({ onBookAppointment, currentUserId }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, doctorsRes, departmentsRes] = await Promise.all([
        api.get('appointments/'),
        api.get('doctors/'),
        api.get('departments/')
      ]);

      // Filter appointments to only those for the current user
      const userAppointments = appointmentsRes.data.filter(
        (appt) => appt.patient.user === currentUserId
      );

      setAppointments(userAppointments);
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (id) => {
    const doc = doctors.find((d) => d.id === id);
    return doc ? doc.name : `Doctor #${id}`;
  };

  const getDepartmentName = (id) => {
    const dep = departments.find((d) => d.id === id);
    return dep ? dep.name : `Department #${id}`;
  };

  return (
    <section>
      <header>
        <h1>My Appointments</h1>
        <button onClick={onBookAppointment}>
          <Plus size={20} /> Book New Appointment
        </button>
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Lab Report</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{getDoctorName(appt.doctor)}</td>
                    <td>{getDepartmentName(appt.department)}</td>
                    <td>{new Date(appt.datetime).toLocaleString()}</td>
                    <td>{appt.reason || '—'}</td>
                    <td>
                      <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                    </td>
                    <td>
                      {appt.lab_report_url ? (
                        <a href={appt.lab_report_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {appt.prescription_url ? (
                        <a href={appt.prescription_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};




const LabReportsView = () => (
  <section><header><h1>My Lab Reports</h1></header><div className="content-card"><div className="table-wrapper"><table className="table"><thead><tr><th>Test Name</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td>Complete Blood Count (CBC)</td><td>Oct 10, 2025</td><td>Results Available</td><td><button>Download PDF</button></td></tr></tbody></table></div></div></section>
);



const PrescriptionsView = () => (
  <section><header><h1>My Prescriptions</h1></header><div className="content-card"><div className="table-wrapper"><table className="table"><thead><tr><th>Medication</th><th>Dosage</th><th>Prescribed By</th><th>Date</th><th>Status</th></tr></thead><tbody><tr><td>Lisinopril</td><td>10mg, once daily</td><td>Dr. Sarah Johnson</td><td>Oct 05, 2025</td><td><span className="status-badge status-active">Active</span></td></tr><tr><td>Amoxicillin</td><td>500mg, three times daily</td><td>Dr. Michael Chen</td><td>Jul 12, 2025</td><td><span className="status-badge status-expired">Expired</span></td></tr></tbody></table></div></div></section>
);


const ViewBillsView = () => {
  const { userData } = useTransfer();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bills/payments for logged-in patient
  useEffect(() => {
    if (!userData?.id) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const fetchBills = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get patient profile for this user
        const patientRes = await api.get(`patients/?user=${userData.id}`);
        const patient = patientRes.data[0]; // assuming 1:1
        if (!patient) {
          setError("No patient profile found.");
          setLoading(false);
          return;
        }

        // 2️⃣ Get all payments linked to this patient through appointments
        const paymentsRes = await api.get("payments/");
        const patientPayments = paymentsRes.data.filter(
          (pay) => pay.appointment.patient === patient.id
        );

        setBills(patientPayments);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to load bills.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [userData]);

const handlePayment = async (paymentId) => {
  try {
    const res = await api.post(
      "create-payment-session/",
      { payment_id: paymentId },
      // { headers: { Authorization: `Bearer ${userData.token}` } } // auth!
    );
    window.location.href = res.data.url;
  } catch (err) {
    console.error("Payment initiation failed:", err);
    alert("Failed to initiate payment. Check login/auth.");
  }
};


  if (loading) return <p>Loading bills...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <header>
        <h1>My Bills</h1>
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Appointment Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>#INV-{bill.id.toString().padStart(4, "0")}</td>
                    <td>
                      {bill.appointment?.datetime
                        ? new Date(bill.appointment.datetime).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>₹ {bill.amount}</td>
                    <td>
                      <span className={`status-badge status-${bill.status.toLowerCase()}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {bill.status === "pending" ? (
                        <button
                          style={{
                            textDecoration: "none",
                            color: "white",
                            backgroundColor: "var(--primary-color)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "0.375rem",
                          }}
                          onClick={() => handlePayment(bill.id)}
                        >
                          Pay Now
                        </button>
                      ) : (
                        "Paid"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};


const PaymentHistoryView = () => {
  const { userData } = useTransfer();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userData?.id) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);

        // Get patient profile
        const patientRes = await api.get(`patients/?user=${userData.id}`);
        const patient = patientRes.data[0];
        if (!patient) {
          setError("No patient profile found.");
          setLoading(false);
          return;
        }

        // Get payments linked to this patient
        const paymentsRes = await api.get("payments/");
        const paidPayments = paymentsRes.data.filter(
          (pay) => pay.appointment.patient === patient.id && pay.status.toLowerCase() === "paid"
        );

        setPayments(paidPayments);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userData]);

  if (loading) return <p>Loading payment history...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-card">
      <div className="table-wrapper">
        <table className="table">
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#TXN-{payment.id.toString().padStart(4, "0")}</td>
                  <td>
                    {payment.appointment?.datetime
                      ? new Date(payment.appointment.datetime).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>₹ {payment.amount}</td>
                  <td>{payment.method || "N/A"}</td>
                  <td>
                    <span className="status-badge status-paid">Paid</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No paid payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};






const ProfileView = () => {
  const { userData } = useTransfer(); // expecting userData.id
  const [patient, setPatient] = React.useState(null);
  const [profile, setProfile] = React.useState({
    name: "",
    email: "",
    phone_number: "",
    dob: "",
  
  });
  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = React.useState(true);

  // Fetch patient data
  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     if (!userData.id) {
  //       setLoading(false);
  //       setPatient(null);
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       const response = await api.get(
  //         `patients/?user = ${userData.id}`
  //       );
  //       const patientData = response.data;
  //       setPatient(patientData); // contains id_from_login
  //       setProfile({
  //         name: patientData.name || "",
  //         email: patientData.email || "",
  //         phone_number: patientData.phone_number || "",
  //         dob: patientData.dob || "",
  //       });
  //     } catch (error) {
  //       console.error("Error fetching patient data:", error);
  //       alert("Failed to load profile data.");
  //       setPatient(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [userData.id]);

React.useEffect(() => {
  const fetchData = async () => {
    if (!userData?.id) {
      setLoading(false);
      setPatient(null);
      return;
    }

    try {
      setLoading(true);
      // Fetch the patient whose "user" matches userData.id
      const response = await api.get(`patients/?user=${userData.id}`);
      
      if (response.data.length > 0) {
        setPatient(response.data[0]);
        setProfile({
          name: response.data[0].name,
          email: response.data[0].email,
          phone_number: response.data[0].phone_number,
          dob: response.data[0].dob,
        });
      } else {
        setPatient(null);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userData]);


  // Handle profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!patient) return;

    try {
      await api.patch(
        `patients/${patient.id_from_login}/`,
        profile,
        { withCredentials: true }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error.response?.data || error);
      alert("Failed to update profile.");
    }
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!patient) return;

    if (!passwords.currentPassword || !passwords.newPassword) {
      alert("Please fill both password fields.");
      return;
    }

    try {
      await api.post(
        `patients/${patient.id_from_login}/change-password/`,
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
        },
        { withCredentials: true }
      );

      setPasswords({ currentPassword: "", newPassword: "" });
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Password update failed:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to change password.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!patient) return <p>No patient found.</p>;

  return (
    <section>
      <header>
        <h1>My Profile</h1>
      </header>

      <div className="content-card">
        <form className="form-card" onSubmit={handleProfileUpdate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleProfileChange}
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="save-btn">
              Save Profile Changes
            </button>
          </div>
        </form>

        <hr style={{ margin: "1.5rem 0" }} />

        <form className="form-card" onSubmit={handlePasswordUpdate}>
          <h3>Change Password</h3>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="save-btn">
              Change Password
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};




const AppointmentModal = ({ title, onClose }) => {
  const { userData } = useTransfer();
  const [charCount, setCharCount] = useState(400);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    doctor: '',
    datetime: '',
    reason: '',
    phone_number: ''
  });;

  // ✅ Fetch departments and doctors on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [departmentsRes, doctorsRes] = await Promise.all([
          api.get('departments/'),
          api.get('doctors/'),
        ]);
        setDepartments(departmentsRes.data);
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Form field change handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === "description") {
      setCharCount(400 - value.length);
    }

    // Reset doctor selection if department (department) changes
    if (id === "department") {
      setFormData(prev => ({ ...prev, doctor: '' }));
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      // Use the logged-in patient's profile — backend assigns patient automatically.
      const payload = {
        department: parseInt(formData.department, 10),
        doctor: parseInt(formData.doctor, 10),
        datetime: formData.datetime,
        reason: formData.reason,
      };
      const response = await api.post('appointments/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Appointment saved successfully!");
        onClose(); // Close modal
      } else {
        alert("Failed to save appointment.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.patient?.[0] ||
        error.response?.data?.doctor?.[0] ||
        error.response?.data?.department?.[0] ||
        JSON.stringify(error.response?.data) ||
        "An error occurred.";
      alert(msg);
    }
  };

  // ✅ Filter doctors by selected department
  const filteredDoctors = formData.department
    ? doctors.filter(doc => doc.specialty === parseInt(formData.department))
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>
        <p className="modal-subtitle">Such as personal details, and contact information.</p>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Type here" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone_number">phone_number</label>
            <input type="text" id="phone_number" placeholder="Enter number" value={formData.phone_number} onChange={handleChange} />
          </div>
          <div className="form-grid">
            {/* Department Dropdown */}
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    department: e.target.value,
                    doctor: '', // reset doctor when department changes
                  }));
                }}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Dropdown (Filtered by selected department) */}
            <div className="form-group">
              <label htmlFor="doctor">Doctor</label>
              <select
                id="doctor"
                value={formData.doctor}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, doctor: e.target.value }))
                }
                disabled={!formData.department}
              >
                <option value="">-- Select Doctor --</option>
                {doctors
                  .filter((doc) => doc.specialty === parseInt(formData.department))
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Appointment Date */}
          <div className="form-group">
            <label htmlFor="datetime">Appointment Date & Time</label>
            <input
              type="datetime-local"
              id="datetime"
              value={formData.datetime}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, datetime: e.target.value }))
              }
            />
          </div>

          {/* Reason for Appointment */}
          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              placeholder="Describe your reason for the visit"
              rows="3"
              value={formData.reason}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, reason: e.target.value }))
              }
            ></textarea>
          </div>



          <div className="form-footer">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Patient;







