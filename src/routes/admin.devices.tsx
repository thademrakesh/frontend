import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AdminShell, SectionHeader } from "@/components/election/Shell";
import { useElection } from "@/lib/election-store";
import { useEffect } from "react";

const ADMIN_NAV = [
  { to: "/admin", label: "Control Panel" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/devices", label: "Devices" },
];

export const Route = createFileRoute("/admin/devices")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "ADMIN") {
        throw redirect({ 
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Devices — Gentanjali school voting" },
      { name: "description", content: "Voting kiosk monitoring." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const state = useElection((s) => s);

  const deviceVotes = (id: string) => {
    // If we don't have per-device vote counts from backend yet, 
    // we might need to add that to the API or just show 0 for now.
    // The current backend doesn't seem to expose vote count per device in a simple way 
    // without fetching all votes.
    return 0; 
  };

  return (
    <AdminShell role="Administration" nav={ADMIN_NAV}>
      <SectionHeader
        eyebrow="Kiosk Network"
        title="Device Monitoring"
        right={
          <span className="font-mono text-xs text-muted-foreground">
            {state.devices.length} registered ·{" "}
            {state.emergencyLock ? (
              <strong className="text-accent">LOCKED</strong>
            ) : (
              <strong className="text-success">LIVE</strong>
            )}
          </span>
        }
      />

      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-3">Device Name</th>
              <th className="px-6 py-3">Device ID</th>
              <th className="px-6 py-3">Last Seen</th>
              <th className="px-6 py-3 text-right">Votes Cast</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.devices.map((d) => {
              const status = state.emergencyLock ? "locked" : d.status;
              const colorClass =
                status === "active"
                  ? "text-success"
                  : status === "locked"
                    ? "text-accent"
                    : "text-muted-foreground";
              return (
                <tr key={d.id} className="border-b border-border last:border-b-0">
                  <td className="px-6 py-4 font-bold">{d.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {d.id}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{d.lastSeen}</td>
                  <td className="px-6 py-4 text-right font-mono">{deviceVotes(d.id)}</td>
                  <td
                    className={`px-6 py-4 text-right font-bold uppercase tracking-widest ${colorClass}`}
                  >
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Recent Audit Log
        </h2>
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <ul className="divide-y divide-border">
            {state.audit.slice(0, 12).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between px-6 py-3 text-xs"
              >
                <div>
                  <p className="font-mono uppercase tracking-widest text-primary">
                    {a.action}
                  </p>
                  <p className="text-muted-foreground">{a.description}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(a.ts).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
