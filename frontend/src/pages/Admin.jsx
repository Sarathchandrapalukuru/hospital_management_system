import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserPlus, Users, Calendar, Briefcase, BarChart2, Settings, LogOut, Menu, Search, Bell, Plus, ChevronDown, X, Heart, Activity, DollarSign } from 'react-feather';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
// import api from 'api';
import { useTransfer } from './Index';

import api from './axios_exp';
import './Admin.css';
import { Bar } from 'react-chartjs-2';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

// --- Main Admin Dashboard Component ---
function Admin() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { userData,setUserData } = useTransfer(); // Assuming this provides admin user info
  const navigate = useNavigate();

  // Authentication check

  useEffect(() => {
    // if (!userData){
    //   navigate('/'); // redirect if not logged in
    // }
    if ( !(userData.role == 'admin')  || !userData.id ) {
      navigate('/'); // redirect if not logged in
    }
  }, [userData, navigate]);

  // Fetch all relevant admin data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, departmentsRes, appointmentsRes] = await Promise.all([
          api.get('doctors/'),
          api.get('departments/'),
          api.get('appointments/')
        ]);
        setDoctors(doctorsRes.data);
        setDepartments(departmentsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    setUserData({ id: '' });;
    navigate('/');
  };

  const changeView = (view) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const renderView = () => {
    if (loading) return <p>Loading...</p>;

    switch (activeView) {
      case 'doctors':
        return <DoctorsView doctors={doctors} onAddDoctor={() => setActiveModal('doctor')} />;
      case 'patients':
        return <PatientsView />;
      case 'appointments':
        return <AppointmentsView appointments={appointments} />;
      case 'departments':
        return <DepartmentsView departments={departments} onAddDepartment={() => setActiveModal('department')} />;
      case 'staff-reports':
        return <StaffReportsView />;
      // case 'patient-reports':
      //   return <PatientReportsView />;
      case 'profile-settings':
        return <ProfileSettingsView id={userData.id} />;
      case 'system-settings':
        return <SystemSettingsView />;
      case 'inventory':
        return <InventoryView />;
      default:
        return <DashboardView doctors={doctors} appointments={appointments} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <Sidebar
        activeView={activeView}
        changeView={changeView}
        isSidebarOpen={isSidebarOpen}
        handleLogout={handleLogout}
        openSubmenus={openSubmenus}
        toggleSubmenu={toggleSubmenu}
        doctors={doctors}
        departments={departments}
        userData={userData}
      />

      <div className="flex-1">
        <TopHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="main-content">{renderView()}</main>
      </div>

      {activeModal === 'doctor' && <AddDoctorModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'department' && <AddDepartmentModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}


// --- Reusable & View Components ---

const Sidebar = ({ activeView, changeView, isSidebarOpen, handleLogout, openSubmenus, toggleSubmenu }) => (
  <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="logo-icon"><Plus size={24} color="white" /></span>
          <h2 className="logo-text">MediSphere</h2>
        </div>
        <nav>
          <SidebarLink icon={<Home size={20} />} label="Dashboard" view="dashboard" activeView={activeView} onClick={changeView} />
          <SidebarLink icon={<UserPlus size={20} />} label="Doctors" view="doctors" activeView={activeView} onClick={changeView} />
          <SidebarLink icon={<Users size={20} />} label="Patients" view="patients" activeView={activeView} onClick={changeView} />
          <SidebarLink icon={<Calendar size={20} />} label="Appointments" view="appointments" activeView={activeView} onClick={changeView} />
          <SidebarLink icon={<Briefcase size={20} />} label="Departments" view="departments" activeView={activeView} onClick={changeView} />
          <Submenu icon={<BarChart2 size={20} />} label="Reports" menuKey="reports" isOpen={openSubmenus['reports']} toggle={toggleSubmenu}>
            <SidebarLink label="staff" view="staff-reports" activeView={activeView} onClick={changeView} />
            {/* <SidebarLink label="Patient" view="patient-reports" activeView={activeView} onClick={changeView} /> */}
          </Submenu>
          {/* <Submenu icon={<Settings size={20} />} label="Settings" menuKey="settings" isOpen={openSubmenus['settings']} toggle={toggleSubmenu}> */}
            <SidebarLink icon={<Settings size={20} />} label="Settings" view="profile-settings" activeView={activeView} onClick={changeView} />
            {/* <SidebarLink label="System" view="system-settings" activeView={activeView} onClick={changeView} /> */}
          {/* </Submenu> */}
          <SidebarLink icon={<inventory size={20} />} label="Inventory" view="inventory" activeView={activeView} onClick={changeView}/>
        </nav>
      </div>
      <div className="logout-section"><button onClick={handleLogout}><LogOut size={20} /> Logout</button></div>
    </div>
  </aside>
);

const TopHeader = ({ onToggleSidebar }) => {
  const { userData } = useTransfer();
  const [admin, setAdmin] = React.useState(null);

  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("admins/");   // same idea as doctors/
        const adminData = res.data.find(
          (a) => String(a.user) === String(userData.id)
        );
        console.log(adminData)
        setAdmin(adminData);
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };

    fetchAdmin();
  }, [userData.id]);

  const name = admin?.name || "Admin";

  // const avatar = admin?.avatar
  //   ? admin.avatar
  //   : `https://i.pravatar.cc/150?u=${userData.id}`;

  return (
    <header className="top-header">
      <button onClick={onToggleSidebar} className="sidebar-toggle">
        <Menu size={24} />
      </button>

      {/* <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search..." />
      </div> */}

      <div className="header-actions">
        <button className="notification-button">
          {/* <Bell size={24} /> */}
          {/* <span className="notification-dot"></span> */}
        </button>

        <div className="admin-profile">
          {/* <img src={avatar} alt={name} /> */}
          <p>{name}</p>
        </div>
      </div>
    </header>
  );
};



