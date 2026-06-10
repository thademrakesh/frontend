import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  electionStore,
  getOrCreateDeviceId,
  useElection,
  type Candidate,
} from "@/lib/election-store";
import { accessCodeApi, deviceApi } from "@/lib/api";

type Phase = "code" | "voting" | "review" | "thanks";

const SESSION_TIMEOUT_MS = 2 * 60 * 1000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VotePage() {
  const state = useElection((s) => s);
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  useEffect(() => {
    electionStore.refresh();
    // Register device explicitly
    deviceApi.register(deviceId, `Kiosk ${deviceId.slice(-4)}`).catch((err) => {
      console.warn("Failed to register device, but will try to proceed:", err);
    });
  }, [deviceId]);

  // Election-level gates
  if (state.isLoading)
    return <FullScreenMessage title="Connecting to Election Authority..." />;
  if (state.status === "draft")
    return (
      <FullScreenMessage
        title="Election has not started yet."
        showLogin={true}
      />
    );
  if (state.status === "closed")
    return (
      <FullScreenMessage
        title="Election has ended."
        sub="Thank you for participating. Results are now available to the administration."
        showLogin={true}
      />
    );
  if (state.emergencyLock)
    return (
      <FullScreenMessage
        title="All voting devices are temporarily locked."
        sub="Please wait for instructions from the election staff."
        icon={<Lock className="size-8 text-accent" />}
      />
    );

  return <VotingKiosk deviceId={deviceId} />;
}

