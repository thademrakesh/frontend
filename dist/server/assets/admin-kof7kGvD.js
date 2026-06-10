import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useRouterState, Outlet, Link } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { X, RefreshCw, Unlock, Lock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { A as AdminShell, S as SectionHeader } from "./Shell-CZ9a4TKO.js";
import { c as cn, B as Button } from "./api-CgB5BbtB.js";
import { I as Input, L as Label } from "./label-cpSE3KQn.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { T as Textarea } from "./textarea-DTpbi0rI.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { T as Toaster } from "./sonner-DeNSN9-c.js";
import { u as useElection, e as electionStore } from "./election-store-CbUZ_fGV.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "axios";
import "@radix-ui/react-label";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
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
function AdminPage() {
  const navigate = useNavigate();
  const {
    pathname
  } = useRouterState({
    select: (s) => s.location
  });
  const isIndex = pathname === "/admin";
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
  const [positionFilter, setPositionFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const [manualCode, setManualCode] = useState("");
  useEffect(() => {
    electionStore.refresh();
  }, []);
  const totals = useMemo(() => {
    const c = state.candidates;
    return {
      total: c.length,
      approved: c.filter((x) => x.status === "approved").length,
      pending: c.filter((x) => x.status === "pending").length,
      rejected: c.filter((x) => x.status === "rejected").length,
      terminated: c.filter((x) => x.status === "terminated").length,
      votes: state.votes.length,
      devices: state.devices.length
    };
  }, [state]);
  const filtered = positionFilter === "all" ? state.candidates : state.candidates.filter((c) => c.positionId === positionFilter);
  if (state.isLoading && state.electionName === "Loading Election...") {
    return /* @__PURE__ */ jsx(AdminShell, { role: "Administration", nav: ADMIN_NAV, children: /* @__PURE__ */ jsx("div", { className: "flex h-[50vh] items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "size-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground", children: "Loading Election Data..." })
    ] }) }) });
  }
  if (!isIndex) {
    return /* @__PURE__ */ jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxs(AdminShell, { role: "Administration", nav: ADMIN_NAV, children: [
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: state.academicYear, title: state.electionName, right: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 font-mono text-xs", children: [
      /* @__PURE__ */ jsx(StatChip, { label: "Pending", value: totals.pending, tone: "warning" }),
      /* @__PURE__ */ jsx(StatChip, { label: "Approved", value: totals.approved, tone: "success" }),
      /* @__PURE__ */ jsx(StatChip, { label: "Votes", value: totals.votes, tone: "primary" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxs("section", { className: "col-span-12 space-y-6 lg:col-span-4", children: [
        /* @__PURE__ */ jsxs(Card, { title: "Election Lifecycle", children: [
          /* @__PURE__ */ jsxs("p", { className: "mb-4 text-xs text-muted-foreground", children: [
            "Current status:",
            " ",
            /* @__PURE__ */ jsx("strong", { className: "uppercase text-foreground", children: state.status })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: state.status !== "active" ? /* @__PURE__ */ jsx(Button, { onClick: async () => {
            try {
              await electionStore.startElection();
              toast.success("Election started successfully");
            } catch (error) {
              toast.error("Failed to start election");
            }
          }, className: "w-full bg-primary font-bold uppercase tracking-widest", children: "Start Election" }) : /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: async () => {
            try {
              await electionStore.stopElection();
              toast("Election closed — results unlocked");
            } catch (error) {
              toast.error("Failed to stop election");
            }
          }, className: "w-full font-bold uppercase tracking-widest", children: "Stop Election" }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { title: "Voter Access Code", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between rounded border border-border bg-secondary/40 p-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase text-muted-foreground", children: "Active Code" }),
              /* @__PURE__ */ jsx("p", { className: "font-mono text-3xl font-bold tracking-[0.2em] text-primary", children: state.accessCode })
            ] }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: async () => {
              try {
                const c = await electionStore.generateCode();
                toast.success(`New code: ${c}`);
              } catch (error) {
                toast.error("Failed to generate code");
              }
            }, children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "mr-1 size-3" }),
              " Regenerate"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex gap-2", children: [
            /* @__PURE__ */ jsx(Input, { value: manualCode, onChange: (e) => setManualCode(e.target.value.replace(/\D/g, "").slice(0, 6)), placeholder: "Enter 6 digits", inputMode: "numeric", className: "font-mono tracking-widest" }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: async () => {
              if (manualCode.length !== 6) {
                toast.error("Code must be 6 digits");
                return;
              }
              try {
                await electionStore.setCode(manualCode);
                setManualCode("");
                toast.success("Code updated");
              } catch (error) {
                toast.error("Failed to set code");
              }
            }, children: "Set" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded border border-border bg-background p-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", children: "Code Protection" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Require code before each vote" })
            ] }),
            /* @__PURE__ */ jsx(Switch, { checked: state.codeProtection, onCheckedChange: async (v) => {
              try {
                await electionStore.setCodeProtection(v);
                toast.success(`Code protection ${v ? "enabled" : "disabled"}`);
              } catch (error) {
                toast.error("Failed to toggle code protection");
              }
            } })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { title: "Emergency Controls", children: [
          state.emergencyLock ? /* @__PURE__ */ jsxs(Button, { onClick: async () => {
            await electionStore.setEmergencyLock(false);
            toast.success("Devices unlocked");
          }, className: "w-full bg-success font-bold uppercase tracking-widest text-success-foreground hover:bg-success/90", children: [
            /* @__PURE__ */ jsx(Unlock, { className: "mr-2 size-4" }),
            " Unlock All Devices"
          ] }) : /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: async () => {
            await electionStore.setEmergencyLock(true);
            toast("All voting devices locked", {
              icon: /* @__PURE__ */ jsx(Lock, { className: "size-4" })
            });
          }, className: "w-full font-bold uppercase tracking-widest", children: [
            /* @__PURE__ */ jsx(Lock, { className: "mr-2 size-4" }),
            " Lock All Devices"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-[10px] text-muted-foreground", children: "Immediately returns all kiosks to the code-entry screen and destroys in-flight sessions." })
        ] }),
        /* @__PURE__ */ jsx(Card, { title: "Device Monitoring", right: /* @__PURE__ */ jsx(Link, { to: "/admin/devices", className: "text-[10px] font-bold uppercase tracking-widest text-primary hover:underline", children: "View all" }), children: /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: state.devices.slice(0, 4).map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between border-b border-border pb-2 text-xs last:border-b-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono", children: d.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: d.lastSeen })
          ] }),
          /* @__PURE__ */ jsx(DeviceStatusPill, { status: state.emergencyLock ? "locked" : d.status })
        ] }, d.id)) }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "col-span-12 lg:col-span-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(FilterPill, { active: positionFilter === "all", onClick: () => setPositionFilter("all"), label: `All · ${state.candidates.length}` }),
          state.positions.map((p) => {
            const count = state.candidates.filter((c) => c.positionId === p.id).length;
            return /* @__PURE__ */ jsx(FilterPill, { active: positionFilter === p.id, onClick: () => setPositionFilter(p.id), label: `${p.name} · ${count}` }, p.id);
          })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-full rounded-sm border border-dashed border-border p-12 text-center text-sm text-muted-foreground", children: "No candidates for this position." }) : filtered.map((c) => /* @__PURE__ */ jsx(CandidateCard, { candidate: c, positions: state.positions, onApprove: () => {
          electionStore.setCandidateStatus(c.id, "approved");
          toast.success(`Approved ${c.name}`);
        }, onReject: () => {
          setReason("");
          setModal({
            kind: "reject",
            candidate: c
          });
        }, onTerminate: () => {
          setReason("");
          setModal({
            kind: "terminate",
            candidate: c
          });
        } }, c.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!modal, onOpenChange: (o) => !o && setModal(null), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 text-accent" }),
          modal?.kind === "reject" ? "Reject candidate" : "Terminate candidate"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: modal?.kind === "reject" ? "The nomination will be marked as rejected. Provide a clear reason for audit." : "Approved candidate will be removed from voting screens immediately." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Label, { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          "Reason (",
          modal?.candidate.name,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value), rows: 4, placeholder: "e.g. Academic eligibility not met" })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: () => {
          if (!modal) return;
          if (reason.trim().length < 5) {
            toast.error("Provide a reason (5+ characters)");
            return;
          }
          electionStore.setCandidateStatus(modal.candidate.id, modal.kind === "reject" ? "rejected" : "terminated", reason.trim());
          toast.success(`${modal.candidate.name} ${modal.kind === "reject" ? "rejected" : "terminated"}`);
          setModal(null);
        }, children: "Confirm" })
      ] })
    ] }) })
  ] });
}
function Card({
  title,
  children,
  right
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-card p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground", children: title }),
      right
    ] }),
    children
  ] });
}
function StatChip({
  label,
  value,
  tone
}) {
  const tones = {
    warning: "border-warning/40 bg-warning/10 text-warning-foreground/80",
    success: "border-success/40 bg-success/10 text-success",
    primary: "border-primary/30 bg-primary/5 text-primary"
  };
  return /* @__PURE__ */ jsxs("span", { className: `border px-2 py-1 font-mono ${tones[tone]}`, children: [
    label,
    ": ",
    String(value).padStart(2, "0")
  ] });
}
function FilterPill({
  active,
  onClick,
  label
}) {
  return /* @__PURE__ */ jsx("button", { onClick, className: `rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"}`, children: label });
}
function CandidateCard({
  candidate,
  onApprove,
  onReject,
  onTerminate,
  positions
}) {
  const positionName = positions.find((p) => p.id === candidate.positionId)?.name ?? "";
  const statusStyles = {
    approved: "border-success/40 bg-success/5",
    rejected: "border-accent/30 bg-accent/5 opacity-80",
    terminated: "border-border bg-secondary/40 opacity-60",
    pending: ""
  };
  return /* @__PURE__ */ jsxs("div", { className: `group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-primary/40 ${statusStyles[candidate.status]}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "size-24 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary", children: candidate.photo ? /* @__PURE__ */ jsx("img", { src: candidate.photo, alt: candidate.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground", children: candidate.name.split(" ").map((p) => p[0]).slice(0, 2).join("") }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary", children: positionName }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: [
            "Grade ",
            candidate.className,
            "-",
            candidate.section
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "truncate text-lg font-bold", children: candidate.name }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          candidate.symbol && /* @__PURE__ */ jsx("img", { src: candidate.symbol, alt: candidate.symbolName, className: "size-5 object-contain" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground", children: candidate.symbolName })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "line-clamp-2 text-xs italic text-muted-foreground", children: [
          "“",
          candidate.manifesto,
          "”"
        ] })
      ] })
    ] }),
    candidate.status === "approved" ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border bg-success/10 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-success", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "size-3" }),
        " Approved"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onTerminate, className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent", children: "Terminate" })
    ] }) : candidate.status === "rejected" ? /* @__PURE__ */ jsxs("div", { className: "border-t border-border bg-accent/5 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-accent", children: [
        /* @__PURE__ */ jsx(XCircle, { className: "size-3" }),
        " Rejected"
      ] }),
      candidate.reason && /* @__PURE__ */ jsxs("p", { className: "mt-1 line-clamp-2 text-[10px] text-muted-foreground", children: [
        "Reason: ",
        candidate.reason
      ] })
    ] }) : candidate.status === "terminated" ? /* @__PURE__ */ jsxs("div", { className: "border-t border-border bg-secondary/40 px-4 py-2.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground", children: "Terminated" }),
      candidate.reason && /* @__PURE__ */ jsxs("p", { className: "mt-1 line-clamp-2 text-[10px] text-muted-foreground", children: [
        "Reason: ",
        candidate.reason
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex border-t border-border", children: [
      /* @__PURE__ */ jsx("button", { onClick: onTerminate, className: "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary", children: "Terminate" }),
      /* @__PURE__ */ jsx("button", { onClick: onReject, className: "flex-1 border-l border-border py-3 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5", children: "Reject" }),
      /* @__PURE__ */ jsx("button", { onClick: onApprove, className: "flex-1 bg-primary py-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110", children: "Approve" })
    ] })
  ] });
}
function DeviceStatusPill({
  status
}) {
  const map = {
    active: "text-success",
    idle: "text-muted-foreground",
    locked: "text-accent"
  };
  return /* @__PURE__ */ jsx("span", { className: `font-bold uppercase ${map[status]}`, children: status });
}
export {
  AdminPage as component
};
