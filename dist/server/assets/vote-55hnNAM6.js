import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useMemo, useEffect, useState, useRef } from "react";
import { Lock, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { d as deviceApi, B as Button, a as accessCodeApi } from "./api-CgB5BbtB.js";
import { toast } from "sonner";
import { T as Toaster } from "./sonner-DeNSN9-c.js";
import { u as useElection, g as getOrCreateDeviceId, e as electionStore } from "./election-store-CbUZ_fGV.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "axios";
const SESSION_TIMEOUT_MS = 2 * 60 * 1e3;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function VotePage() {
  const state = useElection((s) => s);
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);
  useEffect(() => {
    electionStore.refresh();
    deviceApi.register(deviceId, `Kiosk ${deviceId.slice(-4)}`).catch((err) => {
      console.warn("Failed to register device, but will try to proceed:", err);
    });
  }, [deviceId]);
  if (state.isLoading) return /* @__PURE__ */ jsx(FullScreenMessage, { title: "Connecting to Election Authority..." });
  if (state.status === "draft") return /* @__PURE__ */ jsx(FullScreenMessage, { title: "Election has not started yet." });
  if (state.status === "closed") return /* @__PURE__ */ jsx(FullScreenMessage, { title: "Election has ended.", sub: "Thank you for participating. Results are now available to the administration." });
  if (state.emergencyLock) return /* @__PURE__ */ jsx(FullScreenMessage, { title: "All voting devices are temporarily locked.", sub: "Please wait for instructions from the election staff.", icon: /* @__PURE__ */ jsx(Lock, { className: "size-8 text-accent" }) });
  return /* @__PURE__ */ jsx(VotingKiosk, { deviceId });
}
function VotingKiosk({
  deviceId
}) {
  useElection((s) => s.accessCode);
  const codeProtection = useElection((s) => s.codeProtection);
  const candidates = useElection((s) => s.candidates);
  const positions = useElection((s) => s.positions);
  const [phase, setPhase] = useState(codeProtection ? "code" : "voting");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(null);
  const [positionIndex, setPositionIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const orderRef = useRef(null);
  if (!orderRef.current && positions.length > 0) {
    orderRef.current = /* @__PURE__ */ new Map();
    for (const p of positions) {
      const list = candidates.filter((c) => c.positionId === p.id && c.status === "approved");
      orderRef.current.set(p.id, shuffle(list));
    }
  }
  const timerRef = useRef(null);
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (phase === "code" || phase === "thanks") return;
    timerRef.current = setTimeout(() => {
      resetSession();
    }, SESSION_TIMEOUT_MS);
  };
  useEffect(() => {
    resetTimer();
    const evts = ["mousedown", "keydown", "touchstart"];
    evts.forEach((e) => window.addEventListener(e, resetTimer));
    return () => {
      evts.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);
  const activePositions = positions.filter((p) => (orderRef.current?.get(p.id)?.length ?? 0) > 0);
  const currentPos = activePositions[positionIndex];
  const currentCandidates = currentPos ? orderRef.current.get(currentPos.id) : [];
  const currentSel = currentPos ? selections[currentPos.id] ?? [] : [];
  function resetSession(_reason) {
    setPhase(codeProtection ? "code" : "voting");
    setCodeInput("");
    setCodeError(null);
    setPositionIndex(0);
    setSelections({});
    setShowConfirm(false);
    orderRef.current = /* @__PURE__ */ new Map();
    for (const p of positions) {
      const list = candidates.filter((c) => c.positionId === p.id && c.status === "approved");
      orderRef.current.set(p.id, shuffle(list));
    }
  }
  function verifyCode() {
    accessCodeApi.verify(codeInput).then((res) => {
      if (res.valid) {
        setPhase("voting");
        setCodeError(null);
      } else {
        setCodeError("Invalid Code. Please contact the election staff.");
      }
    }).catch(() => {
      setCodeError("Error verifying code. Please try again.");
    });
  }
  function toggleSelection(candidateId) {
    if (!currentPos) return;
    setSelections((prev) => {
      const list = prev[currentPos.id] ?? [];
      if (list.includes(candidateId)) {
        return {
          ...prev,
          [currentPos.id]: list.filter((id) => id !== candidateId)
        };
      }
      if (list.length >= 3) return prev;
      return {
        ...prev,
        [currentPos.id]: [...list, candidateId]
      };
    });
  }
  async function submitVotes() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const picks = [];
    for (const [positionId, candIds] of Object.entries(selections)) {
      for (const candidateId of candIds) picks.push({
        positionId,
        candidateId
      });
    }
    try {
      await electionStore.submitVotes(deviceId, picks);
      setShowConfirm(false);
      setPhase("thanks");
      setTimeout(() => {
        setIsSubmitting(false);
        resetSession();
      }, 5e3);
    } catch (error) {
      setIsSubmitting(false);
      const msg = error.response?.data?.error || "Failed to submit ballot. Please try again.";
      toast.error(msg, {
        icon: /* @__PURE__ */ jsx(AlertCircle, { className: "size-4" })
      });
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-ink text-ink-foreground", children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-center", theme: "dark" }),
    /* @__PURE__ */ jsx("header", { className: "border-b border-white/10 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-7 items-center justify-center rounded bg-ink-foreground", children: /* @__PURE__ */ jsx("div", { className: "size-2.5 border-2 border-ink" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-extrabold uppercase tracking-tighter", children: "Gentanjali school voting" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Kiosk · ",
          deviceId
        ] }),
        /* @__PURE__ */ jsx("span", { className: "size-1 rounded-full bg-white/20" }),
        /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-white/80", children: "Exit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10", children: [
      phase === "code" && /* @__PURE__ */ jsx(CodeScreen, { value: codeInput, onChange: (v) => {
        setCodeInput(v);
        setCodeError(null);
      }, onSubmit: verifyCode, error: codeError }),
      phase === "voting" && currentPos && /* @__PURE__ */ jsx(VotingScreen, { position: currentPos, positionIndex, totalPositions: activePositions.length, candidates: currentCandidates, selected: currentSel, onToggle: toggleSelection, onPrev: () => setPositionIndex((i) => Math.max(0, i - 1)), onNext: () => {
        if (positionIndex < activePositions.length - 1) {
          setPositionIndex((i) => i + 1);
        } else {
          setPhase("review");
        }
      } }),
      phase === "review" && /* @__PURE__ */ jsx(ReviewScreen, { positions: activePositions, selections, candidatesById: Object.fromEntries(candidates.map((c) => [c.id, c])), onBack: () => setPhase("voting"), onConfirm: () => setShowConfirm(true) }),
      phase === "thanks" && /* @__PURE__ */ jsx(ThanksScreen, {})
    ] }),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md rounded border border-white/10 bg-ink p-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-extrabold tracking-tight", children: "Confirm submission" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/60", children: "Your vote will be submitted permanently and cannot be changed." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: isSubmitting, onClick: () => setShowConfirm(false), className: "flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-50", children: "No, Go Back" }),
        /* @__PURE__ */ jsx(Button, { disabled: isSubmitting, onClick: submitVotes, className: "flex-1 bg-white font-bold uppercase tracking-widest text-ink hover:bg-white/90 disabled:opacity-50", children: isSubmitting ? "Submitting..." : "Yes, Submit" })
      ] })
    ] }) })
  ] });
}
function CodeScreen({
  value,
  onChange,
  onSubmit,
  error
}) {
  const digits = Array.from({
    length: 6
  }, (_, i) => value[i] ?? "");
  return /* @__PURE__ */ jsxs("div", { className: "animate-ballot mx-auto max-w-2xl text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-sm uppercase tracking-[0.25em] text-primary", children: "Secure Voting Portal" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-3 text-5xl font-extrabold tracking-tighter", children: "Cast Your Ballot" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 rounded border border-white/10 bg-white/5 p-12 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60", children: "Enter the 6-digit access code provided by election staff." }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center gap-3", children: digits.map((d, i) => /* @__PURE__ */ jsx("div", { className: `flex size-14 items-center justify-center rounded font-mono text-3xl font-bold ${d ? "border-2 border-primary bg-background text-foreground shadow-[0_0_15px_rgba(0,71,171,0.3)]" : "border border-white/20 bg-white/10 text-white"}`, children: d }, i)) }),
      /* @__PURE__ */ jsx("input", { autoFocus: true, inputMode: "numeric", value, maxLength: 6, onChange: (e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6)), onKeyDown: (e) => {
        if (e.key === "Enter" && value.length === 6) onSubmit();
      }, className: "mt-6 w-full rounded border border-white/20 bg-transparent px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-white placeholder-white/30 outline-none focus:border-primary", placeholder: "000000" }),
      error && /* @__PURE__ */ jsx("p", { className: "mt-3 font-mono text-xs uppercase tracking-widest text-accent", children: error }),
      /* @__PURE__ */ jsx(Button, { onClick: onSubmit, disabled: value.length !== 6, className: "mt-6 w-full bg-white py-6 font-extrabold uppercase tracking-widest text-ink hover:bg-white/90 disabled:opacity-40", children: "Verify Identity" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
      /* @__PURE__ */ jsx("span", { children: "Secure Channel" }),
      /* @__PURE__ */ jsx("span", { className: "size-1 rounded-full bg-white/20" }),
      /* @__PURE__ */ jsx("span", { children: "Anonymous Storage" }),
      /* @__PURE__ */ jsx("span", { className: "size-1 rounded-full bg-white/20" }),
      /* @__PURE__ */ jsx("span", { children: "v.2.4.0" })
    ] })
  ] });
}
function VotingScreen({
  position,
  positionIndex,
  totalPositions,
  candidates,
  selected,
  onToggle,
  onPrev,
  onNext
}) {
  return /* @__PURE__ */ jsxs("div", { className: "animate-ballot", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-end justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "font-mono text-[10px] uppercase tracking-[0.25em] text-primary", children: [
          "Position ",
          positionIndex + 1,
          " of ",
          totalPositions
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-4xl font-extrabold tracking-tight", children: position.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: "Selected" }),
        /* @__PURE__ */ jsxs("p", { className: "font-mono text-2xl font-bold", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: selected.length }),
          /* @__PURE__ */ jsx("span", { className: "text-white/40", children: " / 3" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 flex gap-1.5", children: Array.from({
      length: totalPositions
    }).map((_, i) => /* @__PURE__ */ jsx("div", { className: `h-1 flex-1 rounded-full ${i < positionIndex ? "bg-primary" : i === positionIndex ? "bg-white" : "bg-white/10"}` }, i)) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: candidates.map((c) => {
      const isSelected = selected.includes(c.id);
      const disabled = !isSelected && selected.length >= 3;
      return /* @__PURE__ */ jsx("button", { onClick: () => !disabled && onToggle(c.id), disabled, className: `group text-left transition-all ${isSelected ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,71,171,0.1)]" : "border border-white/10 bg-white/5 hover:border-white/40"} rounded p-5 ${disabled ? "cursor-not-allowed opacity-40" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
        /* @__PURE__ */ jsx("div", { className: "size-24 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5 shadow-inner", children: c.photo ? /* @__PURE__ */ jsx("img", { src: c.photo, alt: c.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-xl font-bold text-white/80", children: c.name.split(" ").map((p) => p[0]).slice(0, 2).join("") }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: c.name }),
            /* @__PURE__ */ jsx("div", { className: `flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isSelected ? "border-primary bg-primary" : "border-white/30 bg-transparent group-hover:border-white/60"}`, children: isSelected && /* @__PURE__ */ jsx(CheckCircle2, { className: "size-4 text-white" }) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs font-medium text-white/60", children: [
            "Grade ",
            c.className,
            "-",
            c.section
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-3 line-clamp-2 text-xs italic leading-relaxed text-white/40", children: [
            "“",
            c.manifesto,
            "”"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg bg-white/5 p-2 text-center", children: [
          c.symbol ? /* @__PURE__ */ jsx("img", { src: c.symbol, alt: c.symbolName, className: "size-24 object-contain transition-transform group-hover:scale-110" }) : /* @__PURE__ */ jsx("div", { className: "flex size-24 items-center justify-center rounded bg-white/10 text-[10px] uppercase text-white/40", children: "No Icon" }),
          /* @__PURE__ */ jsx("p", { className: "w-full truncate font-mono text-[9px] font-bold uppercase tracking-widest text-primary", children: c.symbolName })
        ] })
      ] }) }, c.id);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "sticky bottom-6 mt-10 flex items-center justify-between rounded border border-white/10 bg-ink/95 p-4 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: onPrev, disabled: positionIndex === 0, className: "border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-30", children: [
        /* @__PURE__ */ jsx(ChevronLeft, { className: "mr-1 size-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: "You may select up to 3 candidates" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => {
        if (selected.length === 0) {
          toast.error("Please select at least one candidate", {
            description: `You must vote for a candidate in the ${position.name} category.`,
            icon: /* @__PURE__ */ jsx(AlertCircle, { className: "size-4" })
          });
          return;
        }
        onNext();
      }, className: `font-bold uppercase tracking-widest transition-all ${selected.length > 0 ? "bg-white text-ink hover:bg-white/90" : "bg-white/10 text-white/40"}`, children: [
        positionIndex === totalPositions - 1 ? "Review" : "Next Position",
        /* @__PURE__ */ jsx(ChevronRight, { className: "ml-1 size-4" })
      ] })
    ] })
  ] });
}
function ReviewScreen({
  positions,
  selections,
  candidatesById,
  onBack,
  onConfirm
}) {
  return /* @__PURE__ */ jsxs("div", { className: "animate-ballot", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.25em] text-primary", children: "Final Step" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-2 text-4xl font-extrabold tracking-tight", children: "Review your ballot" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/60", children: "Confirm your selections below. After submission your vote cannot be changed." }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-3", children: positions.map((p) => {
      const picks = selections[p.id] ?? [];
      return /* @__PURE__ */ jsxs("div", { className: "rounded border border-white/10 bg-white/5 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-baseline justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: p.name }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: [
            picks.length,
            " selected"
          ] })
        ] }),
        picks.length === 0 ? /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-widest text-accent", children: "No candidate selected" }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: picks.map((id) => {
          const c = candidatesById[id];
          if (!c) return null;
          return /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between border-t border-white/10 pt-2 first:border-t-0 first:pt-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              c.photo && /* @__PURE__ */ jsx("img", { src: c.photo, alt: c.name, className: "size-8 rounded-full object-cover border border-white/10" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: c.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              c.symbol && /* @__PURE__ */ jsx("img", { src: c.symbol, alt: c.symbolName, className: "size-4 object-contain" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-white/40", children: c.symbolName })
            ] })
          ] }, id);
        }) })
      ] }, p.id);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 flex gap-3", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: onBack, className: "flex-1 border-white/20 bg-transparent text-white hover:bg-white/10", children: [
        /* @__PURE__ */ jsx(ChevronLeft, { className: "mr-1 size-4" }),
        " Edit Choices"
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: onConfirm, className: "flex-1 bg-white py-6 font-extrabold uppercase tracking-widest text-ink hover:bg-white/90", children: "Submit Ballot" })
    ] })
  ] });
}
function ThanksScreen() {
  return /* @__PURE__ */ jsxs("div", { className: "animate-ballot py-24 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto flex size-20 items-center justify-center rounded-full bg-success/20", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "size-12 text-success" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mt-8 text-5xl font-extrabold tracking-tighter", children: "Thank you for voting" }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-base text-white/60", children: "Your vote has been submitted successfully." }),
    /* @__PURE__ */ jsx("p", { className: "mt-8 font-mono text-[10px] uppercase tracking-widest text-white/30", children: "Returning to access screen in 5 seconds..." })
  ] });
}
function FullScreenMessage({
  title,
  sub,
  icon
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-ink px-6 text-ink-foreground", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    icon && /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex justify-center", children: icon }),
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold tracking-tight", children: title }),
    sub && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/60", children: sub }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-8 inline-block font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white", children: "← Back to home" })
  ] }) });
}
export {
  VotePage as component
};
