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
  photo?: string;
  symbolName: string;
  symbol: string;
  manifesto?: string;
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

export type Election = {
  electionId: string;
  electionName: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
  status: ElectionStatus;
};

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
  allElections: Election[];
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
    allElections: [],
  };
}

function mapCandidate(c: any): Candidate {
  return {
    id: c.candidateId,
    studentId: c.studentId,
    name: c.name,
    className: c.className,
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

  async refresh(full = false, includeResults = false, minimal = false, showSpinner = true) {
    console.log("=== ELECTION STORE REFRESH CALLED ===");
    console.log("Full:", full, "Include Results:", includeResults, "Minimal:", minimal);
    
    // Initial load always shows loading spinner
    const isInitialLoad =
      state.isLoading && state.electionName === "Loading Election...";
    if ((isInitialLoad || full) && showSpinner) {
      setState((s) => ({ ...s, isLoading: true }));
    }

    // Helper function to add timeout to promises
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs)),
      ]);
    };

    try {
      const isAdmin =
        typeof window !== "undefined" &&
        localStorage.getItem("role") === "ADMIN";
      console.log("Is Admin:", isAdmin, "Token in localStorage:", !!localStorage.getItem("token"));

      // Fetch all elections regardless
      const allElections = await withTimeout(electionApi.getAllElections().catch(() => []), 10000, []);

      // If minimal is true, we only care about election status and code protection
      if (minimal && !isAdmin) {
        const [election, codeStatus] = await Promise.all([
          withTimeout(electionApi.getActiveElection().catch(() => null), 10000, null),
          withTimeout(accessCodeApi.getStatus().catch(() => null), 10000, null),
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
          allElections: allElections,
          isLoading: false,
        }));
        return;
      }

      // Parallelize everything with timeouts
      console.log("Fetching election and positions...");
      const requests: Promise<any>[] = [
        withTimeout(electionApi.getActiveElection().catch((err) => {
          console.error("ERROR fetching election:", err);
          return null;
        }), 15000, null),
        withTimeout(positionApi.getAll().catch((err) => {
          console.error("ERROR fetching positions:", err);
          return [];
        }), 15000, []),
      ];

      // Only fetch candidates if we need them or on full refresh
      if (full || isInitialLoad || state.candidates.length === 0) {
        console.log("Fetching ALL candidates...");
        requests.push(withTimeout(candidateApi.getAll().catch((err) => {
          console.error("ERROR fetching candidates:", err);
          return [];
        }), 20000, []));
      } else {
        console.log("Skipping candidate fetch, using existing data");
        requests.push(Promise.resolve(null)); // Keep array indices consistent
      }

      let results: any[] = [];
      if (isAdmin || includeResults) {
        console.log("Fetching results...");
        results = await withTimeout(resultApi.getResults().catch((err) => {
          console.error("ERROR fetching results:", err);
          return [];
        }), 20000, []);
      }

      console.log("Waiting for main requests...");
      const [election, positions, candidates] =
        await Promise.all(requests);
      
      console.log("=== FETCH RESULTS ===");
      console.log("Election:", election);
      console.log("Positions:", positions);
      console.log("Candidates from API:", candidates);
      console.log("Results:", results);

      let devices: any[] = [];
      let analytics: any = null;
      let accessCode: any = null;
      let codeStatus: any = null;

      if (isAdmin) {
        console.log("Admin - fetching devices, analytics, access code...");
        [devices, analytics, accessCode] = await Promise.all([
          withTimeout(deviceApi.getAll().catch(() => []), 10000, []),
          withTimeout(resultApi.getAnalytics().catch(() => null), 10000, null),
          withTimeout(accessCodeApi.getLatest().catch(() => null), 10000, null),
        ]);
        console.log("Devices:", devices);
        console.log("Analytics:", analytics);
        console.log("Access Code:", accessCode);
      } else {
        codeStatus = await withTimeout(accessCodeApi.getStatus().catch(() => null), 10000, null);
      }

      const mappedCandidates = candidates ? (candidates || []).map(mapCandidate) : state.candidates;
      console.log("Mapped Candidates:", mappedCandidates);

      setState((s) => ({
        ...s,
        electionId: election?.electionId || s.electionId,
        electionName:
          election?.electionName ||
          (election?.electionId ? s.electionName : "No Active Election"),
        academicYear: election?.academicYear || s.academicYear,
        status: (election?.status?.toLowerCase() as ElectionStatus) || s.status,
        candidates: mappedCandidates,
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
        allElections: allElections,
        isLoading: false,
      }));
      
      console.log("=== STATE UPDATED ===");
    } catch (error) {
      console.error("!!! FAILED TO REFRESH ELECTION STATE:", error);
      setState((s) => ({ ...s, isLoading: false }));
    }
  },

  async createElection(electionName: string) {
    const currentYear = new Date().getFullYear();
    const newElection = await electionApi.createElection({
      electionName: electionName,
      academicYear: `${currentYear}-${currentYear + 1}`,
    });
    setState((s) => ({
      ...s,
      allElections: [...s.allElections, newElection],
    }));
    return newElection;
  },

  async startElection(electionId?: string) {
    const previousStatus = state.status;
    setState((s) => ({ ...s, status: "active" }));

    try {
      const res = await electionApi.startElection(electionId);
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
      // Refresh elections to update statuses
      await this.refresh(true, false, false, false);
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
        // Refresh elections to update statuses
        await this.refresh(true, false, false, false);
      }
    } catch (error) {
      console.error("Failed to stop election:", error);
      setState((s) => ({ ...s, status: previousStatus }));
      throw error;
    }
  },

  async refreshResultsForElection(electionId: string) {
    try {
      const results = await resultApi.getResultsForElection(electionId);
      const election = await electionApi.getElectionById(electionId);
      setState((s) => ({
        ...s,
        results: results,
        electionName: election.electionName,
        academicYear: election.academicYear,
        status: election.status.toLowerCase() as ElectionStatus,
        electionId: election.electionId,
      }));
    } catch (error) {
      console.error("Failed to refresh results for election:", error);
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

  async updateCandidate(id: string, c: Partial<Candidate>) {
    try {
      // Map frontend type to backend type
      const backendCandidate = {
        name: c.name,
        symbolName: c.symbolName,
        symbol: c.symbol,
        className: c.className,
        positionId: c.positionId,
      };
      const res = await candidateApi.update(id, backendCandidate);
      setState((s) => ({
        ...s,
        candidates: s.candidates.map((existing) =>
          existing.id === id ? mapCandidate(res) : existing
        ),
      }));
    } catch (error) {
      console.error("Failed to update candidate:", error);
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
      isTie: false,
    };
  }

  // Determine if it's a tie
  const sortedCandidates = [...res.candidates].sort((a, b) => b.voteCount - a.voteCount);
  let isTie = false;
  
  if (sortedCandidates.length >= 2) {
    // Check if top two have same votes and votes > 0
    if (sortedCandidates[0].voteCount === sortedCandidates[1].voteCount && sortedCandidates[0].voteCount > 0) {
      isTie = true;
    }
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
    isTie,
  };
}