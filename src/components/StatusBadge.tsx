const statusColors: Record<string, string> = {
  draft: "#9898b0",
  active: "#6c5ce7",
  "in-progress": "#74b9ff",
  planned: "#fdcb6e",
  todo: "#9898b0",
  doing: "#74b9ff",
  done: "#00b894",
  blocked: "#e17055",
  paused: "#fdcb6e",
  completed: "#00b894",
  cancelled: "#e17055",
  pending: "#fdcb6e",
  decided: "#00b894",
  deferred: "#9898b0",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || "#9898b0";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {status}
    </span>
  );
}
