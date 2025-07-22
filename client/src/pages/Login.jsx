import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import TwoFALogin from "../components/TwoFALogin";
import colors from "../styles/colors";

function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(() => {
    if (location.state && location.state.email) return location.state.email;
    return "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);

  // Auto-fill email and show message after verification
  // Handle Google OAuth redirect token and verified email login state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const twoFARequired = urlParams.get("twoFARequired");
    const googleEmail = urlParams.get("email");
    const available2FAMethods = urlParams.get("available2FAMethods");

    if (token) {
      localStorage.setItem("token", token);
      const user = JSON.parse(atob(token.split(".")[1]));
      navigate(user.role === "admin" ? "/admin" : "/home");
      return;
    }

    // Handle Google OAuth 2FA-required redirect
    if (twoFARequired === "true" && googleEmail && available2FAMethods) {
      let methods = [];
      try {
        methods = JSON.parse(available2FAMethods);
      } catch (e) {
        // fallback: try splitting by comma if not valid JSON
        methods = available2FAMethods.split(",");
      }
      setShow2FA({ availableMethods: methods });
      setPendingEmail(googleEmail);
      setEmail(googleEmail);
      setError("");
      return;
    }

    if (location.state && location.state.autoLogin && location.state.email) {
      setEmail(location.state.email);
      setError("Email verified! Please log in.");
      // Optionally focus password input for smoother UX
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }
    // eslint-disable-next-line
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShow2FA(false);
    setPendingEmail("");
    // Validate fields before submitting
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5002/api/auth/login", {
        email,
        password,
      });
      if (res.data.twoFARequired) {
        setShow2FA({
          availableMethods: res.data.available2FAMethods,
        });
        setPendingEmail(email);
        return;
      }
      const token = res.data.token;
      localStorage.setItem("token", token);
      const user = JSON.parse(atob(token.split(".")[1]));
      alert("Login successful!");
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setResendStatus("");
    }
  };

  const handleResendVerification = async () => {
    setResendStatus("");
    try {
      await axios.post("http://localhost:5002/api/auth/resend-verification", {
        email,
      });
      setResendStatus("Verification email resent! Please check your inbox.");
    } catch (err) {
      setResendStatus(
        err.response?.data?.message || "Failed to resend verification email"
      );
    }
  };

  const handle2FASuccess = (token) => {
    const user = JSON.parse(atob(token.split(".")[1]));
    alert("Login successful!");
    navigate(user.role === "admin" ? "/admin" : "/home");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Logo />
        <div style={styles.divider} />
        <h2 style={styles.title}>Welcome back</h2>
        {show2FA ? (
          <TwoFALogin
            email={pendingEmail}
            onSuccess={handle2FASuccess}
            onCancel={() => setShow2FA(false)}
            availableMethods={show2FA.availableMethods}
          />
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <div style={{ position: "relative", width: "100%" }}>
              <PasswordInput
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputRef={passwordInputRef}
              />
              <Link
                to="/forgot-password"
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -32, // increased gap
                  fontSize: "0.95rem",
                  color: colors.secondary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 500,
                  marginBottom: 8, // extra spacing
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              style={{ ...styles.button, marginTop: "2rem" }}
            >
              Login
            </button>
            <a
              href="http://localhost:5002/api/auth/google"
              style={{ textDecoration: "none" }}
            >
              <button
                type="button"
                style={{
                  background: "#fff",
                  color: "#222",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 8px rgba(60,64,67,.08)",
                  borderRadius: "0.5rem",
                  padding: "0.85rem",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontWeight: 500,
                  fontSize: "1rem",
                  marginTop: "0.5rem",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
              >
                <img
                  src="/assets/google_logo.png"
                  alt="Google logo"
                  style={{
                    width: 22,
                    height: 22,
                    display: "inline",
                    verticalAlign: "middle",
                  }}
                />
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: "#222",
                    letterSpacing: 0,
                  }}
                >
                  Sign in with Google
                </span>
              </button>
            </a>
            {error && (
              <>
                <p style={styles.error}>{error}</p>
                {error === "Please verify your email before logging in." && (
                  <>
                    <button
                      type="button"
                      style={{
                        ...styles.button,
                        color: colors.white,
                        marginTop: 8,
                      }}
                      onClick={handleResendVerification}
                    >
                      Resend verification email
                    </button>
                    {resendStatus && (
                      <p style={{ ...styles.error, color: colors.success }}>
                        {resendStatus}
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </form>
        )}
        <p style={styles.linkText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
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
  },
  error: {
    color: colors.error,
    fontSize: "0.9rem",
    marginTop: "0.5rem",
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

export default Login;
