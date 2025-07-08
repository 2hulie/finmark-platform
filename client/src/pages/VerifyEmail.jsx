import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import colors from "../styles/colors";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }
    axios
      .get(`http://localhost:5002/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setMessage("Email verified! You can now log in.");
        setSuccess(true);
      })
      .catch(() => {
        setMessage("Verification failed or link expired.");
        setSuccess(false);
      });
  }, [location]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Email Verification</h2>
        <p style={{ color: success ? colors.primary : colors.error }}>
          {message}
        </p>
        <p style={styles.linkText}>
          <Link to="/" style={styles.link}>
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at center, #fff, #8ba588)",
    fontFamily: "'Hero', 'Segoe UI', sans-serif",
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
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: colors.primary,
    fontWeight: 600,
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

export default VerifyEmail;
