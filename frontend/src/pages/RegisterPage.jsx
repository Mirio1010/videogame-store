/**
 * RegisterPage Component
 *
 * User registration form with name, email, and password.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../components/Auth/AuthHeader";
import AuthError from "../components/Auth/AuthError";
import RegisterForm from "../components/Auth/RegisterForm";
import AuthInfo from "../components/Auth/AuthInfo";
import "../Styles/AuthPages.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate registration (replace with real API later)
    setTimeout(() => {
      setLoading(false);
      if (formData.name && formData.email && formData.password) {
        navigate("/login");
      } else {
        setError("Please fill in all fields");
      }
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <AuthHeader
            title="Create Account"
            subtitle="Join the gaming community"
          />
          {error && <AuthError error={error} />}
          <RegisterForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
          />
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <AuthInfo />
      </div>
    </div>
  );
}

export default RegisterPage;
