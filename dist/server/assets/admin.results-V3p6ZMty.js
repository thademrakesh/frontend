import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useEffect } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { A as AdminShell, S as SectionHeader } from "./Shell-CZ9a4TKO.js";
import { u as useElection, t as tallyForPosition } from "./election-store-CbUZ_fGV.js";
import "./api-CgB5BbtB.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "axios";
const ADMIN_NAV = [{
  to: "/admin",
  label: "Control Panel"
}, {
  to: "/admin/results",
  label: "Results"
}, {
  to: "/admin/devices",
  label: "Devices"
}];
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
function ResultsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      navigate({
        to: "/login"
      });
    }
  }, [navigate]);
  const state = useElection((s) => s);
  const locked = state.status !== "closed";
  const positionStats = state.positions.map((p) => ({
    position: p,
    ...tallyForPosition(p.id)
  }));
  const totals = {
    candidates: state.stats.totalCandidates,
    approved: state.candidates.filter((c) => c.status === "approved").length,
    rejected: state.candidates.filter((c) => c.status === "rejected").length,
    terminated: state.candidates.filter((c) => c.status === "terminated").length,
    votes: state.stats.totalVotes,
    devices: state.stats.activeDevices
  };
  const participationData = state.results.map((r) => ({
    name: r.positionName.split(" ")[0],
    votes: r.totalVotes
  }));
  return /* @__PURE__ */ jsxs(AdminShell, { role: "Administration", nav: ADMIN_NAV, children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "Election Analytics", title: "Results & Insights", right: /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase text-muted-foreground", children: "Total Votes Counted" }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-4xl font-bold", children: totals.votes.toLocaleString() })
    ] }) }),
    locked && /* @__PURE__ */ jsxs("div", { className: "mb-8 rounded-sm border border-warning/40 bg-warning/10 px-4 py-3 text-sm", children: [
      /* @__PURE__ */ jsx("strong", { className: "uppercase", children: "Live preview." }),
      " Final results lock when the administrator stops the election."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 grid grid-cols-2 gap-4 md:grid-cols-6", children: [
      /* @__PURE__ */ jsx(KPI, { label: "Total Candidates", value: totals.candidates }),
      /* @__PURE__ */ jsx(KPI, { label: "Approved", value: totals.approved, tone: "success" }),
      /* @__PURE__ */ jsx(KPI, { label: "Rejected", value: totals.rejected, tone: "accent" }),
      /* @__PURE__ */ jsx(KPI, { label: "Terminated", value: totals.terminated }),
      /* @__PURE__ */ jsx(KPI, { label: "Total Votes", value: totals.votes, tone: "primary" }),
      /* @__PURE__ */ jsx(KPI, { label: "Active Devices", value: totals.devices })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: "Position-wise Participation" }),
        /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: participationData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: {
            fontSize: 10
          } }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fontSize: 10
          } }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "votes", fill: "var(--primary)" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: [
          positionStats[0]?.position.name || "Head Boy",
          " — Vote Distribution"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: positionStats[0]?.candidates.map((c) => ({
            name: c.candidate.name,
            value: c.votes || 1e-3
          })) || [], dataKey: "value", innerRadius: 50, outerRadius: 90, children: positionStats[0]?.candidates.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) || null }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 11
          } })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: positionStats.map(({
      position,
      total,
      candidates
    }) => /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-sm border border-border bg-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: "Position" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold tracking-tight", children: position.name })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
          total,
          " ",
          total === 1 ? "vote" : "votes"
        ] })
      ] }),
      candidates.length === 0 ? /* @__PURE__ */ jsx("p", { className: "p-6 text-sm text-muted-foreground", children: "No approved candidates for this position." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: candidates.map((row, i) => /* @__PURE__ */ jsxs("li", { className: `flex items-center gap-6 px-6 py-4 transition-all ${i === 0 && row.votes > 0 ? "bg-success/5" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted", children: row.candidate.photo ? /* @__PURE__ */ jsx("img", { src: row.candidate.photo, alt: row.candidate.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground", children: row.candidate.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base font-bold", children: row.candidate.name }),
            i === 0 && row.votes > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 rounded bg-warning/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-warning-foreground/80", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "size-3" }),
              " Winner"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
            row.candidate.symbol && /* @__PURE__ */ jsx("img", { src: row.candidate.symbol, alt: row.candidate.symbolName, className: "size-6 object-contain" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] font-bold uppercase tracking-widest text-primary", children: row.candidate.symbolName || row.candidate.symbol })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx("div", { className: `h-full transition-all duration-500 ${i === 0 && row.votes > 0 ? "bg-success" : "bg-primary/70"}`, style: {
            width: `${row.percent}%`
          } }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-3xl font-bold tracking-tighter", children: row.votes.toLocaleString() }),
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: "Total Votes" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 font-mono text-xs font-bold text-primary", children: [
            row.percent,
            "%"
          ] })
        ] })
      ] }, row.candidate.id)) })
    ] }, position.id)) })
  ] });
}
function KPI({
  label,
  value,
  tone
}) {
  const toneClass = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : "text-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-2 font-mono text-3xl font-bold ${toneClass}`, children: value })
  ] });
}
export {
  ResultsPage as component
};