const SidebarLink = ({ icon, label, view, activeView, onClick }) => (
  <button onClick={() => onClick(view)} className={activeView === view ? 'active' : ''}><span>{icon}{label}</span></button>
);

const Submenu = ({ icon, label, menuKey, isOpen, toggle, children }) => (
  <div>
    <button onClick={() => toggle(menuKey)}><span>{icon} {label}</span><ChevronDown size={16} className={`submenu-icon ${isOpen ? 'open' : ''}`} /></button>
    <div className={`submenu ${isOpen ? 'open' : ''}`}>{children}</div>
  </div>
);


const DashboardView = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState({});
  const [patients, setPatients] = useState({});
  const [appointments, setAppointments] = useState({});


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [doctorsRes, departmentsRes,patientRes,appointmentRes] = await Promise.all([
          api.get('doctors/'),
          api.get('departments/'),
          api.get('patients/'),
          api.get('appointments/'),

        ]);

        setDoctors(doctorsRes.data);
        setPatients(patientRes.data);
        setAppointments(appointmentRes.data);


        const deptMap = {};
        departmentsRes.data.forEach((dept) => {
          deptMap[dept.id] = dept.name;
        });
        setDepartments(deptMap);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <section>
      <h1>Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="stats-grid">
        <StatCard
          title="Total Doctors"
          value={doctors.length.toString()}
          // change="+3 this month"
          changeColor="text-success"
          icon={<UserPlus size={24} style={{ color: '#2563eb' }} />}
          iconBgColor="#dbeafe"
        />
        <StatCard
          title="Total Patients"
          value={patients.length}
          // change="+12.5%"
          changeColor="text-success"
          icon={<Users size={24} style={{ color: '#16a34a' }} />}
          iconBgColor="#dcfce7"
        />
        {/* <StatCard
          title="Appointments"
          value={appointments.length ? appointments.length.toString : '0'}
          // change="+25 today"
          changeColor="text-success"
          icon={<Calendar size={24} style={{ color: '#9333ea' }} />}
          iconBgColor="#f3e8ff"
        /> */}
        {/* <StatCard
          title="Revenue"
          value="₹1.2 Cr"
          // change="-5.2%"
          changeColor="text-danger"
          icon={<DollarSign size={24} style={{ color: '#d97706' }} />}
          iconBgColor="#fef3c7"
        /> */}
      </div>

      {/* Doctors Table */}
      <div className="content-card">
        <div className="table-wrapper">
          {loading ? (
            <p>Loading doctors...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Availability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="4">No doctors found.</td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.name}</td>
                      <td>{departments[doc.specialty] || 'N/A'}</td>
                      <td>{doc.availability || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${doc.status === 'Active' ? 'status-active' : 'status-on-leave'}`}>
                          {doc.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};





const DoctorsView = ({ onAddDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch doctors and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, departmentsRes] = await Promise.all([
          api.get('doctors/'),
          api.get('departments/')
        ]);

        setDoctors(doctorsRes.data);

        // Convert department list to { id: name } map
        const deptMap = {};
        departmentsRes.data.forEach((dept) => {
          deptMap[dept.id] = dept.name;
        });
        setDepartments(deptMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section>
      <header>
        <h1>Manage Doctors</h1>
        <button onClick={onAddDoctor}>
          <Plus size={20} /> Add Doctor
        </button>
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          {loading ? (
            <p>Loading doctors...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr><td colSpan="5">No doctors found.</td></tr>
                ) : (
                  doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* <img src={`https://i.pravatar.cc/150?u=doc${doc.id}`} alt={doc.full_name} /> */}
                          <div>{doc.name}</div>
                        </div>
                      </td>
                      <td>{doc.specialty_name || '—'}</td>
                      <td>{departments[doc.specialty] || 'N/A'}</td>
                      <td>{doc.email || '—'}</td>
                      <td>{doc.phone_number || '—'}</td>
                      {/* <td>
                        <span className={`status-badge ${doc.status === 'Active' ? 'status-active' : 'status-on-leave'}`}>
                          {doc.status}
                        </span>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};






const PatientsView = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api.get('patients/')
      .then(res => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading patients:', err);
        setError('Failed to load patients');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section>
      <h1>Patient Records</h1>
      <div className="content-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan="5">No patients found.</td></tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id_from_login}>
                    <td>#{patient.id_from_login.toString().padStart(5, '0')}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email || '—'}</td>
                    <td>{patient.phone_number || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};





// below code is reusable
const AppointmentsView = ({ onBookAppointment }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        appointmentsRes,
        doctorsRes,
        departmentsRes,
        patientsRes
      ] = await Promise.all([
        api.get('appointments/'),
        api.get('doctors/'),
        api.get('departments/'),
        api.get('patients/')
      ]);

      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // helper functions
  const getDoctorName = (id) => {
    const doc = doctors.find((d) => d.id === id);
    return doc ? doc.name : `Doctor #${id}`;
  };

  const getDepartmentName = (id) => {
    const dep = departments.find((d) => d.id === id);
    return dep ? dep.name : `Department #${id}`;
  };

  const getPatientName = (id) => {
    const pat = patients.find((p) => p.id_from_login === id);
    return pat ? pat.name : `Patient #${id}`;
  };

  return (
    <section>
      <header>
        <h1>Appointments</h1>
        {/* <button onClick={onBookAppointment}>
          <Plus size={20} /> Book New Appointment
        </button> */}
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>initiated Patient</th>
                  <th>Department</th>
                  {/* <th>Date & Time</th> */}
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan="5">No appointments found.</td></tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{getDoctorName(appt.doctor)}</td>
                      <td>{getPatientName(appt.patient)}</td>
                      <td>{getDepartmentName(appt.department)}</td>
                      {/* <td>
                        {new Date(appt.DateTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </td> */}
                      <td>{appt.reason || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};



const DepartmentsView = ({ onAddDepartment }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('departments/');
        setDepartments(response.data); // assuming the data is an array
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <section>
      <header>
        <h1>Hospital Departments</h1>
        <button onClick={onAddDepartment}>
          <Plus size={20} /> Add Department
        </button>
      </header>

      <div className="departments-grid">
        {loading ? (
          <p>Loading departments...</p>
        ) : departments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          departments.map((dept) => (
            <div className="department-card" key={dept.id}>
              <div className="department-card-content">
                <div className="department-card-icon" style={{ backgroundColor: '#dbeafe' }}>
                  <Heart size={24} style={{ color: '#2563eb' }} />
                </div>
                <div className="department-card-info">
                  <h3>{dept.name}</h3>
                  <p>{dept.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};


// const StaffReportsView = () => (
//   <section><h1>Financial Reports</h1><div className="stats-grid"><div className="content-card"><p>Total Revenue</p><p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>₹1.2 Cr</p></div><div className="content-card"><p>Total Expenses</p><p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>₹75 L</p></div><div className="content-card"><p>Net Profit</p><p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)', marginTop: '0.25rem' }}>₹45 L</p></div></div><div className="content-card"><h3>Revenue vs Expenses (Last 6 Months)</h3><FinancialChart /></div></section>
// );


const StaffReportsView = () => {
  const [departmentsData, setDepartmentsData] = useState([]);
  const [doctorsData, setDoctorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments and doctors data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Example API calls (replace with your actual API endpoint)
        const [departmentsRes, doctorsRes] = await Promise.all([
          api.get('departments/'),
          api.get('doctors/'),
        ]);
        setDepartmentsData(departmentsRes.data);
        setDoctorsData(doctorsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group doctors by department and count how many doctors are in each department
  const getDoctorCountsByDepartment = () => {
    const departmentCounts = departmentsData.reduce((acc, department) => {
      acc[department.id] = 0; // Initialize the count for each department
      return acc;
    }, {});

    doctorsData.forEach((doctor) => {
      // console.log(doctor.specialty)
        console.log(departmentCounts)

      // if (departmentCounts[doctor.specialty]) {
        departmentCounts[doctor.specialty] += 1;
        console.log(departmentCounts)
      // }
    });

    return departmentCounts;
  };

  // Prepare chart data
  const departmentCounts = getDoctorCountsByDepartment();
  const chartData = {
    labels: departmentsData.map((department) => department.name), // Department names
    datasets: [
      {
        label: 'Number of Doctors',
        data: departmentsData.map((department) => departmentCounts[department.id] || 0), // Doctor count for each department
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <section>
      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '20px' }}>Doctors by Department</h1>

      {/* Bar Chart showing doctors per department */}
      <div
        style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>
          Number of Doctors per Department
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </section>
  );
};




const PatientReportsView = () => (
  <section><h1>Patient Analytics</h1><div className="reports-grid"><div className="content-card"><p>New Patients (This Month)</p><p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>182</p></div><div className="content-card"><p>Avg. Length of Stay</p><p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>4.2 Days</p></div><div className="content-card"><p>Bed Occupancy Rate</p><p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)', marginTop: '0.25rem' }}>85%</p></div></div><div className="reports-grid"><div className="content-card"><h3>Patient Demographics</h3><DemographicsChart /></div><div className="content-card"><h3>Top 5 Diagnoses (This Month)</h3><ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}><li className="report-item"><span>Hypertension</span><span>120 Cases</span></li><li className="report-item"><span>Diabetes Mellitus</span><span>95 Cases</span></li><li className="report-item"><span>Pneumonia</span><span>88 Cases</span></li><li className="report-item"><span>Fracture</span><span>75 Cases</span></li><li className="report-item"><span>Appendicitis</span><span>62 Cases</span></li></ul></div></div></section>
);




const ProfileSettingsView = () => {
  const { userData } = useTransfer();
  const [admin, setAdmin] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [profile, setProfile] = React.useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
  });

  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("admins/"); // your admin endpoint
        const currentAdmin = res.data.find(
          (a) => String(a.user) === String(userData.id)
        );

        setAdmin(currentAdmin);

        if (currentAdmin) {
          setProfile({
            name: currentAdmin.name || "",
            email: currentAdmin.email || "",
            phone_number: currentAdmin.phone_number || "",
          });
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
        alert("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
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
    if (!admin) return;

    try {
      const payload = { ...profile };

      // password validation
      if (passwords.currentPassword) {
        if (String(passwords.currentPassword) === String(admin.password)) {
          if (passwords.newPassword) payload.password = passwords.newPassword;
        } else {
          alert("Current password is wrong");
          return;
        }
      }

      await api.patch(`admins/${admin.id}/`, payload);

      alert("Profile updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });

    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p>Loading Admin Profile...</p>;
  if (!admin) return <p>No admin found.</p>;

  return (
    <section>
      <h1>Admin Profile</h1>

      <div className="content-card">
        <form className="form-card" onSubmit={handleUpdate}>
          <h3>Edit Information</h3>

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
            <label>Email</label>
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
              type="text" 
              name="phone_number" 
              value={profile.phone_number} 
              onChange={handleProfileChange} 
            />
          </div>

          <hr />

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
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </section>
  );
};





const SystemSettingsView = () => (
  <section><h1>System Settings</h1><div className="content-card"><form className="form"><div><h3>General Settings</h3><div className="form-grid" style={{ marginTop: '0.5rem' }}><div className="form-group"><label>Hospital Name</label><input type="text" defaultValue="MediSphere Hospital" /></div><div className="form-group"><label>Contact Email</label><input type="email" defaultValue="contact@medisphere.com" /></div></div></div><hr /><div><h3>Module Settings</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
    <label className="form-toggle"><span style={{ flexGrow: 1 }}>Enable Telemedicine Module</span><input type="checkbox" defaultChecked /></label>
    <label className="form-toggle"><span style={{ flexGrow: 1 }}>Enable SMS Notifications</span><input type="checkbox" defaultChecked /></label>
  </div></div><div className="form-footer"><button type="submit">Save Settings</button></div></form></div></section>
);

const StatCard = ({ title, value, change, changeColor, icon, iconBgColor }) => (
  <div className="stat-card"><div><p>{title}</p><p>{value}</p><p className={changeColor}>{change}</p></div><div className="stat-card-icon" style={{ backgroundColor: iconBgColor }}>{icon}</div></div>
);



const AddDepartmentModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('departments/', formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Department</h3>
          <button onClick={onClose} className="modal-close-button"><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <p className="error">{error}</p>}
          <div className="form">
            <input name="name" placeholder="Department Name" value={formData.name} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};


const AddDoctorModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    doctorId: '',
    department: ''
  });


  const [departments, setDepartments] = useState([]); // ✅ Add state for departments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ Fetch department list from backend
    api.get('departments/')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Error loading departments:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('doctors/', {
        name: formData.fullName,
        gender: formData.gender.toLowerCase(),
        dob: formData.dob,
        phone_number: formData.phone,
        email: formData.email,
        doctor_id: parseInt(formData.doctorId),
        specialty: parseInt(formData.department)
      });

      // await api.post('http://localhost:8000/api/doctors/', formData);

      onClose();
    } catch (err) {
      console.log(error)
      setError(err.response?.data?.message || 'Failed to add doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title"><UserPlus size={28} /> Add Doctor</h3>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div><h4>Personal Information</h4>
              <div className="form-grid">
                <input name="fullName" value={formData.fullname} onChange={handleChange} type="text" placeholder="Full Name" />
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <input name="dob" value={formData.dob} onChange={handleChange} type="date" />
              </div>
            </div>
            <div><h4>Contact Details</h4>
              <div className="form-grid">
                <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Phone Number" />
                <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" />
              </div>
            </div>
            <div><h4>Professional Information</h4>
              <div className="form-grid">
                <input name="doctorId" value={formData.doctorId} onChange={handleChange} type="text" placeholder="Doctor ID" />

                {/* ✅ Replaced department input with dropdown */}
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
                </select>

              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};



const FinancialChart = () => {
  const data = { labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], datasets: [{ label: 'Revenue', data: [65, 59, 80, 81, 56, 55], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.4 }, { label: 'Expenses', data: [28, 48, 40, 19, 86, 27], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.4 }] };
  const options = { responsive: true, plugins: { legend: { position: 'top' } } };
  return <Line options={options} data={data} />;
};

const DemographicsChart = () => {
  const data = { labels: ['0-18 yrs', '19-40 yrs', '41-60 yrs', '60+ yrs'], datasets: [{ data: [30, 50, 80, 40], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] }] };
  const options = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  return <Doughnut data={data} options={options} />;
};




const InventoryView = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // ⭐ Holds item being edited

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await api.get('inventory/');
      setInventory(response.data);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditItem(null);     // ⭐ No item → Add mode
    setShowModal(true);
  };

  const handleEditItem = (itemId) => {
    const item = inventory.find((i) => i.id === itemId);
    setEditItem(item);     // ⭐ Send existing item to modal
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`inventory/${itemId}/`);
      setInventory((prevInventory) =>
        prevInventory.filter((item) => item.id !== itemId)
      );
    } catch (err) {
      console.error('Error deleting inventory item:', err);
    }
  };

  return (
    <section>
      <header>
        <h1>Manage Inventory</h1>
        <button onClick={handleAddItem}>+ Add Item</button>
      </header>

      <div className="content-card">
        <div className="table-wrapper">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                  <th>CATEGORY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan="6">No inventory items found.</td></tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.category}</td>
                      <td>
                        <button 
                          className='admin-inventoryview-edit-btn' 
                          onClick={() => handleEditItem(item.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className='admin-inventoryview-delete-btn' 
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <InventoryModal 
          onClose={() => setShowModal(false)}
          onRefresh={fetchInventoryData}
          editItem={editItem}        // ⭐ Pass item to modal
        />
      )}
    </section>
  );
};


