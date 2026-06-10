import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { A as AdminShell, S as SectionHeader } from "./Shell-CZ9a4TKO.js";
import { c as cn, B as Button } from "./api-CgB5BbtB.js";
import { I as Input, L as Label } from "./label-cpSE3KQn.js";
import { T as Textarea } from "./textarea-DTpbi0rI.js";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import { T as Toaster } from "./sonner-DeNSN9-c.js";
import { u as useElection, e as electionStore } from "./election-store-CbUZ_fGV.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "axios";
import "@radix-ui/react-label";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const STAFF_NAV = [{
  to: "/staff",
  label: "Register Candidate"
}];
const schema = z.object({
  positionId: z.string().min(1, "Position is required"),
  name: z.string().trim().min(2).max(80),
  studentId: z.string().trim().min(3).max(20),
  className: z.string().trim().min(1).max(10),
  section: z.string().trim().min(1).max(5),
  symbolName: z.string().trim().min(1).max(40),
  manifesto: z.string().trim().min(20).max(600),
  photo: z.string().min(1, "Candidate photo is required"),
  symbol: z.string().min(1, "Election symbol image is required")
});
function StaffPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "STAFF" && role !== "ADMIN") {
      navigate({
        to: "/login"
      });
    }
  }, [navigate]);
  const state = useElection((s) => s);
  const candidates = state.candidates;
  const currentUser = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  useEffect(() => {
    electionStore.refresh();
  }, []);
  const [form, setForm] = useState({
    positionId: "",
    name: "",
    studentId: "",
    className: "",
    section: "",
    symbolName: "",
    manifesto: "",
    photo: "",
    symbol: ""
  });
  const submitted = candidates.filter((c) => c.createdBy === currentUser).slice(-6).reverse();
  const onSubmit = (e) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    electionStore.addCandidate(parsed.data);
    toast.success("Candidate submitted for approval");
    setForm({
      positionId: "",
      name: "",
      studentId: "",
      className: "",
      section: "",
      symbolName: "",
      manifesto: "",
      photo: "",
      symbol: ""
    });
  };
  return /* @__PURE__ */ jsxs(AdminShell, { role: "Staff", nav: STAFF_NAV, children: [
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(SectionHeader, { eyebrow: "Faculty Workflow", title: "Register a candidate" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit, className: "lg:col-span-2 space-y-5 rounded-sm border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx(Field, { label: "Position Applied For", children: /* @__PURE__ */ jsxs(Select, { value: form.positionId, onValueChange: (v) => setForm({
          ...form,
          positionId: v
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select position" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: state.positions.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p.id, children: p.name }, p.id)) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Student Name", children: /* @__PURE__ */ jsx(Input, { value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }), placeholder: "Full name" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Student ID", children: /* @__PURE__ */ jsx(Input, { value: form.studentId, onChange: (e) => setForm({
            ...form,
            studentId: e.target.value
          }), placeholder: "STU-2024xxxx" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Class", children: /* @__PURE__ */ jsx(Input, { value: form.className, onChange: (e) => setForm({
            ...form,
            className: e.target.value
          }), placeholder: "12" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Section", children: /* @__PURE__ */ jsx(Input, { value: form.section, onChange: (e) => setForm({
            ...form,
            section: e.target.value
          }), placeholder: "A" }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Election Symbol Name", children: /* @__PURE__ */ jsx(Input, { value: form.symbolName, onChange: (e) => setForm({
          ...form,
          symbolName: e.target.value
        }), placeholder: "e.g. Bolt, Star, Tree" }) }),
        /* @__PURE__ */ jsxs(Field, { label: "Manifesto / Description", children: [
          /* @__PURE__ */ jsx(Textarea, { value: form.manifesto, onChange: (e) => setForm({
            ...form,
            manifesto: e.target.value
          }), rows: 5, placeholder: "Outline platform, priorities, and commitments..." }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
            "20–600 characters · ",
            form.manifesto.length,
            " entered"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(ImageUpload, { label: "Candidate Photo", value: form.photo, onChange: (v) => setForm({
            ...form,
            photo: v
          }) }),
          /* @__PURE__ */ jsx(ImageUpload, { label: "Election Symbol", value: form.symbol, onChange: (v) => setForm({
            ...form,
            symbol: v
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border pt-5", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Status will be set to ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Pending Approval" }),
            " ",
            "until the Election Office verifies the nomination."
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "font-bold uppercase tracking-widest", children: "Submit Nomination" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-card p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: "Recent Submissions" }),
          submitted.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No submissions yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: submitted.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: c.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: state.positions.find((p) => p.id === c.positionId)?.name })
            ] }),
            /* @__PURE__ */ jsx(StatusChip, { status: c.status })
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-secondary/40 p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary", children: "Staff Permissions" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("li", { children: "✓ Add candidate" }),
            /* @__PURE__ */ jsx("li", { children: "✓ Edit before approval" }),
            /* @__PURE__ */ jsx("li", { children: "✗ Approve / reject" }),
            /* @__PURE__ */ jsx("li", { children: "✗ Start / stop election" }),
            /* @__PURE__ */ jsx("li", { children: "✗ Generate access codes" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { className: "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    children
  ] });
}
function ImageUpload({
  label,
  value,
  onChange
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          onChange(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs("label", { className: "flex aspect-[3/2] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-secondary/30 p-4 text-center transition-colors hover:bg-secondary/50 overflow-hidden", children: [
      value ? /* @__PURE__ */ jsx("img", { src: value, alt: label, className: "absolute inset-0 h-full w-full object-cover" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Click to upload" })
      ] }),
      /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleFileChange })
    ] }),
    value && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onChange(""), className: "absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground shadow-sm", children: "×" })
  ] });
}
function StatusChip({
  status
}) {
  const map = {
    pending: "bg-warning/15 text-warning-foreground/80 border-warning/40",
    approved: "bg-success/10 text-success border-success/40",
    rejected: "bg-accent/10 text-accent border-accent/40",
    terminated: "bg-muted text-muted-foreground border-border"
  };
  return /* @__PURE__ */ jsx("span", { className: `rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${map[status]}`, children: status });
}
export {
  StaffPage as component
};
