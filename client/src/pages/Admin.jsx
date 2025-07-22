import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TwoFASetup from "../components/TwoFASetup";

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMenu, setShowMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState("");

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      // Check for expiration
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      if (decoded.role !== "admin") {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        setUser(decoded);
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate, token]);

  // Fetch all users for admin management
  useEffect(() => {
    if (!user) return;
    setLoadingUsers(true);
    fetch("http://localhost:5002/api/auth/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const sortedUsers = (data.users || []).sort((a, b) => a.id - b.id);
        setUsers(sortedUsers);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, [user, token, userActionMsg]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = (
    <>
      <a href="#overview" style={styles.navItem1}>
        🧾 Overview
      </a>
      <a href="#users" style={styles.navItem2}>
        👥 Manage Users
      </a>
      <a href="#products" style={styles.navItem1}>
        🛍️ Manage Products
      </a>
      <a href="#orders" style={styles.navItem2}>
        📦 Manage Orders
      </a>
      <a href="#reports" style={styles.navItem1}>
        📈 Reports
      </a>
    </>
  );

  return (
    <div style={styles.container}>
      {isMobile ? (
        <header style={styles.mobileHeader}>
          <img
            src="/assets/finmark-logo-full.png"
            alt="FinMark Logo"
            style={{ height: "40px" }}
          />
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={styles.hamburger}
          >
            ☰
          </button>
          {showMenu && (
            <div style={styles.mobileNav}>
              {navLinks}
              <button onClick={handleLogout} style={styles.logoutButton}>
                🚪 Logout
              </button>
            </div>
          )}
        </header>
      ) : (
        <Sidebar navLinks={navLinks} onLogout={handleLogout} styles={styles} />
      )}

      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.greeting}>
            Admin Panel: Welcome, {user?.name || "Admin"} 👋
          </h1>
          <p style={styles.subGreeting}>
            You are logged in as <strong>admin</strong>
          </p>
        </header>

        {/* 2FA options for admin */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
            Your 2FA Options
          </h2>
          <TwoFASetup token={token} />
        </section>

        {/* User management section */}
        <section style={styles.dashboard}>
          <div style={styles.card}>
            <h2>👥 User Management</h2>
            <p>List, promote/demote, and delete users below.</p>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              <table
                style={{ width: "100%", fontSize: "0.98rem", marginTop: 12 }}
              >
                <thead>
                  <tr style={{ background: "#f4f4f0" }}>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Email Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        background: u.role === "admin" ? "#e6eed9" : "#fff",
                      }}
                    >
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.isEmailVerified ? "Yes" : "No"}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            setUserActionMsg("");
                            const newRole = e.target.value;
                            await fetch(
                              "http://localhost:5002/api/auth/admin/set-role",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  userId: u.id,
                                  role: newRole,
                                }),
                              }
                            );
                            setUserActionMsg(
                              `Role for ${u.email} set to ${newRole}`
                            );
                          }}
                          style={{ marginRight: 8 }}
                          disabled={u.id === user?.id}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          onClick={async () => {
                            setUserActionMsg("");
                            await fetch(
                              `http://localhost:5002/api/auth/admin/delete/${u.id}`,
                              {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            setUserActionMsg(`Deleted user ${u.email}`);
                          }}
                          style={{
                            color: "#fff",
                            background: "#c00",
                            border: "none",
                            borderRadius: 4,
                            padding: "0.3rem 0.7rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          disabled={u.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {userActionMsg && (
              <p style={{ color: "#2e7d32", marginTop: 8 }}>{userActionMsg}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f4f4f0",
    color: "#2e7d32",
    display: "flex",
    flexDirection: "row",
    height: "100vh",
    margin: "-10px",
    overflow: "hidden",
  },
  mobileHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#dbe4c6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    zIndex: 1000,
  },
  hamburger: {
    fontSize: "1.8rem",
    background: "transparent",
    border: "none",
    color: "#2e7d32",
    cursor: "pointer",
    margin: "2px 40px",
  },
  mobileNav: {
    position: "absolute",
    top: "100%",
    right: 50,
    width: "50%",
    backgroundColor: "#e6eed9",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    gap: "1rem",
  },
  sidebar: {
    width: "300px",
    backgroundColor: "#dbe4c6",
    display: "flex",
    flexDirection: "column",
    padding: "3rem 2rem",
    height: "100vh",
    boxSizing: "border-box",
  },
  navWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flexGrow: 1,
    height: "100%",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "flex-start",
    paddingBottom: "1rem",
  },
  divider: {
    height: "1px",
    backgroundColor: "#b2bfa3",
    marginBottom: "1.5rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  navItem1: {
    textDecoration: "none",
    color: "#2e7d32",
    fontWeight: "bold",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#b0d8b9",
  },
  navItem2: {
    textDecoration: "none",
    color: "#2e7d32",
    fontWeight: "bold",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#b1c897",
  },
  logoutButton: {
    padding: "0.75rem",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "2rem",
  },
  main: {
    flex: 1,
    padding: "6rem 2rem 2rem",
    overflowY: "auto",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "2rem",
  },
  greeting: {
    fontSize: "2rem",
    margin: 0,
  },
  subGreeting: {
    fontSize: "1.1rem",
    marginTop: "0.5rem",
    color: "#666",
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
};

export default Admin;
