"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [reminders, setReminders] = useState(true);

  return (
    <div>
      <h1 className="screen-title">SETTINGS</h1>

      <div className="section-title">APPEARANCE</div>
      <div className="card">Dark theme is enabled by default</div>

      <div className="section-title">NOTIFICATIONS</div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div>Reminders</div>
          <div className="muted" style={{ fontSize: 12 }}>Push a reminder when it&#39;s time</div>
        </div>
        <input
          type="checkbox"
          checked={reminders}
          onChange={(e) => setReminders(e.target.checked)}
        />
      </div>

      <div className="section-title">ACCOUNT</div>
      <div className="card">Log out (coming soon)</div>
    </div>
  );
}
