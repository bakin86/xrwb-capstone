/**
 * Register.jsx
 *
 * React registration component for the Best Cars Dealership application.
 * Collects: Username, First Name, Last Name, Email, Password.
 * Validates all fields client-side, then POSTs to /djangoapp/register/.
 *
 * Usage:
 *   import Register from './components/Register/Register';
 *   <Register onLoginSuccess={(user) => setCurrentUser(user)} />
 */

import React, { useState } from 'react';

// ── Inline styles (no external CSS dependency required) ──────────────────────
const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  logo: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#1a3c5e', margin: '0 0 0.25rem' },
  subtitle: { color: '#718096', fontSize: '0.9rem', margin: 0 },
  fieldGroup: { marginBottom: '1.1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2d3748', marginBottom: '0.35rem' },
  required: { color: '#e53e3e', marginLeft: '2px' },
  input: {
    width: '100%', padding: '0.65rem 0.9rem',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.95rem', color: '#2d3748', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  },
  inputFocus:  { borderColor: '#1a3c5e', boxShadow: '0 0 0 3px rgba(26,60,94,0.12)' },
  inputError:  { borderColor: '#e53e3e' },
  fieldError:  { color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.3rem' },
  row: { display: 'flex', gap: '0.9rem' },
  alert: { padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' },
  alertError:   { background: '#fff5f5', border: '1.5px solid #e53e3e', color: '#c53030' },
  alertSuccess: { background: '#f0fff4', border: '1.5px solid #38a169', color: '#276749' },
  submitBtn: {
    width: '100%', padding: '0.85rem',
    background: '#1a3c5e', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
    marginTop: '0.5rem', transition: 'background 0.2s',
  },
  submitBtnDisabled: { background: '#94a3b8', cursor: 'not-allowed' },
  loginPrompt: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#718096' },
  loginLink: { color: '#1a3c5e', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' },
};

// ── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

function validateFields(fields) {
  const errors = {};
  if (!fields.username.trim())
    errors.username = 'Username is required.';
  else if (fields.username.length < 3)
    errors.username = 'Username must be at least 3 characters.';
  else if (!/^[a-zA-Z0-9_]+$/.test(fields.username))
    errors.username = 'Only letters, numbers, and underscores allowed.';

  if (!fields.firstName.trim())  errors.firstName = 'First name is required.';
  if (!fields.lastName.trim())   errors.lastName  = 'Last name is required.';

  if (!fields.email.trim())
    errors.email = 'Email is required.';
  else if (!EMAIL_REGEX.test(fields.email))
    errors.email = 'Please enter a valid email address.';

  if (!fields.password)
    errors.password = 'Password is required.';
  else if (fields.password.length < PASSWORD_MIN)
    errors.password = 'Password must be at least 8 characters.';

  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────
function Register({ onLoginSuccess, onClose }) {
  const [fields, setFields] = useState({
    username: '', firstName: '', lastName: '', email: '', password: '',
  });
  const [errors,     setErrors]     = useState({});
  const [focused,    setFocused]    = useState(null);
  const [apiError,   setApiError]   = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focused === fieldName ? styles.inputFocus : {}),
    ...(errors[fieldName]     ? styles.inputError : {}),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const validationErrors = validateFields(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/djangoapp/register/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName:  fields.username,
          firstName: fields.firstName,
          lastName:  fields.lastName,
          email:     fields.email,
          password:  fields.password,
        }),
      });
      const data = await response.json();

      if (response.ok || response.status === 201) {
        setApiSuccess(`Welcome, ${data.firstName || fields.firstName}! Account created successfully.`);
        if (typeof onLoginSuccess === 'function') {
          setTimeout(() => onLoginSuccess(data), 1500);
        }
      } else if (response.status === 409) {
        setApiError(data.message || 'Username or email is already taken.');
      } else {
        setApiError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={styles.card} role="dialog" aria-modal="true" aria-labelledby="register-title">

        <div style={styles.header}>
          <div style={styles.logo}>🚗</div>
          <h2 id="register-title" style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Best Cars Dealership today</p>
        </div>

        {apiError   && <div style={{ ...styles.alert, ...styles.alertError   }} role="alert">⚠️ {apiError}</div>}
        {apiSuccess && <div style={{ ...styles.alert, ...styles.alertSuccess }} role="status">✅ {apiSuccess}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-username">
              Username <span style={styles.required}>*</span>
            </label>
            <input
              id="reg-username" type="text" name="username"
              value={fields.username} onChange={handleChange}
              onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
              style={getInputStyle('username')}
              placeholder="e.g. john_doe" autoComplete="username" disabled={loading}
            />
            {errors.username && <p style={styles.fieldError}>{errors.username}</p>}
          </div>

          {/* First + Last Name */}
          <div style={styles.row}>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="reg-first-name">
                First Name <span style={styles.required}>*</span>
              </label>
              <input
                id="reg-first-name" type="text" name="firstName"
                value={fields.firstName} onChange={handleChange}
                onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                style={getInputStyle('firstName')}
                placeholder="Jane" autoComplete="given-name" disabled={loading}
              />
              {errors.firstName && <p style={styles.fieldError}>{errors.firstName}</p>}
            </div>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="reg-last-name">
                Last Name <span style={styles.required}>*</span>
              </label>
              <input
                id="reg-last-name" type="text" name="lastName"
                value={fields.lastName} onChange={handleChange}
                onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                style={getInputStyle('lastName')}
                placeholder="Doe" autoComplete="family-name" disabled={loading}
              />
              {errors.lastName && <p style={styles.fieldError}>{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-email">
              Email Address <span style={styles.required}>*</span>
            </label>
            <input
              id="reg-email" type="email" name="email"
              value={fields.email} onChange={handleChange}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              style={getInputStyle('email')}
              placeholder="jane@example.com" autoComplete="email" disabled={loading}
            />
            {errors.email && <p style={styles.fieldError}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="reg-password">
              Password <span style={styles.required}>*</span>
            </label>
            <input
              id="reg-password" type="password" name="password"
              value={fields.password} onChange={handleChange}
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
              style={getInputStyle('password')}
              placeholder="At least 8 characters" autoComplete="new-password" disabled={loading}
            />
            {errors.password && <p style={styles.fieldError}>{errors.password}</p>}
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
            disabled={loading}
          >
            {loading ? '⏳ Registering…' : '🚀 Register'}
          </button>
        </form>

        <p style={styles.loginPrompt}>
          Already have an account?{' '}
          <span
            style={styles.loginLink}
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose?.()}
          >
            Sign in here
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;
