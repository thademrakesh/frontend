import { useSyncExternalStore } from "react";
import {
  candidateApi,
  electionApi,
  positionApi,
  voteApi,
  deviceApi,
  resultApi,
  accessCodeApi,
} from "./api";

export type Position = {
  id: string;
  name: string;
};

export type CandidateStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "terminated";

export type Candidate = {
  id: string;
  studentId: string;
  name: string;
  className: string;
  section: string;
  photo: string;
  symbolName: string;
  symbol: string;
  manifesto: string;
  positionId: string;
  status: CandidateStatus;
  reason?: string;
  createdBy: string;
};

export type DeviceInfo = {
  id: string;
  name: string;
  lastSeen: string;
  status: "active" | "idle" | "locked";
};

export type ElectionStatus = "draft" | "active" | "closed";

export type VoteRecord = {
  id: string;
  positionId: string;
  candidateId: string;
  deviceId: string;
  sessionId: string;
  ts: string;
};

export type PositionResult = {
  positionId: string;
  positionName: string;
  totalVotes: number;
  candidates: CandidateResult[];
};

export type CandidateResult = {
  candidateId: string;
  name: string;
  symbol: string;
  voteCount: number;
  percentage: number;
  winner: boolean;
};

export type AuditEntry = {
  id: string;
  user: string;
  action: string;
  description: string;
  ts: string;
};

export type ElectionState = {
  electionId?: string;
  electionName: string;
  academicYear: string;
  status: ElectionStatus;
  positions: Position[];
  candidates: Candidate[];
  devices: DeviceInfo[];
  votes: VoteRecord[];
  results: PositionResult[];
  audit: AuditEntry[];
  accessCode: string;
  codeProtection: boolean;
  emergencyLock: boolean;
  isLoading: boolean;
  stats: {
    totalVotes: number;
    activeDevices: number;
    totalCandidates: number;
  };
};

function emptyState(): ElectionState {
  return {
    electionName: "Loading Election...",
    academicYear: "2025–2026",
    status: "draft",
    positions: [],
    candidates: [],
    devices: [],
    votes: [],
    results: [],
    audit: [],
    accessCode: "------",
    codeProtection: true,
    emergencyLock: false,
    isLoading: true,
    stats: {
      totalVotes: 0,
      activeDevices: 0,
      totalCandidates: 0,
    },
  };
}

function mapCandidate(c: any): Candidate {
  return {
    id: c.candidateId,
    studentId: c.studentId,
    name: c.name,
    className: c.className,
    section: c.section,
    photo: c.photo,
    symbolName: c.symbolName,
    symbol: c.symbol,
    manifesto: c.manifesto,
    positionId: c.positionId,
    status:
      c.approvalStatus
        ?.toLowerCase()
        ?.replace("pending_approval", "pending") || "pending",
    reason: c.rejectionReason || c.terminationReason,
    createdBy: c.createdBy,
  };
}

let state: ElectionState = emptyState();
const listeners = new Set<() => void>();

function setState(updater: (s: ElectionState) => ElectionState) {
  state = updater(state);
  listeners.forEach((l) => l());
}

