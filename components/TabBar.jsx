"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();
  const isActive = (p) => (pathname === p ? "active" : "");
  return (
    <nav className="tabbar">
      <Link className={isActive("/")} href="/">Dashboard</Link>
      <Link className={isActive("/profile")} href="/profile">Profile</Link>
      <Link className={isActive("/settings")} href="/settings">Settings</Link>
    </nav>
  );
}
