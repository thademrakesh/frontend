import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { u as useElection } from "./election-store-CbUZ_fGV.js";
import { LogOut } from "lucide-react";
import { B as Button } from "./api-CgB5BbtB.js";
function AdminShell({
  children,
  nav,
  role
}) {
  const status = useElection((s) => s.status);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: "/login" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded bg-foreground", children: /* @__PURE__ */ jsx("div", { className: "size-3 border-2 border-background" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-extrabold uppercase tracking-tighter", children: "Gentanjali school voting" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden gap-6 text-sm font-medium text-muted-foreground md:flex", children: nav.map((n) => {
          const active = pathname === n.to;
          return /* @__PURE__ */ jsx(
            Link,
            {
              to: n.to,
              className: active ? "border-b-2 border-primary py-1 text-foreground" : "py-1 transition-colors hover:text-foreground",
              children: n.label
            },
            n.to
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(StatusPill, { status }),
        /* @__PURE__ */ jsx("span", { className: "hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:inline", children: role }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "size-8 text-muted-foreground hover:text-foreground",
            onClick: handleLogout,
            title: "Logout",
            children: /* @__PURE__ */ jsx(LogOut, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full border border-border bg-secondary" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-7xl px-6 py-8", children }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Gentanjali school voting" }),
      /* @__PURE__ */ jsx("span", { children: "All votes validated via secure transaction" })
    ] }) })
  ] });
}
function StatusPill({ status }) {
  const map = {
    active: { dot: "bg-success", bg: "bg-success/10 text-success", label: "Election Active" },
    closed: { dot: "bg-accent", bg: "bg-accent/10 text-accent", label: "Election Closed" },
    draft: { dot: "bg-muted-foreground", bg: "bg-secondary text-muted-foreground", label: "Draft" }
  };
  const v = map[status];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${v.bg}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${v.dot}` }),
        v.label
      ]
    }
  );
}
function SectionHeader({
  eyebrow,
  title,
  right
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-end justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      eyebrow && /* @__PURE__ */ jsx("p", { className: "mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: eyebrow }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight", children: title })
    ] }),
    right
  ] });
}
export {
  AdminShell as A,
  SectionHeader as S
};
