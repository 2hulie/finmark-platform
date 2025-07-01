import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5002/api/auth";

const TwoFASetup = ({ token }) => {
  const [method, setMethod] = useState("authenticator");
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [email, setEmail] = useState("");
  const [setupStarted, setSetupStarted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [is2FAEmailEnabled, setIs2FAEmailEnabled] = useState(false);
  const [is2FAAuthenticatorEnabled, setIs2FAAuthenticatorEnabled] =
    useState(false);

  useEffect(() => {
    // Fetch 2FA status and email 2FA availability
    const fetchStatus = async () => {
      try {
        // Get 2FA status (both methods)
        const statusRes = await axios.get(`${API}/2fa/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIs2FAEmailEnabled(statusRes.data.is2FAEmailEnabled);
        setIs2FAAuthenticatorEnabled(statusRes.data.is2FAAuthenticatorEnabled);
        setEmail(statusRes.data.email);
        setEmailAvailable(statusRes.data.isEmailVerified);
      } catch (err) {
        setEmailAvailable(false);
        setIs2FAEmailEnabled(false);
        setIs2FAAuthenticatorEnabled(false);
      }
    };
    fetchStatus();
  }, [token]);

  // Reset setup state when switching methods
  useEffect(() => {
    setMessage("");
    setCode("");
    setQr(null);
    setSecret("");
    setSetupStarted(false);
    setResendTimer(0);
    // Do NOT automatically trigger setup for email when switching
    // Only trigger setup when user presses the Setup 2FA button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSetup = async () => {
    setMessage("");
    setQr(null);
    setSecret("");
    setSetupStarted(true);
    try {
      const res = await axios.post(
        `${API}/2fa/setup`,
        { method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (method === "authenticator") {
        setQr(res.data.qr);
        setSecret(res.data.secret);
      } else {
        setMessage(res.data.message || "Check your email for a code.");
      }
    } catch (err) {
      setMessage("2FA setup failed");
    }
  };

  const handleVerify = async () => {
    setMessage("");
    try {
      let res;
      if (method === "authenticator") {
        res = await axios.post(
          `${API}/2fa/verify`,
          { token: code },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${API}/2fa/email/verify`,
          { code },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (res.data.success) {
        setMessage("2FA enabled!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage("Invalid code");
      }
    } catch (err) {
      setMessage("Verification failed");
    }
  };

  // If both 2FA methods are enabled, show message and allow disabling individually
  if (is2FAEmailEnabled && is2FAAuthenticatorEnabled) {
    return (
      <div style={{ margin: "1rem 0", color: "#2e7d32", fontWeight: "bold" }}>
        Both 2FA methods are enabled for your account.
        <br />
        You can use either method to log in, or disable one below if you wish.
        <div style={{ marginTop: "2rem" }}>
          <button
            style={{
              marginRight: 16,
              padding: "0.5rem 1.2rem",
              borderRadius: "0.5rem",
              background: "#c00",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={async () => {
              setMessage("");
              try {
                await axios.post(
                  `${API}/2fa/disable`,
                  { method: "email" },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setIs2FAEmailEnabled(false);
                setMessage("Email 2FA disabled.");
              } catch (err) {
                if (err.response?.data?.message) {
                  setMessage(err.response.data.message);
                } else {
                  setMessage("Failed to disable Email 2FA.");
                }
              }
            }}
          >
            Disable Email 2FA
          </button>
          <button
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "0.5rem",
              background: "#c00",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={async () => {
              setMessage("");
              try {
                await axios.post(
                  `${API}/2fa/disable`,
                  { method: "authenticator" },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setIs2FAAuthenticatorEnabled(false);
                setMessage("Authenticator 2FA disabled.");
              } catch (err) {
                if (err.response?.data?.message) {
                  setMessage(err.response.data.message);
                } else {
                  setMessage("Failed to disable Authenticator 2FA.");
                }
              }
            }}
          >
            Disable Authenticator 2FA
          </button>
        </div>
        {message && (
          <p
            style={{
              marginTop: "1rem",
              color: message.includes("enabled") ? "#2e7d32" : "#c00",
            }}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", marginRight: 12 }}>
          Choose 2FA Method:
        </label>
        <label
          style={{
            marginRight: 16,
            color: is2FAAuthenticatorEnabled ? "#aaa" : undefined,
          }}
        >
          <input
            type="radio"
            name="method"
            value="authenticator"
            checked={method === "authenticator"}
            onChange={() => setMethod("authenticator")}
            disabled={is2FAAuthenticatorEnabled}
          />
          Authenticator App {is2FAAuthenticatorEnabled && "(enabled)"}
        </label>
        <label
          style={{
            color: !emailAvailable || is2FAEmailEnabled ? "#aaa" : undefined,
          }}
        >
          <input
            type="radio"
            name="method"
            value="email"
            checked={method === "email"}
            onChange={() => setMethod("email")}
            disabled={!emailAvailable || is2FAEmailEnabled}
          />
          Email {is2FAEmailEnabled && "(enabled)"}{" "}
          {!is2FAEmailEnabled && emailAvailable && email
            ? `(${email})`
            : !emailAvailable
            ? "(verify email first)"
            : ""}
        </label>
      </div>
      {!(is2FAEmailEnabled && is2FAAuthenticatorEnabled) && (
        <button
          onClick={handleSetup}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
          disabled={
            (method === "authenticator" && is2FAAuthenticatorEnabled) ||
            (method === "email" && (!emailAvailable || is2FAEmailEnabled)) ||
            (setupStarted && method === "email" && !message)
          }
        >
          Setup 2FA
        </button>
      )}
      {/* Individual Disable 2FA buttons for each method */}
      {(is2FAEmailEnabled || is2FAAuthenticatorEnabled) && (
        <div style={{ marginTop: "2rem" }}>
          {is2FAEmailEnabled && (
            <button
              style={{
                marginRight: 16,
                padding: "0.5rem 1.2rem",
                borderRadius: "0.5rem",
                background: "#c00",
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
              onClick={async () => {
                setMessage("");
                try {
                  await axios.post(
                    `${API}/2fa/disable`,
                    { method: "email" },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setIs2FAEmailEnabled(false);
                  setMessage("Email 2FA disabled.");
                } catch (err) {
                  if (err.response?.data?.message) {
                    setMessage(err.response.data.message);
                  } else {
                    setMessage("Failed to disable Email 2FA.");
                  }
                }
              }}
            >
              Disable Email 2FA
            </button>
          )}
          {is2FAAuthenticatorEnabled && (
            <button
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "0.5rem",
                background: "#c00",
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
              onClick={async () => {
                setMessage("");
                try {
                  await axios.post(
                    `${API}/2fa/disable`,
                    { method: "authenticator" },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setIs2FAAuthenticatorEnabled(false);
                  setMessage("Authenticator 2FA disabled.");
                } catch (err) {
                  if (err.response?.data?.message) {
                    setMessage(err.response.data.message);
                  } else {
                    setMessage("Failed to disable Authenticator 2FA.");
                  }
                }
              }}
            >
              Disable Authenticator 2FA
            </button>
          )}
        </div>
      )}

      {/* Authenticator App Flow */}
      {method === "authenticator" && qr && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Scan this QR code with your authenticator app:</p>
          <img
            src={qr}
            alt="2FA QR"
            style={{ width: 180, height: 180, margin: "1rem 0" }}
          />
          <p>
            Or enter this secret manually: <b>{secret}</b>
          </p>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              marginBottom: "0.75rem",
            }}
          />
          <button
            onClick={handleVerify}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Verify 2FA
          </button>
          {message && (
            <div
              style={{
                marginTop: "1rem",
                background: "#fff3f3",
                border: "1px solid #c00",
                color: message.includes("enabled") ? "#2e7d32" : "#c00",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                fontSize: "1rem",
                textAlign: "center",
                minHeight: 32,
              }}
              role="alert"
              aria-live="assertive"
            >
              {message}
            </div>
          )}
        </div>
      )}
      {/* Email 2FA Flow */}
      {method === "email" && setupStarted && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Enter the 6-digit code sent to your email:</p>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              marginBottom: "0.75rem",
            }}
          />
          <button
            onClick={handleVerify}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginRight: "1rem",
            }}
          >
            Verify 2FA
          </button>
          <button
            onClick={() => {
              handleSetup();
              setResendTimer(60);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: resendTimer > 0 ? "#aaa" : "#1976d2",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: resendTimer > 0 ? "not-allowed" : "pointer",
            }}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend (${resendTimer})` : "Resend Code"}
          </button>
          {message && (
            <div
              style={{
                marginTop: "1rem",
                background: "#fff3f3",
                border: "1px solid #c00",
                color: message.includes("enabled") ? "#2e7d32" : "#c00",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                fontSize: "1rem",
                textAlign: "center",
                minHeight: 32,
              }}
              role="alert"
              aria-live="assertive"
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFASetup;
