"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import HabitCard from "@/components/HabitCard";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/habits", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setHabits(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1 className="screen-title">HABITS</h1>
      <div className="row">
        <StatCard value={habits.length} label="total" />
        <StatCard value={"71%"} label="this week" />
      </div>

      <div style={{ height: 12 }} />
      <div className="row wrap" style={{ gap: 14, flexDirection: "column" }}>
        {(loading ? Array.from({ length: 4 }) : habits).map((h, i) => (
          <HabitCard
            key={h?._id || i}
            name={h?.name || "Loading..."}
            icon={"💤"}
            progress={(i % 5) + 1}
            total={5}
          />
        ))}
      </div>

      <Link href="/habits/new" className="fab" aria-label="Create Habit">
        +
      </Link>
    </div>
  );
}