function VotingKiosk({ deviceId }: { deviceId: string }) {
  const accessCode = useElection((s) => s.accessCode);
  const codeProtection = useElection((s) => s.codeProtection);
  const candidates = useElection((s) => s.candidates);
  const positions = useElection((s) => s.positions);

  const [phase, setPhase] = useState<Phase>(codeProtection ? "code" : "voting");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [positionIndex, setPositionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-session candidate ordering (randomized once per session)
  const orderRef = useRef<Map<string, Candidate[]> | null>(null);
  if (!orderRef.current && positions.length > 0) {
    orderRef.current = new Map();
    for (const p of positions) {
      const list = candidates.filter(
        (c) => c.positionId === p.id && c.status === "approved",
      );
      orderRef.current.set(p.id, shuffle(list));
    }
  }

  // Session timeout
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (phase === "code" || phase === "thanks") return;
    timerRef.current = setTimeout(() => {
      resetSession("Session expired due to inactivity.");
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

  const activePositions = positions.filter(
    (p) => (orderRef.current?.get(p.id)?.length ?? 0) > 0,
  );
  const currentPos = activePositions[positionIndex];
  const currentCandidates = currentPos
    ? orderRef.current!.get(currentPos.id)!
    : [];
  const currentSel = currentPos ? (selections[currentPos.id] ?? []) : [];

  function resetSession(_reason?: string) {
    setPhase(codeProtection ? "code" : "voting");
    setCodeInput("");
    setCodeError(null);
    setPositionIndex(0);
    setSelections({});
    setShowConfirm(false);
    orderRef.current = new Map();
    for (const p of positions) {
      const list = candidates.filter(
        (c) => c.positionId === p.id && c.status === "approved",
      );
      orderRef.current.set(p.id, shuffle(list));
    }
  }

  function verifyCode() {
    // If the access code is not loaded in state (e.g. for public user),
    // we should verify it via backend API
    accessCodeApi
      .verify(codeInput)
      .then((res) => {
        if (res.valid) {
          setPhase("voting");
          setCodeError(null);
        } else {
          setCodeError("Invalid Code. Please contact the election staff.");
        }
      })
      .catch(() => {
        setCodeError("Error verifying code. Please try again.");
      });
  }

  function toggleSelection(candidateId: string) {
    if (!currentPos) return;
    setSelections((prev) => {
      const list = prev[currentPos.id] ?? [];
      if (list.includes(candidateId)) {
        return {
          ...prev,
          [currentPos.id]: list.filter((id) => id !== candidateId),
        };
      }
      if (list.length >= 3) return prev;
      return { ...prev, [currentPos.id]: [...list, candidateId] };
    });
  }

  async function submitVotes() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const picks: { positionId: string; candidateId: string }[] = [];
    for (const [positionId, candIds] of Object.entries(selections)) {
      for (const candidateId of candIds)
        picks.push({ positionId, candidateId });
    }

    try {
      await electionStore.submitVotes(deviceId, picks);
      setShowConfirm(false);
      setPhase("thanks");
      setTimeout(() => {
        setIsSubmitting(false);
        resetSession();
      }, 5000);
    } catch (error: any) {
      setIsSubmitting(false);
      const msg =
        error.response?.data?.error ||
        "Failed to submit ballot. Please try again.";
      toast.error(msg, {
        icon: <AlertCircle className="size-4" />,
      });
    }
  }

  /* RENDER */
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-ink-foreground">
              <div className="size-2.5 border-2 border-ink" />
            </div>
            <span className="font-extrabold uppercase tracking-tighter">
              Gentanjali school voting
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span>Kiosk · {deviceId}</span>
            <span className="size-1 rounded-full bg-white/20" />
            <Link to="/" className="hover:text-white/80">
              Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {phase === "code" && (
          <CodeScreen
            value={codeInput}
            onChange={(v) => {
              setCodeInput(v);
              setCodeError(null);
            }}
            onSubmit={verifyCode}
            error={codeError}
          />
        )}

        {phase === "voting" && currentPos && (
          <VotingScreen
            position={currentPos}
            positionIndex={positionIndex}
            totalPositions={activePositions.length}
            candidates={currentCandidates}
            selected={currentSel}
            onToggle={toggleSelection}
            onPrev={() => setPositionIndex((i) => Math.max(0, i - 1))}
            onNext={() => {
              if (positionIndex < activePositions.length - 1) {
                setPositionIndex((i) => i + 1);
              } else {
                setPhase("review");
              }
            }}
          />
        )}

        {phase === "review" && (
          <ReviewScreen
            positions={activePositions}
            selections={selections}
            candidatesById={Object.fromEntries(
              candidates.map((c) => [c.id, c]),
            )}
            onBack={() => setPhase("voting")}
            onConfirm={() => setShowConfirm(true)}
          />
        )}

        {phase === "thanks" && <ThanksScreen />}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-w-md rounded border border-white/10 bg-ink p-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Confirm submission
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Your vote will be submitted permanently and cannot be changed.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-50"
              >
                No, Go Back
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={submitVotes}
                className="flex-1 bg-white font-bold uppercase tracking-widest text-ink hover:bg-white/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------ Sub-screens ------------- */

function CodeScreen({
  value,
  onChange,
  onSubmit,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  error: string | null;
}) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  return (
    <div className="animate-ballot mx-auto max-w-2xl text-center">
      <p className="font-mono text-sm uppercase tracking-[0.25em] text-primary">
        Secure Voting Portal
      </p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tighter">
        Cast Your Ballot
      </h1>

      <div className="mt-10 rounded border border-white/10 bg-white/5 p-12 backdrop-blur-sm">
        <p className="text-sm text-white/60">
          Enter the 6-digit access code provided by election staff.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {digits.map((d, i) => (
            <div
              key={i}
              className={`flex size-14 items-center justify-center rounded font-mono text-3xl font-bold ${
                d
                  ? "border-2 border-primary bg-background text-foreground shadow-[0_0_15px_rgba(0,71,171,0.3)]"
                  : "border border-white/20 bg-white/10 text-white"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <input
          autoFocus
          inputMode="numeric"
          value={value}
          maxLength={6}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.length === 6) onSubmit();
          }}
          className="mt-6 w-full rounded border border-white/20 bg-transparent px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-white placeholder-white/30 outline-none focus:border-primary"
          placeholder="000000"
        />
        {error && (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">
            {error}
          </p>
        )}
        <Button
          onClick={onSubmit}
          disabled={value.length !== 6}
          className="mt-6 w-full bg-white py-6 font-extrabold uppercase tracking-widest text-ink hover:bg-white/90 disabled:opacity-40"
        >
          Verify Identity
        </Button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
        <span>Secure Channel</span>
        <span className="size-1 rounded-full bg-white/20" />
        <span>Anonymous Storage</span>
        <span className="size-1 rounded-full bg-white/20" />
        <span>v.2.4.0</span>
      </div>
    </div>
  );
}

function VotingScreen({
  position,
  positionIndex,
  totalPositions,
  candidates,
  selected,
  onToggle,
  onPrev,
  onNext,
}: {
  position: { id: string; name: string };
  positionIndex: number;
  totalPositions: number;
  candidates: Candidate[];
  selected: string[];
  onToggle: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-ballot">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Position {positionIndex + 1} of {totalPositions}
          </p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
            {position.name}
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Selected
          </p>
          <p className="font-mono text-2xl font-bold">
            <span className="text-primary">{selected.length}</span>
            <span className="text-white/40"> / 3</span>
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex gap-1.5">
        {Array.from({ length: totalPositions }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < positionIndex
                ? "bg-primary"
                : i === positionIndex
                  ? "bg-white"
                  : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {candidates.map((c) => {
          const isSelected = selected.includes(c.id);
          const disabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={c.id}
              onClick={() => !disabled && onToggle(c.id)}
              disabled={disabled}
              className={`group text-left transition-all ${
                isSelected
                  ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,71,171,0.1)]"
                  : "border border-white/10 bg-white/5 hover:border-white/40"
              } rounded p-5 ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
            >
              <div className="flex items-center gap-5">
                {/* Left: Photo */}
                <div className="size-24 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5 shadow-inner">
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/80">
                      {c.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>

                {/* Center: Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-white/30 bg-transparent group-hover:border-white/60"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="size-4 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-white/60">
                    Grade {c.className}-{c.section}
                  </p>
                  <p className="mt-3 line-clamp-2 text-xs italic leading-relaxed text-white/40">
                    “{c.manifesto}”
                  </p>
                </div>

                {/* Right: Symbol */}
                <div className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg bg-white/5 p-2 text-center">
                  {c.symbol ? (
                    <img
                      src={c.symbol}
                      alt={c.symbolName}
                      className="size-24 object-contain transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded bg-white/10 text-[10px] uppercase text-white/40">
                      No Icon
                    </div>
                  )}
                  <p className="w-full truncate font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                    {c.symbolName}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-6 mt-10 flex items-center justify-between rounded border border-white/10 bg-ink/95 p-4 backdrop-blur-md">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={positionIndex === 0}
          className="border-white/20 bg-transparent text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="mr-1 size-4" /> Back
        </Button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          You may select up to 3 candidates
        </p>
        <Button
          onClick={() => {
            if (selected.length === 0) {
              toast.error("Please select at least one candidate", {
                description: `You must vote for a candidate in the ${position.name} category.`,
                icon: <AlertCircle className="size-4" />,
              });
              return;
            }
            onNext();
          }}
          className={`font-bold uppercase tracking-widest transition-all ${
            selected.length > 0
              ? "bg-white text-ink hover:bg-white/90"
              : "bg-white/10 text-white/40"
          }`}
        >
          {positionIndex === totalPositions - 1 ? "Review" : "Next Position"}
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}

function ReviewScreen({
  positions,
  selections,
  candidatesById,
  onBack,
  onConfirm,
}: {
  positions: { id: string; name: string }[];
  selections: Record<string, string[]>;
  candidatesById: Record<string, Candidate>;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="animate-ballot">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
        Final Step
      </p>
      <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
        Review your ballot
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Confirm your selections below. After submission your vote cannot be
        changed.
      </p>

      <div className="mt-8 space-y-3">
        {positions.map((p) => {
          const picks = selections[p.id] ?? [];
          return (
            <div
              key={p.id}
              className="rounded border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {picks.length} selected
                </span>
              </div>
              {picks.length === 0 ? (
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  No candidate selected
                </p>
              ) : (
                <ul className="space-y-2">
                  {picks.map((id) => {
                    const c = candidatesById[id];
                    if (!c) return null;
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between border-t border-white/10 pt-2 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-center gap-3">
                          {c.photo && (
                            <img
                              src={c.photo}
                              alt={c.name}
                              className="size-8 rounded-full object-cover border border-white/10"
                            />
                          )}
                          <span className="font-bold">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.symbol && (
                            <img
                              src={c.symbol}
                              alt={c.symbolName}
                              className="size-4 object-contain"
                            />
                          )}
                          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                            {c.symbolName}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          <ChevronLeft className="mr-1 size-4" /> Edit Choices
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 bg-white py-6 font-extrabold uppercase tracking-widest text-ink hover:bg-white/90"
        >
          Submit Ballot
        </Button>
      </div>
    </div>
  );
}

function ThanksScreen() {
  return (
    <div className="animate-ballot py-24 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/20">
        <CheckCircle2 className="size-12 text-success" />
      </div>
      <h2 className="mt-8 text-5xl font-extrabold tracking-tighter">
        Thank you for voting
      </h2>
      <p className="mt-4 text-base text-white/60">
        Your vote has been submitted successfully.
      </p>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-white/30">
        Returning to access screen in 5 seconds...
      </p>
    </div>
  );
}

function FullScreenMessage({
  title,
  sub,
  icon,
  showLogin = false,
}: {
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  showLogin?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-ink-foreground">
      <div className="max-w-md text-center">
        {icon && <div className="mx-auto mb-6 flex justify-center">{icon}</div>}
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-3 text-sm text-white/60">{sub}</p>}
        <div className="mt-8 flex items-center justify-center gap-6">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
          >
            ← Back to home
          </Link>
          {showLogin && (
            <>
              <span className="size-1 rounded-full bg-white/20" />
              <Link
                to="/login"
                className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
              >
                Login →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
