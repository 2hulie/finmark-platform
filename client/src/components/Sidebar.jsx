import Logo from "./Logo";

const Sidebar = ({ navLinks, onLogout, styles }) => (
  <aside style={styles.sidebar}>
    <div style={styles.logoContainer}>
      <Logo width="85%" />
    </div>
    <div style={styles.divider} />
    <div style={styles.navWrapper}>
      <nav style={styles.nav}>{navLinks}</nav>
      <button onClick={onLogout} style={styles.logoutButton}>🚪 Logout</button>
    </div>
  </aside>
);

export default Sidebar;