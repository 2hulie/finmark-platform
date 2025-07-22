import { useState } from "react";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import colors from "../styles/colors";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5002/api/auth/reset-password", {
        token,
        password,
      });
      setMessage("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Logo />
        <div style={styles.divider} />
        <h2 style={styles.title}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <PasswordInput
            name="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            name="confirm-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
