import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const RegisterPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return 'All fields are required.';
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await apiClient.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate('/login', {
        replace: true,
        state: { message: 'Registration successful. Please log in.' },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="mx-auto auth-panel">
        <p className="auth-brand">FR Compare<span>Supplier Quotation Management and Comparison System</span></p>
        <h1 className="mb-3">Create your account.</h1>
        <p className="text-muted">A dedicated workspace for considered purchasing decisions.</p>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              className="form-control"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-control"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-3 mb-0">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
