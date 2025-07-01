import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "admin") {
      return <Navigate to="/home" />;
    }
    return children;
  } catch {
    return <Navigate to="/" />;
  }
}

export default RequireAdmin;