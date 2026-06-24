import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Unlock,
  XCircle,
  Plus,
  Pencil,
} from "lucide-react";
import { AdminShell, SectionHeader } from "@/components/election/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  electionStore,
  useElection,
  type Candidate,
  type Position,
  type Election,
} from "@/lib/election-store";

const ADMIN_NAV = [
  { to: "/admin", label: "Control Panel" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/devices", label: "Devices" },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isIndex = pathname === "/admin";

  // Secondary safety check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate]);

  const state = useElection((s) => s);
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [modal, setModal] = useState<{
    kind: "reject" | "terminate";
    candidate: Candidate;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [createElectionModalOpen, setCreateElectionModalOpen] = useState(false);
  const [newElectionName, setNewElectionName] = useState("");
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    symbolName: "",
    symbol: "",
  });

  useEffect(() => {
    // Force a FULL refresh on admin page mount - this guarantees we get candidates
    electionStore.refresh(true);
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
      devices: state.devices.length,
    };
  }, [state]);

  const filtered =
    positionFilter === "all"
      ? state.candidates
      : state.candidates.filter((c) => c.positionId === positionFilter);

  if (state.isLoading && state.electionName === "Loading Election...") {
    return (
      <AdminShell role="Administration" nav={ADMIN_NAV}>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Loading Election Data...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  const handleCreateElection = async () => {
    if (!newElectionName.trim()) {
      toast.error("Please enter an election name");
      return;
    }
    try {
      const newElection = await electionStore.createElection(newElectionName);
      setSelectedElectionId(newElection.electionId);
      setNewElectionName("");
      setCreateElectionModalOpen(false);
      toast.success("Election created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create election");
    }
  };

  const handleStartElection = async () => {
    try {
      if (selectedElectionId) {
        await electionStore.startElection(selectedElectionId);
      } else {
        await electionStore.startElection();
      }
      toast.success("Election started successfully");
    } catch (error) {
      toast.error("Failed to start election");
    }
  };

  return (
    <AdminShell role="Administration" nav={ADMIN_NAV}>
      <SectionHeader
        eyebrow={state.academicYear}
        title={state.electionName}
        right={
          <div className="flex items-center gap-2 font-mono text-xs">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log("=== MANUAL FULL REFRESH ===");
                console.log("Current state before refresh:", state);
                electionStore.refresh(true);
                toast.info("Manual refresh triggered — check console!");
              }}
            >
              <RefreshCw className="mr-1 size-3" /> Refresh
            </Button>
            <StatChip label="Pending" value={totals.pending} tone="warning" />
            <StatChip label="Approved" value={totals.approved} tone="success" />
            <StatChip label="Votes" value={totals.votes} tone="primary" />
          </div>
        }
      />
      
      {/* DEBUG INFO */}
      <div className="mb-6 p-4 border border-dashed border-yellow-500 bg-yellow-500/10 rounded">
        <p className="font-mono text-xs text-yellow-500 mb-2">DEBUG INFO</p>
        <p className="text-xs text-muted-foreground">
          Total candidates in state: <strong>{state.candidates.length}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          Total positions in state: <strong>{state.positions.length}</strong>
        </p>
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">Show raw candidates</summary>
          <pre className="text-[8px] mt-2 bg-black/20 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(state.candidates, null, 2)}
          </pre>
        </details>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* CONTROL COLUMN */}
        <section className="col-span-12 space-y-6 lg:col-span-4">
          {/* Election lifecycle */}
          <Card title="Election Lifecycle">
            <p className="mb-4 text-xs text-muted-foreground">
              Current status:{" "}
              <strong className="uppercase text-foreground">
                {state.status}
              </strong>
            </p>
            <div className="flex flex-col gap-3">
              {state.status !== "active" ? (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedElectionId}
                        onValueChange={setSelectedElectionId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select election to start or create new" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.allElections
                            .filter((e) => e.status !== "active")
                            .map((election: Election) => (
                              <SelectItem key={election.electionId} value={election.electionId}>
                                {election.electionName} ({election.status})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setCreateElectionModalOpen(true)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleStartElection}
                      className="w-full bg-primary font-bold uppercase tracking-widest"
                    >
                      Start Election
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await electionStore.stopElection();
                      toast("Election closed — results unlocked");
                    } catch (error) {
                      toast.error("Failed to stop election");
                    }
                  }}
                  className="w-full font-bold uppercase tracking-widest"
                >
                  Stop Election
                </Button>
              )}
            </div>
          </Card>

          {/* Access code */}
          <Card title="Voter Access Code">
            <div className="mb-4 flex items-center justify-between rounded border border-border bg-secondary/40 p-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  Active Code
                </p>
                <p className="font-mono text-3xl font-bold tracking-[0.2em] text-primary">
                  {state.accessCode}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const c = await electionStore.generateCode();
                    toast.success(`New code: ${c}`);
                  } catch (error) {
                    toast.error("Failed to generate code");
                  }
                }}
              >
                <RefreshCw className="mr-1 size-3" /> Regenerate
              </Button>
            </div>

            <div className="mb-4 flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) =>
                  setManualCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6 digits"
                inputMode="numeric"
                className="font-mono tracking-widest"
              />
              <Button
                variant="outline"
                onClick={async () => {
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
                }}
              >
                Set
              </Button>
            </div>

            <div className="flex items-center justify-between rounded border border-border bg-background p-3">
              <div>
                <p className="text-xs font-bold">Code Protection</p>
                <p className="text-[10px] text-muted-foreground">
                  Require code before each vote
                </p>
              </div>
              <Switch
                checked={state.codeProtection}
                onCheckedChange={async (v) => {
                  try {
                    await electionStore.setCodeProtection(v);
                    toast.success(
                      `Code protection ${v ? "enabled" : "disabled"}`,
                    );
                  } catch (error) {
                    toast.error("Failed to toggle code protection");
                  }
                }}
              />
            </div>
          </Card>

          {/* Emergency */}
          <Card title="Emergency Controls">
            {state.emergencyLock ? (
              <Button
                onClick={async () => {
                  await electionStore.setEmergencyLock(false);
                  toast.success("Devices unlocked");
                }}
                className="w-full bg-success font-bold uppercase tracking-widest text-success-foreground hover:bg-success/90"
              >
                <Unlock className="mr-2 size-4" /> Unlock All Devices
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={async () => {
                  await electionStore.setEmergencyLock(true);
                  toast("All voting devices locked", {
                    icon: <Lock className="size-4" />,
                  });
                }}
                className="w-full font-bold uppercase tracking-widest"
              >
                <Lock className="mr-2 size-4" /> Lock All Devices
              </Button>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground">
              Immediately returns all kiosks to the code-entry screen and
              destroys in-flight sessions.
            </p>
          </Card>

          {/* Device summary */}
          <Card
            title="Device Monitoring"
            right={
              <Link
                to="/admin/devices"
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
              >
                View all
              </Link>
            }
          >
            <ul className="space-y-2">
              {state.devices.slice(0, 4).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between border-b border-border pb-2 text-xs last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-mono">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.lastSeen}
                    </p>
                  </div>
                  <DeviceStatusPill
                    status={state.emergencyLock ? "locked" : d.status}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* VERIFICATION COLUMN */}
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterPill
              active={positionFilter === "all"}
              onClick={() => setPositionFilter("all")}
              label={`All · ${state.candidates.length}`}
            />
            {state.positions.map((p) => {
              const count = state.candidates.filter(
                (c) => c.positionId === p.id,
              ).length;
              return (
                <FilterPill
                  key={p.id}
                  active={positionFilter === p.id}
                  onClick={() => setPositionFilter(p.id)}
                  label={`${p.name} · ${count}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-sm border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No candidates for this position.
              </div>
            ) : (
              filtered.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  positions={state.positions}
                  onApprove={() => {
                    electionStore.setCandidateStatus(c.id, "approved");
                    toast.success(`Approved ${c.name}`);
                  }}
                  onReject={() => {
                    setReason("");
                    setModal({ kind: "reject", candidate: c });
                  }}
                  onTerminate={() => {
                    setReason("");
                    setModal({ kind: "terminate", candidate: c });
                  }}
                  onEdit={() => {
                    setEditingCandidate(c);
                    setEditForm({
                      name: c.name,
                      symbolName: c.symbolName,
                      symbol: c.symbol || "",
                    });
                    setEditModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-accent" />
              {modal?.kind === "reject"
                ? "Reject candidate"
                : "Terminate candidate"}
            </DialogTitle>
            <DialogDescription>
              {modal?.kind === "reject"
                ? "The nomination will be marked as rejected. Provide a clear reason for audit."
                : "Approved candidate will be removed from voting screens immediately."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Reason ({modal?.candidate.name})
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Academic eligibility not met"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!modal) return;
                if (reason.trim().length < 5) {
                  toast.error("Provide a reason (5+ characters)");
                  return;
                }
                electionStore.setCandidateStatus(
                  modal.candidate.id,
                  modal.kind === "reject" ? "rejected" : "terminated",
                  reason.trim(),
                );
                toast.success(
                  `${modal.candidate.name} ${modal.kind === "reject" ? "rejected" : "terminated"}`,
                );
                setModal(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Election Dialog */}
      <Dialog open={createElectionModalOpen} onOpenChange={setCreateElectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
            <DialogDescription>
              Enter a name for the new election.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Election Name
            </Label>
            <Input
              value={newElectionName}
              onChange={(e) => setNewElectionName(e.target.value)}
              placeholder="e.g., Student Council 2025"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateElectionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateElection}>
              Create Election
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={editModalOpen} onOpenChange={(o) => !o && setEditModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update the candidate's details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Candidate Name">
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter candidate name"
              />
            </Field>
            <Field label="Symbol Name">
              <Input
                value={editForm.symbolName}
                onChange={(e) => setEditForm({ ...editForm, symbolName: e.target.value })}
                placeholder="e.g., Lion, Star"
              />
            </Field>
            <ImageUpload
              label="Symbol Image"
              value={editForm.symbol}
              onChange={(v) => setEditForm({ ...editForm, symbol: v })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingCandidate) return;
                try {
                  await electionStore.updateCandidate(editingCandidate.id, editForm);
                  toast.success("Candidate updated successfully");
                  setEditModalOpen(false);
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to update candidate");
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "success" | "primary";
}) {
  const tones: Record<typeof tone, string> = {
    warning: "border-warning/40 bg-warning/10 text-warning-foreground/80",
    success: "border-success/40 bg-success/10 text-success",
    primary: "border-primary/30 bg-primary/5 text-primary",
  };
  return (
    <span className={`border px-2 py-1 font-mono ${tones[tone]}`}>
      {label}: {String(value).padStart(2, "0")}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function CandidateCard({
  candidate,
  onApprove,
  onReject,
  onTerminate,
  onEdit,
  positions,
}: {
  candidate: Candidate;
  onApprove: () => void;
  onReject: () => void;
  onTerminate: () => void;
  onEdit: () => void;
  positions: Position[];
}) {
  const positionName =
    positions.find((p) => p.id === candidate.positionId)?.name ?? "";
  const statusStyles: Record<string, string> = {
    approved: "border-success/40 bg-success/5",
    rejected: "border-accent/30 bg-accent/5 opacity-80",
    terminated: "border-border bg-secondary/40 opacity-60",
    pending: "",
  };

  return (
    <div
      className={`group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-primary/40 ${statusStyles[candidate.status]}`}
    >
      <div className="flex gap-4 p-4">
        <div className="size-32 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary flex items-center justify-center">
          {candidate.symbol ? (
            <img
              src={candidate.symbol}
              alt={candidate.symbolName}
              className="h-24 w-24 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {candidate.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">
              {positionName}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Grade {candidate.className}
              </span>
              <button
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          </div>
          <h3 className="truncate text-lg font-bold">{candidate.name}</h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {candidate.symbolName}
          </p>
        </div>
      </div>

      {candidate.status === "approved" ? (
        <div className="flex items-center justify-between border-t border-border bg-success/10 px-4 py-2.5">
          <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-success">
            <CheckCircle2 className="size-3" /> Approved
          </span>
          <button
            onClick={onTerminate}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            Terminate
          </button>
        </div>
      ) : candidate.status === "rejected" ? (
        <div className="border-t border-border bg-accent/5 px-4 py-2.5">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-accent">
            <XCircle className="size-3" /> Rejected
          </p>
          {candidate.reason && (
            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
              Reason: {candidate.reason}
            </p>
          )}
        </div>
      ) : candidate.status === "terminated" ? (
        <div className="border-t border-border bg-secondary/40 px-4 py-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Terminated
          </p>
          {candidate.reason && (
            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
              Reason: {candidate.reason}
            </p>
          )}
        </div>
      ) : (
        <div className="flex border-t border-border">
          <button
            onClick={onTerminate}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary"
          >
            Terminate
          </button>
          <button
            onClick={onReject}
            className="flex-1 border-l border-border py-3 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            className="flex-1 bg-primary py-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110"
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}

function DeviceStatusPill({
  status,
}: {
  status: "active" | "idle" | "locked";
}) {
  const map = {
    active: "text-success",
    idle: "text-muted-foreground",
    locked: "text-accent",
  };
  return <span className={`font-bold uppercase ${map[status]}`}>{status}</span>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (base64: string) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB raw limit
        toast.error("File is too large. Please select an image under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max dimensions for candidates/symbols
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

          // Convert to compressed JPEG (0.7 quality)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          onChange(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <label className="flex aspect-[3/2] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-secondary/30 p-4 text-center transition-colors hover:bg-secondary/50 overflow-hidden">
        {value ? (
          <img
            src={value}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Click to upload
            </p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground shadow-sm"
        >
          ×
        </button>
      )}
    </div>
  );
}
