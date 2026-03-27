"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

interface Objective {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_count: number;
  task_count: number;
  tasks_done: number;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_title: string;
  objective_title: string;
  assigned_to: string | null;
}

export default function Dashboard() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/objectives").then(r => r.json()).then(setObjectives);
    fetch("/api/tasks").then(r => r.json()).then(d => setRecentTasks(d.slice(0, 10)));
  }, []);

  const activeObjectives = objectives.filter(o => o.status === "active");
  const totalTasks = objectives.reduce((s, o) => s + o.task_count, 0);
  const doneTasks = objectives.reduce((s, o) => s + o.tasks_done, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Command Center</h1>
        <p style={{ color: "var(--text-secondary)" }}>Venture execution dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Objectives", value: objectives.length, color: "var(--accent)" },
          { label: "Active", value: activeObjectives.length, color: "var(--info)" },
          { label: "Total Tasks", value: totalTasks, color: "var(--warning)" },
          { label: "Completed Tasks", value: doneTasks, color: "var(--success)" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Objectives */}
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Objectives</h2>
            <Link href="/objectives" className="text-sm" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          {objectives.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-secondary)" }}>
              No objectives yet. Create your first one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {objectives.slice(0, 5).map(obj => (
                <Link key={obj.id} href={`/objectives/${obj.id}`}
                  className="block rounded-lg p-3 transition-colors"
                  style={{ background: "var(--bg-primary)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{obj.title}</span>
                    <StatusBadge status={obj.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{obj.project_count} projects</span>
                    <span>{obj.tasks_done}/{obj.task_count} tasks</span>
                    {obj.task_count > 0 && (
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${(obj.tasks_done / obj.task_count) * 100}%`,
                          background: "var(--success)",
                        }} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-secondary)" }}>
              No tasks yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between rounded-lg p-3"
                  style={{ background: "var(--bg-primary)" }}>
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {task.objective_title} → {task.project_title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.assigned_to && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                        {task.assigned_to}
                      </span>
                    )}
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
