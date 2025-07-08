import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    jwtDecode(token); // just validate the token
    return children;
  } catch {
    return <Navigate to="/" />;
  }
}

export default RequireAuth;