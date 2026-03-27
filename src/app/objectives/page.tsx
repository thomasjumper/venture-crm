"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

interface Objective {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_count: number;
  task_count: number;
  tasks_done: number;
  created_at: string;
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  const load = () => fetch("/api/objectives").then(r => r.json()).then(setObjectives);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/objectives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", description: "", priority: "medium" });
    setShowCreate(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Objectives</h1>
          <p style={{ color: "var(--text-secondary)" }}>High-level goals driving execution</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--accent)", color: "white" }}>
          + New Objective
        </button>
      </div>

      <div className="space-y-3">
        {objectives.map(obj => (
          <Link key={obj.id} href={`/objectives/${obj.id}`}
            className="block rounded-xl p-5 transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{obj.title}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={obj.priority} />
                <StatusBadge status={obj.status} />
              </div>
            </div>
            {obj.description && (
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{obj.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>{obj.project_count} projects</span>
              <span>{obj.tasks_done}/{obj.task_count} tasks done</span>
              <span>Created {new Date(obj.created_at).toLocaleDateString()}</span>
              {obj.task_count > 0 && (
                <div className="flex-1 max-w-xs h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(obj.tasks_done / obj.task_count) * 100}%`,
                    background: "var(--success)",
                  }} />
                </div>
              )}
            </div>
          </Link>
        ))}
        {objectives.length === 0 && (
          <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>No objectives yet</p>
            <button onClick={() => setShowCreate(true)} className="text-sm" style={{ color: "var(--accent)" }}>
              Create your first objective →
            </button>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Objective">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "white" }}>
            Create Objective
          </button>
        </form>
      </Modal>
    </div>
  );
}
