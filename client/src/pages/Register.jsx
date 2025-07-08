import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import Logo from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import colors from "../styles/colors";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [showVerifyMsg, setShowVerifyMsg] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // Password policy check (frontend, matches backend)
    const passwordPolicy =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordPolicy.test(form.password)) {
      setMessage(
        "Password must be at least 8 characters, include upper and lower case letters, a number, and a special character."
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:5002/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setShowVerifyMsg(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5002/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setMessage("Verification email resent. Check your inbox.");
    } catch (err) {
      setMessage("Failed to resend verification email.");
    }
    setResending(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Logo />
        <div style={styles.divider} />
        <h2 style={styles.title}>Create your account</h2>
        {showVerifyMsg ? (
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ color: colors.primary, fontWeight: 500 }}>
              Registration successful!
              <br />
              Please check your email and click the verification link to
              activate your account.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              style={{ ...styles.button, marginTop: 12 }}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend Verification Email"}
            </button>
            {message && <p style={styles.message}>{message}</p>}
          </div>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <PasswordInput
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button type="submit" style={styles.button}>
              Register
            </button>
            {message && <p style={styles.message}>{message}</p>}
          </form>
        )}
        <p style={styles.linkText}>
          Already have an account?{" "}
          <Link to="/" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    margin: -10,
    padding: 0,
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at center, rgb(255, 255, 255), rgb(139, 165, 136))",
    fontFamily: "'Hero', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: colors.white,
    padding: "2rem 2.5rem",
    borderRadius: "1rem",
    boxShadow: `0 10px 25px ${colors.shadow}`,
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "1rem 0",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: colors.primary,
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  input: {
    padding: "0.85rem",
    borderRadius: "0.5rem",
    border: `1px solid ${colors.border}`,
    fontSize: "1rem",
    outlineColor: colors.primary,
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "0.85rem",
    borderRadius: "0.5rem",
    border: "none",
    backgroundColor: colors.primary,
    color: colors.white,
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  message: {
    marginTop: "0.75rem",
    fontSize: "0.95rem",
    color: colors.error,
  },
  linkText: {
    marginTop: "1.2rem",
    fontSize: "0.95rem",
    color: "#555",
  },
  link: {
    color: colors.primary,
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Register;
