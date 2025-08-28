"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlowButton from "@/components/GlowButton";

const WEEKDAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const ICONS = ["📚","🛌","🏋️","🧘","🥤","🚶","🧠","🧹","💧"];

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [type, setType] = useState("daily");
  const [days, setDays] = useState(["MON"]);
  const [reminderTime, setReminderTime] = useState("07:00");
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (d) => {
    setDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          icon,
          frequency: type === "daily" ? { type } : { type: "custom", days },
          reminderTime: isReminderEnabled ? reminderTime : null,
          isReminderEnabled,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      router.push("/");
      router.refresh?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="screen-title">NEW HABIT</h1>

      <div className="section-title">NAME</div>
      <input type="text" placeholder="e.g., Drink Water, Meditate" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="section-title">ICON</div>
      <div className="row wrap">
        {ICONS.map((i) => (
          <button type="button" key={i} onClick={() => setIcon(i)} className={`glow-button ${icon === i ? 'primary' : ''}`}>{i}</button>
        ))}
      </div>

      <div className="section-title">FREQUENCY</div>
      <div className="row">
        <button type="button" className={`glow-button ${type === 'daily' ? 'primary' : ''}`} onClick={() => setType('daily')}>Daily</button>
        <button type="button" className={`glow-button ${type === 'custom' ? 'primary' : ''}`} onClick={() => setType('custom')}>Custom</button>
      </div>
      {type === "custom" && (
        <div className="row wrap" style={{ marginTop: 10 }}>
          {WEEKDAYS.map((d) => (
            <button type="button" key={d} onClick={() => toggleDay(d)} className={`glow-button ${days.includes(d) ? 'primary' : ''}`}>{d}</button>
          ))}
        </div>
      )}

      <div className="section-title">REMINDER</div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="field" style={{ maxWidth: 140 }} />
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Enable</span>
          <input type="checkbox" checked={isReminderEnabled} onChange={(e) => setIsReminderEnabled(e.target.checked)} />
        </label>
      </div>

      {error && <div className="card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: 12 }}>{error}</div>}

      <div style={{ height: 16 }} />
      <GlowButton type="submit" className="primary" onClick={() => {}}>{submitting ? 'Creating...' : 'CREATE HABIT'}</GlowButton>
    </form>
  );
}