export const electionStore = {
  getState: () => state,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  updateState: setState, // Export the updater for direct use


  async refresh(full = false, includeResults = false, minimal = false) {
    // Initial load always shows loading spinner
    const isInitialLoad =
      state.isLoading && state.electionName === "Loading Election...";
    if (isInitialLoad || full) {
      setState((s) => ({ ...s, isLoading: true }));
    }

    try {
      const isAdmin =
        typeof window !== "undefined" &&
        localStorage.getItem("role") === "ADMIN";

      // If minimal is true, we only care about election status and code protection
      if (minimal && !isAdmin) {
        const [election, codeStatus] = await Promise.all([
          electionApi.getActiveElection().catch(() => null),
          accessCodeApi.getStatus().catch(() => null),
        ]);

        setState((s) => ({
          ...s,
          electionId: election?.electionId || s.electionId,
          electionName:
            election?.electionName ||
            (election?.electionId ? s.electionName : "No Active Election"),
          academicYear: election?.academicYear || s.academicYear,
          status: (election?.status?.toLowerCase() as ElectionStatus) || s.status,
          codeProtection: codeStatus?.codeRequired ?? s.codeProtection,
          isLoading: false,
        }));
        return;
      }

      // Parallelize everything
      const requests: Promise<any>[] = [
        electionApi.getActiveElection().catch(() => null),
        positionApi.getAll().catch(() => []),
      ];

      // Only fetch candidates if we need them or on full refresh
      if (full || isInitialLoad || state.candidates.length === 0) {
        requests.push(candidateApi.getAll().catch(() => []));
      } else {
        requests.push(Promise.resolve(null)); // Keep array indices consistent
      }

      let results: any[] = [];
      if (isAdmin || includeResults) {
        results = await resultApi.getResults().catch(() => []);
      }

      const [election, positions, candidates] =
        await Promise.all(requests);

      let devices: any[] = [];
      let analytics: any = null;
      let accessCode: any = null;
      let codeStatus: any = null;

      if (isAdmin) {
        [devices, analytics, accessCode] = await Promise.all([
          deviceApi.getAll().catch(() => []),
          resultApi.getAnalytics().catch(() => null),
          accessCodeApi.getLatest().catch(() => null),
        ]);
      } else {
        codeStatus = await accessCodeApi.getStatus().catch(() => null);
      }

      setState((s) => ({
        ...s,
        electionId: election?.electionId || s.electionId,
        electionName:
          election?.electionName ||
          (election?.electionId ? s.electionName : "No Active Election"),
        academicYear: election?.academicYear || s.academicYear,
        status: (election?.status?.toLowerCase() as ElectionStatus) || s.status,
        candidates: candidates
          ? (candidates || []).map(mapCandidate)
          : s.candidates,
        positions: (positions || []).map((p: any) => ({
          id: p.positionId,
          name: p.positionName,
        })),
        devices: (devices || []).map((d: any) => ({
          id: d.deviceId,
          name: d.deviceName,
          lastSeen: d.lastUsedDate || d.createdDate,
          status: d.locked ? "locked" : "active",
        })),
        results: results || [],
        stats: {
          totalVotes: analytics?.totalVotes || 0,
          activeDevices: analytics?.activeDevices || 0,
          totalCandidates: analytics?.totalCandidates || 0,
        },
        accessCode: accessCode?.code || s.accessCode,
        codeProtection: isAdmin
          ? (accessCode?.active ?? s.codeProtection)
          : (codeStatus?.codeRequired ?? s.codeProtection),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to refresh election state:", error);
      setState((s) => ({ ...s, isLoading: false }));
    }
  },

  async addCandidate(c: Omit<Candidate, "id" | "status" | "createdBy">) {
    try {
      const username =
        typeof window !== "undefined"
          ? localStorage.getItem("username")
          : "staff";
      const res = await candidateApi.create({
        ...c,
        approvalStatus: "PENDING_APPROVAL",
        createdBy: username || "staff",
      });
      setState((s) => ({
        ...s,
        candidates: [...s.candidates, mapCandidate(res)],
      }));
    } catch (error) {
      console.error("Failed to add candidate:", error);
      throw error;
    }
  },

  async setCandidateStatus(
    id: string,
    status: CandidateStatus,
    reason?: string,
  ) {
    // Optimistic update
    const previousCandidates = [...state.candidates];
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((c) =>
        c.id === id ? { ...c, status, reason } : c,
      ),
    }));

    try {
      let res;
      if (status === "approved") {
        res = await candidateApi.approve(id);
      } else if (status === "rejected") {
        res = await candidateApi.reject(id, reason || "");
      } else if (status === "terminated") {
        res = await candidateApi.terminate(id, reason || "");
      }
      if (res) {
        setState((s) => ({
          ...s,
          candidates: s.candidates.map((c) =>
            c.id === id ? mapCandidate(res) : c,
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to set candidate status:", error);
      // Rollback on error
      setState((s) => ({ ...s, candidates: previousCandidates }));
      throw error;
    }
  },

  async startElection() {
    const previousStatus = state.status;
    setState((s) => ({ ...s, status: "active" }));

    try {
      const res = await electionApi.startElection();
      setState((s) => ({
        ...s,
        electionId: res?.electionId || s.electionId,
        electionName: res?.electionName || s.electionName,
        academicYear: res?.academicYear || s.academicYear,
        status: (res?.status?.toLowerCase() as ElectionStatus) || "active",
      }));

      // Ensure we get the new access code if protection is on
      const isAdmin =
        typeof window !== "undefined" &&
        localStorage.getItem("role") === "ADMIN";
      if (isAdmin) {
        const accessCode = await accessCodeApi.getLatest().catch(() => null);
        if (accessCode) {
          setState((s) => ({
            ...s,
            accessCode: accessCode.code || "------",
            codeProtection: accessCode.active ?? true,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to start election:", error);
      setState((s) => ({ ...s, status: previousStatus }));
      throw error;
    }
  },

  async stopElection() {
    const previousStatus = state.status;
    setState((s) => ({ ...s, status: "closed" }));

    try {
      const s = this.getState();
      if (s.electionId) {
        const res = await electionApi.stopElection(s.electionId);
        setState((prev) => ({
          ...prev,
          status: (res?.status?.toLowerCase() as ElectionStatus) || "closed",
        }));
      }
    } catch (error) {
      console.error("Failed to stop election:", error);
      setState((s) => ({ ...s, status: previousStatus }));
      throw error;
    }
  },

  async generateCode() {
    try {
      const res = await accessCodeApi.generate();
      setState((s) => ({
        ...s,
        accessCode: res.code || s.accessCode,
        codeProtection: res.active ?? s.codeProtection,
      }));
      return res.code;
    } catch (error) {
      console.error("Failed to generate code:", error);
      throw error;
    }
  },

  async setCode(code: string) {
    try {
      const res = await accessCodeApi.setManual(code);
      setState((s) => ({
        ...s,
        accessCode: res.code || code,
        codeProtection: res.active ?? s.codeProtection,
      }));
    } catch (error) {
      console.error("Failed to set code:", error);
      throw error;
    }
  },

  async setCodeProtection(on: boolean) {
    const previous = state.codeProtection;
    setState((s) => ({ ...s, codeProtection: on }));
    try {
      const res = await accessCodeApi.toggleProtection(on);
      setState((s) => ({
        ...s,
        codeProtection: res?.active ?? on,
      }));
    } catch (error) {
      console.error("Failed to set code protection:", error);
      setState((s) => ({ ...s, codeProtection: previous }));
      throw error;
    }
  },

  async setEmergencyLock(on: boolean) {
    const previous = state.emergencyLock;
    setState((s) => ({ ...s, emergencyLock: on }));
    try {
      if (on) {
        await deviceApi.lockAll();
      } else {
        await deviceApi.unlockAll();
      }
      setState((s) => ({
        ...s,
        devices: s.devices.map((d) => ({
          ...d,
          status: on ? "locked" : "active",
        })),
      }));
    } catch (error) {
      console.error("Failed to set emergency lock:", error);
      setState((s) => ({ ...s, emergencyLock: previous }));
      throw error;
    }
  },

  async submitVotes(
    deviceId: string,
    picks: { positionId: string; candidateId: string }[],
  ) {
    try {
      const s = this.getState();

      // Convert picks to Map<positionId, List<candidateId>>
      const selections: Record<string, string[]> = {};
      picks.forEach((p) => {
        if (!selections[p.positionId]) selections[p.positionId] = [];
        selections[p.positionId].push(p.candidateId);
      });

      await voteApi.submit({
        deviceId,
        electionId: s.electionId,
        selections: selections,
      });
    } catch (error) {
      console.error("Failed to submit votes:", error);
      throw error;
    }
  },
};

export function useElection<T>(selector: (s: ElectionState) => T): T {
  return useSyncExternalStore(
    electionStore.subscribe,
    () => selector(electionStore.getState()),
    () => selector(state),
  );
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "DEVICE-SSR";
  const KEY = "civis-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "DEVICE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function tallyForPosition(positionId: string) {
  const s = electionStore.getState();
  const res = s.results.find((r) => r.positionId === positionId);

  if (!res) {
    return {
      total: 0,
      candidates: [],
    };
  }

  return {
    total: res.totalVotes,
    candidates: res.candidates.map((c) => ({
      candidate: s.candidates.find((can) => can.id === c.candidateId) || {
        id: c.candidateId,
        name: c.name,
        symbol: c.symbol,
        symbolName: "",
        photo: "",
      },
      votes: c.voteCount,
      percent: Math.round(c.percentage),
      winner: c.winner,
    })),
  };
}
