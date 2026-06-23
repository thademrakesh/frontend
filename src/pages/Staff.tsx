import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { AdminShell, SectionHeader } from "@/components/election/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { electionStore, useElection } from "@/lib/election-store";

const STAFF_NAV = [{ to: "/staff", label: "Register Candidate" }];

const schema = z.object({
  positionId: z.string().min(1, "Position is required"),
  name: z.string().trim().min(2).max(80),
  className: z.string().trim().min(1).max(10),
  section: z.string().trim().min(1).max(5),
  symbolName: z.string().trim().min(1).max(40),
  symbol: z.string().min(1, "Election symbol image is required"),
});

export default function StaffPage() {
  const navigate = useNavigate();

  // Secondary safety check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || (role !== "STAFF" && role !== "ADMIN")) {
      navigate("/login");
    }
  }, [navigate]);

  const state = useElection((s) => s);
  const candidates = state.candidates;
  const currentUser =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  useEffect(() => {
    electionStore.refresh();
  }, []);

  const [form, setForm] = useState({
    positionId: "",
    name: "",
    className: "",
    section: "",
    symbolName: "",
    symbol: "",
  });

  const submitted = candidates
    .filter((c) => c.createdBy === currentUser)
    .slice(-6)
    .reverse();

  const onSubmit = (e: React.FormEvent) => {
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
      section: "",
      symbolName: "",
      symbol: "",
    });
  };

  return (
    <AdminShell role="Staff" nav={STAFF_NAV}>
      <SectionHeader eyebrow="Faculty Workflow" title="Register a candidate" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 space-y-5 rounded-sm border border-border bg-card p-6 shadow-sm"
        >
          <Field label="Position Applied For">
            <Select
              value={form.positionId}
              onValueChange={(v) => setForm({ ...form, positionId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {state.positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Student Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </Field>
            <Field label="Class">
              <Input
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
                placeholder="12"
              />
            </Field>
            <Field label="Section">
              <Input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A"
              />
            </Field>
          </div>

          <Field label="Election Symbol Name">
            <Input
              value={form.symbolName}
              onChange={(e) => setForm({ ...form, symbolName: e.target.value })}
              placeholder="e.g. Bolt, Star, Tree"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3">
            <ImageUpload
              label="Election Symbol"
              value={form.symbol}
              onChange={(v) => setForm({ ...form, symbol: v })}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <p className="text-xs text-muted-foreground">
              Status will be set to{" "}
              <strong className="text-foreground">Pending Approval</strong>{" "}
              until the Election Office verifies the nomination.
            </p>
            <Button
              type="submit"
              className="font-bold uppercase tracking-widest"
            >
              Submit Nomination
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-sm border border-border bg-card p-6">
            <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Recent Submissions
            </h3>
            {submitted.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No submissions yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {submitted.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {
                          state.positions.find((p) => p.id === c.positionId)
                            ?.name
                        }
                      </p>
                    </div>
                    <StatusChip status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-sm border border-border bg-secondary/40 p-6">
            <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Staff Permissions
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>✓ Add candidate</li>
              <li>✓ Edit before approval</li>
              <li>✗ Approve / reject</li>
              <li>✗ Start / stop election</li>
              <li>✗ Generate access codes</li>
            </ul>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning-foreground/80 border-warning/40",
    approved: "bg-success/10 text-success border-success/40",
    rejected: "bg-accent/10 text-accent border-accent/40",
    terminated: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${map[status]}`}
    >
      {status}
    </span>
  );
}
