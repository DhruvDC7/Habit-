export default function ProfilePage() {
  return (
    <div>
      <h1 className="screen-title">PROFILE</h1>
      <div className="card" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'rgba(54,215,255,0.15)',
          border: '1px solid rgba(54,215,255,0.35)', display: 'grid', placeItems: 'center', color: 'var(--neon)', fontSize: 36
        }}>👤</div>
        <div style={{ marginTop: 12, fontSize: 18 }}>User Name</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Joined: Jan 1, 2024</div>
      </div>

      <div className="section-title">STATISTICS</div>
      <div className="row">
        <div className="card stat-card"><div className="stat-value">45 Days</div><div className="stat-label">Longest Streak</div></div>
        <div className="card stat-card"><div className="stat-value">350</div><div className="stat-label">Total Completions</div></div>
      </div>

      <div className="section-title">GOALS</div>
      <div className="card">Run a Marathon</div>

      <div className="section-title">SETTINGS</div>
      <div className="card">Change Password</div>
    </div>
  );
}
