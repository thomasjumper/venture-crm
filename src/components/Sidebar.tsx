"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", label: "Dashboard", icon: "\u2B21" },
  { href: "/objectives", label: "Objectives", icon: "\u25CE" },
  { href: "/knowledge", label: "Knowledge Base", icon: "\u25C8" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col"
      style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
      <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--accent)" }}>
          Venture CRM
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Command Center
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors"
              style={{
                background: isActive ? "var(--bg-hover)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        {user && (
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {user.display_name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                @{user.username}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = "var(--danger)";
                (e.target as HTMLButtonElement).style.borderColor = "var(--danger)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = "var(--text-secondary)";
                (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              Logout
            </button>
          </div>
        )}
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          AgentBay Internal v0.1
        </p>
      </div>
    </aside>
  );
}
