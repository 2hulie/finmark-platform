import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ name, placeholder, value, onChange, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          padding: "0.85rem",
          paddingRight: "2.5rem",
          borderRadius: "0.5rem",
          border: "1px solid #ccc",
          fontSize: "1rem",
          outlineColor: "#2e7d32",
          width: "100%",
          boxSizing: "border-box"
        }}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "0.85rem",
          cursor: "pointer",
          color: "#777",
          fontSize: "1rem"
        }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
};

export default PasswordInput;