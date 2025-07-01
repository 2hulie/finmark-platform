import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") navigate("/");
      else setUser(decoded);
    } catch {
      navigate("/");
    }
  }, [navigate, token]);

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
      <a href="#overview" style={styles.navItem1}>🧾 Overview</a>
      <a href="#users" style={styles.navItem2}>👥 Manage Users</a>
      <a href="#products" style={styles.navItem1}>🛍️ Manage Products</a>
      <a href="#orders" style={styles.navItem2}>📦 Manage Orders</a>
      <a href="#reports" style={styles.navItem1}>📈 Reports</a>
    </>
  );

  return (
    <div style={styles.container}>
      {isMobile ? (
        <header style={styles.mobileHeader}>
          <img src="/assets/finmark-logo-full.png" alt="FinMark Logo" style={{ height: "40px" }} />
          <button onClick={() => setShowMenu(!showMenu)} style={styles.hamburger}>☰</button>
          {showMenu && (
            <div style={styles.mobileNav}>
              {navLinks}
              <button onClick={handleLogout} style={styles.logoutButton}>🚪 Logout</button>
            </div>
          )}
        </header>
      ) : (
        <Sidebar navLinks={navLinks} onLogout={handleLogout} styles={styles} />
      )}

      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.greeting}>Admin Panel: Welcome, {user?.name || "Admin"} 👋</h1>
          <p style={styles.subGreeting}>
            You are logged in as <strong>admin</strong>
          </p>
        </header>
        <section style={styles.dashboard}>
          <div style={styles.card}>
            <h2>👥 Total Users</h2>
            <p>102</p>
          </div>
          <div style={styles.card}>
            <h2>🛍️ Active Products</h2>
            <p>58</p>
          </div>
          <div style={styles.card}>
            <h2>📦 Orders Processed</h2>
            <p>489</p>
          </div>
          <div style={styles.card}>
            <h2>📈 Monthly Report</h2>
            <p>₱782,000 Revenue</p>
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