import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5002/api/auth";

const TwoFALogin = ({ email, onSuccess, onCancel, availableMethods }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [method, setMethod] = useState(
    availableMethods && availableMethods.length === 1
      ? availableMethods[0]
      : availableMethods && availableMethods.includes("authenticator")
      ? "authenticator"
      : "email"
  );
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleSendEmailCode = async () => {
    setSending(true);
    setError("");
    try {
      await axios.post(`${API}/2fa/email/send`, { email });
      setEmailCodeSent(true);
      setTimer(60); // 1 minute, matches backend code validity
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email code");
    }
    setSending(false);
  };

  const handle2FALogin = async (e) => {
    e.preventDefault();
    setError("");
    // For email 2FA, require that the code has been sent before allowing submit
    if (method === "email" && !emailCodeSent) {
      setError("Please click 'Send 2FA Code to Email' first.");
      return;
    }
    // Show error if code is empty
    if (!code.trim()) {
      setError("Please enter your 2FA code.");
      return;
    }
    try {
      let res;
      if (method === "authenticator") {
        res = await axios.post(`${API}/2fa/login`, { email, code });
      } else {
        res = await axios.post(`${API}/2fa/email/login`, { email, code });
      }
      const token = res.data.token;
      localStorage.setItem("token", token);
      onSuccess(token);
    } catch (err) {
      // Always show a user-friendly error for invalid/expired code
      if (
        err.response?.data?.message &&
        err.response.data.message.toLowerCase().includes("2fa code")
      ) {
        setError(
          "Invalid or expired 2FA code. Please check your code and try again."
        );
      } else {
        setError(err.response?.data?.message || "2FA login failed");
      }
    }
  };

  return (
    <form
      onSubmit={handle2FALogin}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginTop: "1.5rem",
      }}
    >
      {availableMethods && availableMethods.length > 1 && (
        <>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              textAlign: "center",
            }}
          >
            Choose 2FA Method:
          </label>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 8,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {availableMethods.includes("authenticator") && (
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="method"
                  value="authenticator"
                  checked={method === "authenticator"}
                  onChange={() => setMethod("authenticator")}
                />
                Authenticator App
              </label>
            )}
            {availableMethods.includes("email") && (
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={method === "email"}
                  onChange={() => setMethod("email")}
                />
                Email
              </label>
            )}
          </div>
        </>
      )}
      {method === "email" && !emailCodeSent && (
        <button
          type="button"
          onClick={handleSendEmailCode}
          disabled={sending}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "0.5rem",
            background: sending ? "#aaa" : "#2e7d32",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          {sending ? "Sending..." : "Send 2FA Code to Email"}
        </button>
      )}
      {method === "email" && emailCodeSent && (
        <button
          type="button"
          onClick={() => {
            setEmailCodeSent(false);
            setCode("");
            handleSendEmailCode();
          }}
          disabled={timer > 0}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: "0.5rem",
            background: timer > 0 ? "#aaa" : "#1976d2",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: timer > 0 ? "not-allowed" : "pointer",
            marginBottom: 8,
          }}
        >
          {timer > 0 ? `Resend in ${timer}s` : "Resend 2FA Code to Email"}
        </button>
      )}
      {/* Only show code input and verify button for authenticator, or for email after code is sent */}
      {(method === "authenticator" ||
        (method === "email" && emailCodeSent)) && (
        <>
          <label htmlFor="2fa-code">Enter 2FA Code</label>
          <input
            id="2fa-code"
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{
              padding: "0.85rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.85rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#2e7d32",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            disabled={method === "email" && !emailCodeSent}
          >
            Verify 2FA
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          color: "#2e7d32",
          cursor: "pointer",
          marginTop: "-0.5rem",
        }}
      >
        Cancel
      </button>
      {error && (
        <p
          style={{
            color: "#c00",
            fontSize: "1rem",
            fontWeight: "bold",
            marginTop: "0.5rem",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default TwoFALogin;
