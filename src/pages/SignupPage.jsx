import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", formData);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Signup failed:", error);

      const message =
        error.response?.data?.message ||
        "Unable to create account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our e-commerce platform</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
