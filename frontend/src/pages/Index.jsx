


import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Menu, Heart, Activity, FileText, Check, MapPin, Phone, Mail, Send, X } from 'react-feather';
import './Index.css';

const TransferContext = createContext();

export const TransferProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : { id: '', role: '' };
    } catch {
      return { id: '', role: '' };
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [userData, isAuthenticated]);

  const handleAuthentication = async (loginData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      console.log(result)
      if (response.ok) {
        setUserData({ id: result.id, role: result.role }); // role comes from backend
        setIsAuthenticated(true);
        localStorage.setItem('token', result.tokens.access);
        return result.role;
      } else {
        alert(result.error || 'Login failed');
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      alert('Something went wrong: ' + error.message);
      setIsAuthenticated(false);
      return null;
    }
  };

  const logout = () => {
    setUserData({ id: '', role: '' });
    setIsAuthenticated(false);
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  };

  return (
    <TransferContext.Provider value={{ userData, setUserData,isAuthenticated,setIsAuthenticated, handleAuthentication, logout }}>
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => useContext(TransferContext);



function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [appointmentData, setAppointmentData] = useState({
    name: '', email: '', phone: '', department: '',
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [role, setRole] = useState('');


  const navigate = useNavigate();
  const { handleAuthentication } = useTransfer();

  // Login Modal Handlers
  const closeLoginModal = () => {
    setIsModalOpen(false);
    setLoginData({ email: '', password: '' });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    // console.log('hello')
    e.preventDefault();
    const role = await handleAuthentication(loginData);
    console.log(role)
    setRole(role)
    if (role) navigate(`/${role.toLowerCase()}`);
  };

  // Appointment Handlers
  const handleAppointmentChange = (e) => {
    const { id, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [id]: value }));
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    alert(`Appointment request for ${appointmentData.name} has been submitted!`);
    setAppointmentData({ name: '', email: '', phone: '', department: '' });
  };

  // Newsletter Handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing, ${newsletterEmail}!`);
    setNewsletterEmail('');
  };

  return (
    <div className="home-page-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-content">
          <a href="#home" className="logo-container">
            <div className="logo-icon-bg"><Plus color="white" size={20} /></div>
            <span className="logo-text">MediSphere</span>
          </a>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            {/* <a href="#contact">Contact</a> */}
          </div>
          <div className="nav-actions">
            <a href="tel:911" className="emergency-button">Emergency: 108</a>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle">
              <Menu size={24} />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="mobile-menu">
            <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <section id="home" className="hero-section">
          <h1 className="hero-title">Your Health, Our Priority</h1>
          <p className="hero-subtitle">Experience world-class healthcare with compassionate care at MediSphere.</p>
          <div className="hero-buttons">
            <button onClick={() => setIsModalOpen(true)} className="primary-btn">Login</button>
          </div>
          {/* <svg className="hero-wave" viewBox="0 0 1440 120"><path fill="#f8fafc" d="M0,96L48,90.7C96,85,192,75,288,69.3C384,64,480,64,576,74.7C672,85,768,107,864,106.7C960,107,1056,85,1152,74.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path></svg> */}
        </section>

        {/* SERVICES */}
        <section id="services" className="section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">Comprehensive healthcare services designed to meet all your medical needs.</p>
            </div>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-card-icon-bg"><Heart size={32} color="var(--primary-color)" /></div>
                <h3 className="service-card-title">Cardiology</h3>
                <p>Advanced cardiac care with state-of-the-art equipment and experienced specialists.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon-bg"><Activity size={32} color="var(--primary-color)" /></div>
                <h3 className="service-card-title">Emergency Care</h3>
                <p>24/7 emergency services with rapid response and critical care facilities.</p>
              </div>
              <div className="service-card">
                <div className="service-card-icon-bg"><FileText size={32} color="var(--primary-color)" /></div>
                <h3 className="service-card-title">Diagnostics</h3>
                <p>Comprehensive lab tests and imaging services for accurate and quick results.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section" style={{ backgroundColor: 'var(--surface-color)' }}>
          <div className="section-container">
            <div className="about-grid">
              <div>
                <h2 className="section-title" style={{ textAlign: 'left' }}>About MediSphere</h2>
                <p style={{ marginBottom: '1.5rem' }}>Founded in 2010, MediSphere has been at the forefront of healthcare innovation, combining cutting-edge technology with compassionate care to serve our community.</p>
                <ul className="about-list">
                  <li className="about-list-item"><div className="about-list-icon-bg"><Check size={16} color="white" /></div><span>Over 100,000 patients served</span></li>
                  <li className="about-list-item"><div className="about-list-icon-bg"><Check size={16} color="white" /></div><span>50+ specialized doctors</span></li>
                  <li className="about-list-item"><div className="about-list-icon-bg"><Check size={16} color="white" /></div><span>24/7 emergency services</span></li>
                </ul>
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&q=80&w=1080&auto=format&fit=crop" alt="A modern hospital hallway" className="about-image" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

     
      </main>

      {/* LOGIN MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {role ? `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Login'}
              </h2>
              <button onClick={closeLoginModal} className="modal-close-btn"><X size={24} /></button>
            </div>
            <form onSubmit={handleLoginSubmit} className="form">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <button type="submit">Sign In</button>
            </form>
            <div className="modal-signup-link">
              <span>Don't have an account? </span>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;
