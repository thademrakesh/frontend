import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { A as AdminShell, S as SectionHeader } from "./Shell-CZ9a4TKO.js";
import { u as useElection } from "./election-store-CbUZ_fGV.js";
import { useEffect } from "react";
import "lucide-react";
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
function DevicesPage() {
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
  const deviceVotes = (id) => {
    return 0;
  };
  return /* @__PURE__ */ jsxs(AdminShell, { role: "Administration", nav: ADMIN_NAV, children: [
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "Kiosk Network", title: "Device Monitoring", right: /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
      state.devices.length,
      " registered ·",
      " ",
      state.emergencyLock ? /* @__PURE__ */ jsx("strong", { className: "text-accent", children: "LOCKED" }) : /* @__PURE__ */ jsx("strong", { className: "text-success", children: "LIVE" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-sm border border-border bg-card", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Device Name" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Device ID" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3", children: "Last Seen" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right", children: "Votes Cast" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: state.devices.map((d) => {
        const status = state.emergencyLock ? "locked" : d.status;
        const colorClass = status === "active" ? "text-success" : status === "locked" ? "text-accent" : "text-muted-foreground";
        return /* @__PURE__ */ jsxs("tr", { className: "border-b border-border last:border-b-0", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-bold", children: d.name }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-mono text-xs text-muted-foreground", children: d.id }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-xs text-muted-foreground", children: d.lastSeen }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right font-mono", children: deviceVotes(d.id) }),
          /* @__PURE__ */ jsx("td", { className: `px-6 py-4 text-right font-bold uppercase tracking-widest ${colorClass}`, children: status })
        ] }, d.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: "Recent Audit Log" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-sm border border-border bg-card", children: /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: state.audit.slice(0, 12).map((a) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between px-6 py-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono uppercase tracking-widest text-primary", children: a.action }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: a.description })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-muted-foreground", children: new Date(a.ts).toLocaleString() })
      ] }, a.id)) }) })
    ] })
  ] });
}
export {
  DevicesPage as component
};
