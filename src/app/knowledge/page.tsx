"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

const categories = ["general", "architecture", "process", "tool", "lesson", "pattern", "reference"];

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", tags: "" });

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filterCat) params.set("category", filterCat);
    fetch(`/api/knowledge?${params}`).then(r => r.json()).then(setEntries);
  };

  useEffect(() => { load(); }, [search, filterCat]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", content: "", category: "general", tags: "" });
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Knowledge Base</h1>
          <p style={{ color: "var(--text-secondary)" }}>Reusable context and learnings</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "white" }}>
          + New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search knowledge..."
          className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{entry.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent)20", color: "var(--accent)", border: "1px solid var(--accent)40" }}>
                    {entry.category}
                  </span>
                  {entry.tags && entry.tags.split(",").map(tag => (
                    <span key={tag.trim()} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleDelete(entry.id)} className="text-xs px-2 py-1 rounded"
                style={{ color: "var(--danger)" }}>Delete</button>
            </div>
            <p className="text-sm mt-3 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
              {entry.content}
            </p>
            <p className="text-xs mt-3" style={{ color: "var(--border)" }}>
              {new Date(entry.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              {search || filterCat ? "No matching entries" : "Knowledge base is empty"}
            </p>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Knowledge Entry">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. nextjs, auth"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
            Save Entry
          </button>
        </form>
      </Modal>
    </div>
  );
}
