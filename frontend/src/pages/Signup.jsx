import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';

function SignUp() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role : 'patient',
    first_name: null,
    last_name: null,
    phone: null,
    address: null,
    gender: null,
    dob: null,           // date of birth
    profile_image: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (formData.password !== formData.confirmPassword) {
  //     setError('Passwords do not match.');
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://127.0.0.1:8000/api/register/`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         username: formData.username,
  //         email: formData.email,
  //         password: formData.password
  //       })
  //     });

  //     const data = await response.json();
  //     console.log(data)

  //     if (!response.ok) {
  //       setError(data.error || data.message || 'Registration failed');
  //       alert(data.error || data.message || 'Registration failed');

  //     } else {
  //       setError('');
  //           try {
  //                   const response = await fetch(`http://127.0.0.1:8000/api/patient/`, {
  //                     method: "POST",
  //                     headers: {
  //                       "Content-Type": "application/json",
  //                       // Add authorization headers here if needed
  //                     },
  //                     body: JSON.stringify(data),
  //                   });

  //                   if (!response.ok) {
  //                     alert('1')
  //                     throw new Error(`Error: ${response.statusText}`);

  //                   }

  //                   const data = await response.json();
  //                   setSuccess("Post created successfully!");
  //                   console.log("New post:", data);
  //           } catch (err) {
  //                   alert(err.message)
  //                   setError(err.message);

  //           } finally {
  //                   setLoading(false);
  //                 }


  //       alert('Sign up successful! You can now log in.');

  //       navigate('/');  // Redirect to login page
  //     }
  //   }catch (err) {
  //     setError("Something went wrong. Try again later.");
  //     alert(err.message || err);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    console.log(formData)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email,
          name: formData.username,
          email: formData.email,
          password: formData.password,
          user_type: formData.role 
        })
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        setError(data.error || data.message || 'Registration failed');
        alert(data.error || data.message || 'Registration failed');
        return;
      }

      // Store JWT token
      localStorage.setItem('token', data.tokens.access);

      alert('Sign up successful! You are now logged in.');

      navigate('/');  // Redirect to main app/dashboard
    } catch (err) {
      setError('Something went wrong. Try again later.');
      alert(err.message || err);
    }
  };



  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an Account</h2>
        <p>Join MediSphere to manage your health journey.</p>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {error && <p className="signup-error">{error}</p>}
          <button type="submit">Create Account</button>
        </form>
        <div className="signup-login-link">
          <div className="role-selection">
            <label>
              <input
                type="radio"
                name="role"
                value="patient"
                checked={formData.role === 'patient'}
                onChange={handleChange}
              />
              Patient
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={formData.role === 'doctor'}
                onChange={handleChange}
              />
              Doctor
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={handleChange}
              />
              Admin
            </label>
          </div>

          <span>Already have an account? </span>
          <Link to="/">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
