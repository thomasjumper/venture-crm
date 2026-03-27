"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  depends_on: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string | null;
  task_count: number;
  tasks_done: number;
  tasks?: Task[];
}

interface Decision {
  id: string;
  title: string;
  description: string;
  decision: string;
  rationale: string;
  status: string;
  created_at: string;
}

interface ObjectiveDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projects: Project[];
  decisions: Decision[];
  created_at: string;
  updated_at: string;
}

const statuses = ["draft", "active", "completed", "paused", "cancelled"];
const projectStatuses = ["planned", "in-progress", "done", "blocked"];
const taskStatuses = ["todo", "doing", "done", "blocked"];

export default function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [obj, setObj] = useState<ObjectiveDetail | null>(null);
  const [showProject, setShowProject] = useState(false);
  const [showTask, setShowTask] = useState<string | null>(null);
  const [showDecision, setShowDecision] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", assigned_to: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assigned_to: "", depends_on: "" });
  const [decisionForm, setDecisionForm] = useState({ title: "", description: "", decision: "", rationale: "" });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const load = async () => {
    const data = await fetch(`/api/objectives/${id}`).then(r => r.json());
    // Load tasks for each project
    const projectsWithTasks = await Promise.all(
      data.projects.map(async (p: Project) => {
        const res = await fetch(`/api/projects/${p.id}`);
        const pData = await res.json();
        return { ...p, tasks: pData.tasks || [] };
      })
    );
    setObj({ ...data, projects: projectsWithTasks });
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/objectives/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/projects", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...projectForm, objective_id: id }),
    });
    setProjectForm({ title: "", description: "", assigned_to: "" });
    setShowProject(false);
    load();
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...taskForm, project_id: showTask }),
    });
    setTaskForm({ title: "", description: "", priority: "medium", assigned_to: "", depends_on: "" });
    setShowTask(null);
    load();
  };

  const createDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/decisions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...decisionForm, objective_id: id }),
    });
    setDecisionForm({ title: "", description: "", decision: "", rationale: "" });
    setShowDecision(false);
    load();
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const toggleProject = (pid: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  if (!obj) return <div className="flex items-center justify-center h-64" style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div>
      <Link href="/objectives" className="text-sm mb-4 inline-block" style={{ color: "var(--text-secondary)" }}>
        ← Back to Objectives
      </Link>

      {/* Header */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold">{obj.title}</h1>
          <div className="flex items-center gap-2">
            <select value={obj.status} onChange={e => updateStatus(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <StatusBadge status={obj.priority} />
          </div>
        </div>
        {obj.description && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{obj.description}</p>}
      </div>

      {/* Projects & Tasks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projects & Tasks</h2>
          <button onClick={() => setShowProject(true)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ background: "var(--accent)", color: "white" }}>
            + Add Project
          </button>
        </div>

        <div className="space-y-3">
          {obj.projects.map(project => (
            <div key={project.id} className="rounded-xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleProject(project.id)}
                style={{ background: expandedProjects.has(project.id) ? "var(--bg-hover)" : "transparent" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {expandedProjects.has(project.id) ? "▼" : "▶"}
                  </span>
                  <div>
                    <span className="font-medium">{project.title}</span>
                    {project.assigned_to && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                        {project.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={project.status} onClick={e => e.stopPropagation()}
                    onChange={e => { e.stopPropagation(); updateProjectStatus(project.id, e.target.value); }}
                    className="rounded px-2 py-1 text-xs outline-none"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {expandedProjects.has(project.id) && (
                <div className="p-4 pt-0">
                  {project.description && (
                    <p className="text-sm mb-3 pl-6" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
                  )}
                  <div className="pl-6 space-y-2">
                    {(project.tasks || []).map((task: Task) => (
                      <div key={task.id} className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: "var(--bg-primary)" }}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={task.status === "done"}
                            onChange={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                            className="rounded" />
                          <div>
                            <span className={`text-sm ${task.status === "done" ? "line-through opacity-50" : ""}`}>
                              {task.title}
                            </span>
                            {task.assigned_to && (
                              <span className="ml-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                                → {task.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value)}
                            className="rounded px-2 py-1 text-xs outline-none"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                            {taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <StatusBadge status={task.priority} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowTask(project.id)}
                      className="text-sm px-3 py-2 rounded-lg w-full text-left transition-colors"
                      style={{ color: "var(--text-secondary)", border: "1px dashed var(--border)" }}>
                      + Add Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decisions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Decision Log</h2>
          <button onClick={() => setShowDecision(true)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ background: "var(--accent)", color: "white" }}>
            + Log Decision
          </button>
        </div>
        <div className="space-y-2">
          {obj.decisions.map(d => (
            <div key={d.id} className="rounded-xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{d.title}</span>
                <StatusBadge status={d.status} />
              </div>
              {d.decision && <p className="text-sm" style={{ color: "var(--success)" }}>Decision: {d.decision}</p>}
              {d.rationale && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Rationale: {d.rationale}</p>}
            </div>
          ))}
          {obj.decisions.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-secondary)" }}>No decisions logged yet</p>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal open={showProject} onClose={() => setShowProject(false)} title="Add Project">
        <form onSubmit={createProject} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input value={projectForm.title} onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Assigned To</label>
            <input value={projectForm.assigned_to} onChange={e => setProjectForm(f => ({ ...f, assigned_to: e.target.value }))}
              placeholder="e.g. Claudebot, Moonsa"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
            Create Project
          </button>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal open={!!showTask} onClose={() => setShowTask(null)} title="Add Task">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Assigned To</label>
              <input value={taskForm.assigned_to} onChange={e => setTaskForm(f => ({ ...f, assigned_to: e.target.value }))}
                placeholder="e.g. Claudebot"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
            Create Task
          </button>
        </form>
      </Modal>

      {/* Decision Modal */}
      <Modal open={showDecision} onClose={() => setShowDecision(false)} title="Log Decision">
        <form onSubmit={createDecision} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title</label>
            <input value={decisionForm.title} onChange={e => setDecisionForm(f => ({ ...f, title: e.target.value }))} required
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Context</label>
            <textarea value={decisionForm.description} onChange={e => setDecisionForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Decision</label>
            <input value={decisionForm.decision} onChange={e => setDecisionForm(f => ({ ...f, decision: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Rationale</label>
            <textarea value={decisionForm.rationale} onChange={e => setDecisionForm(f => ({ ...f, rationale: e.target.value }))} rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "white" }}>
            Log Decision
          </button>
        </form>
      </Modal>
    </div>
  );
}
