export default function HabitCard({ name, icon = "🛌", progress = 0, total = 5 }) {
  const dots = Array.from({ length: total });
  return (
    <div className="card habit-card">
      <div className="habit-icon">{icon}</div>
      <div className="habit-name">{name}</div>
      <div className="dots">
        {dots.map((_, i) => (
          <span key={i} className={`dot ${i < progress ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