const InventoryModal = ({ onClose, onRefresh, editItem }) => {
  const { userData } = useTransfer();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    admin: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ⭐ Pre-fill form when editing
  useEffect(() => {
    if (editItem) {
      setFormData((prev) => ({
        ...prev,
        ...editItem, // Name, desc, etc
        id: editItem.id,
      }));
    }
  }, [editItem]);

  // Fetch admin ID and set automatically
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("admins/");
        const adminData = res.data.find(
          (a) => String(a.user) === String(userData.id)
        );
        setFormData((prev) => ({ ...prev, admin: adminData?.id }));
      } catch (error) {
        console.error("Error fetching admin:", error);
        setError('Failed to fetch admin data.');
      }
    };

    if (userData.id) fetchAdmin();
  }, [userData.id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.id) {
        // ⭐ Update existing item
        await api.put(`inventory/${formData.id}/`, formData);
      } else {
        // ⭐ Create new item
        await api.post('inventory/', formData);
      }

      onRefresh();
      onClose();

    } catch (err) {
      console.error('Error submitting inventory form:', err);
      setError('Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{formData.id ? "Edit Inventory Item" : "Add New Inventory Item"}</h3>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Item Name</label>
            <input id="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea id="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input id="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input id="price" type="number" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input id="category" value={formData.category} onChange={handleChange} required />
          </div>

          <input type="hidden" id="admin" value={formData.admin} />

          <div className="form-footer">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{loading ? "Saving..." : "Save"}</button>
          </div>

        </form>
      </div>
    </div>
  );
};




export default Admin;