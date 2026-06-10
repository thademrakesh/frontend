import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell, SectionHeader } from "@/components/election/Shell";
import { useElection, tallyForPosition, electionStore } from "@/lib/election-store";

const ADMIN_NAV = [
  { to: "/admin", label: "Control Panel" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/devices", label: "Devices" },
];

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function ResultsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      navigate("/login");
    } else {
      // Fetch results specifically when visiting results page
      electionStore.refresh(false, true);
    }
  }, [navigate]);

  const state = useElection((s) => s);
  const locked = state.status !== "closed";

  const positionStats = state.positions.map((p) => ({
    position: p,
    ...tallyForPosition(p.id),
  }));

  const totals = {
    candidates: state.stats.totalCandidates,
    approved: state.candidates.filter((c) => c.status === "approved").length,
    rejected: state.candidates.filter((c) => c.status === "rejected").length,
    terminated: state.candidates.filter((c) => c.status === "terminated")
      .length,
    votes: state.stats.totalVotes,
    devices: state.stats.activeDevices,
  };

  const participationData = state.results.map((r) => ({
    name: r.positionName.split(" ")[0],
    votes: r.totalVotes,
  }));

  return (
    <AdminShell role="Administration" nav={ADMIN_NAV}>
      <SectionHeader
        eyebrow="Election Analytics"
        title="Results & Insights"
        right={
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              Total Votes Counted
            </p>
            <p className="font-mono text-4xl font-bold">
              {totals.votes.toLocaleString()}
            </p>
          </div>
        }
      />

      {locked && (
        <div className="mb-8 rounded-sm border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <strong className="uppercase">Live preview.</strong> Final results
          lock when the administrator stops the election.
        </div>
      )}

      {/* KPI cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-6">
        <KPI label="Total Candidates" value={totals.candidates} />
        <KPI label="Approved" value={totals.approved} tone="success" />
        <KPI label="Rejected" value={totals.rejected} tone="accent" />
        <KPI label="Terminated" value={totals.terminated} />
        <KPI label="Total Votes" value={totals.votes} tone="primary" />
        <KPI label="Active Devices" value={totals.devices} />
      </div>

      {/* Charts */}
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Position-wise Participation
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="votes" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {positionStats[0]?.position.name || "Head Boy"} — Vote Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={
                    positionStats[0]?.candidates.map((c) => ({
                      name: c.candidate.name,
                      value: c.votes || 0.001,
                    })) || []
                  }
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {positionStats[0]?.candidates.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  )) || null}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-position results */}
      <div className="space-y-6">
        {positionStats.map(({ position, total, candidates }) => (
          <div
            key={position.id}
            className="overflow-hidden rounded-sm border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Position
                </p>
                <h3 className="text-lg font-bold tracking-tight">
                  {position.name}
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {total} {total === 1 ? "vote" : "votes"}
              </span>
            </div>
            {candidates.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No approved candidates for this position.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {candidates.map((row, i) => (
                  <li
                    key={row.candidate.id}
                    className={`flex items-center gap-6 px-6 py-4 transition-all ${
                      i === 0 && row.votes > 0 ? "bg-success/5" : ""
                    }`}
                  >
                    {/* Candidate Photo */}
                    <div className="size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      {row.candidate.photo ? (
                        <img
                          src={row.candidate.photo}
                          alt={row.candidate.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                          {row.candidate.name
                            ?.split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-base font-bold">
                          {row.candidate.name}
                        </span>
                        {i === 0 && row.votes > 0 && (
                          <span className="flex items-center gap-1 rounded bg-warning/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-warning-foreground/80">
                            <Trophy className="size-3" /> Winner
                          </span>
                        )}
                      </div>

                      <div className="mb-3 flex items-center gap-2">
                        {row.candidate.symbol && (
                          <img
                            src={row.candidate.symbol}
                            alt={row.candidate.symbolName}
                            className="size-6 object-contain"
                          />
                        )}
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                          {row.candidate.symbolName || row.candidate.symbol}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full transition-all duration-500 ${
                            i === 0 && row.votes > 0
                              ? "bg-success"
                              : "bg-primary/70"
                          }`}
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <p className="font-mono text-3xl font-bold tracking-tighter">
                          {row.votes.toLocaleString()}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Total Votes
                        </p>
                      </div>
                      <p className="mt-1 font-mono text-xs font-bold text-primary">
                        {row.percent}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "accent";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : tone === "accent"
          ? "text-accent"
          : "text-foreground";
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
