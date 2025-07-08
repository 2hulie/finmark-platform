import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import colors from "../styles/colors";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5002/api/auth/forgot-password", {
        email,
      });
      setMessage(
        "If an account exists for this email, a reset link has been sent."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Logo />
        <div style={styles.divider} />
        <h2 style={styles.title}>Forgot Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p style={{ ...styles.success }}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.link} onClick={() => navigate("/")}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at center, rgb(255, 255, 255), rgb(115, 139, 104))",
    fontFamily: "'Hero', 'Segoe UI', sans-serif",
    margin: "-10px",
  },
  card: {
    background: colors.white,
    padding: "2rem 2.5rem",
    borderRadius: "1rem",
    boxShadow: `0 10px 25px ${colors.shadow}`,
    maxWidth: "380px",
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
    marginTop: 8,
  },
  error: {
    color: colors.error,
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  success: {
    color: colors.success,
    fontSize: "0.95rem",
    marginTop: "0.5rem",
    fontWeight: 600,
  },
  link: {
    background: "none",
    border: "none",
    color: colors.primary,
    textDecoration: "underline",
    fontWeight: "bold",
    marginTop: 16,
    cursor: "pointer",
  },
};

export default ForgotPassword;
