"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⬡" },
  { href: "/objectives", label: "Objectives", icon: "◎" },
  { href: "/knowledge", label: "Knowledge Base", icon: "◈" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <div className="p-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
        AgentBay Internal v0.1
      </div>
    </aside>
  );
}
