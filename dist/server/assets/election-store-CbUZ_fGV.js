import { useSyncExternalStore } from "react";
import { v as voteApi, d as deviceApi, a as accessCodeApi, e as electionApi, f as candidateApi, p as positionApi, r as resultApi } from "./api-CgB5BbtB.js";
function emptyState() {
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
      totalCandidates: 0
    }
  };
}
let state = emptyState();
const listeners = /* @__PURE__ */ new Set();
function setState(updater) {
  state = updater(state);
  listeners.forEach((l) => l());
}
const electionStore = {
  getState: () => state,
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  async refresh(full = false) {
    const isInitialLoad = state.isLoading && state.electionName === "Loading Election...";
    if (isInitialLoad || full) {
      setState((s) => ({ ...s, isLoading: true }));
    }
    try {
      const isAdmin = typeof window !== "undefined" && localStorage.getItem("role") === "ADMIN";
      const requests = [
        electionApi.getActiveElection().catch(() => null),
        positionApi.getAll().catch(() => [])
      ];
      if (full || isInitialLoad || state.candidates.length === 0) {
        requests.push(candidateApi.getAll().catch(() => []));
      } else {
        requests.push(Promise.resolve(null));
      }
      requests.push(resultApi.getResults().catch(() => []));
      const [election, positions, candidates, results] = await Promise.all(requests);
      let devices = [];
      let analytics = null;
      let accessCode = null;
      let codeStatus = null;
      if (isAdmin) {
        [devices, analytics, accessCode] = await Promise.all([
          deviceApi.getAll().catch(() => []),
          resultApi.getAnalytics().catch(() => null),
          accessCodeApi.getLatest().catch(() => null)
        ]);
      } else {
        codeStatus = await accessCodeApi.getStatus().catch(() => null);
      }
      setState((s) => ({
        ...s,
        electionId: election?.electionId || s.electionId,
        electionName: election?.electionName || (s.electionId ? s.electionName : "No Active Election"),
        academicYear: election?.academicYear || s.academicYear,
        status: election?.status?.toLowerCase() || s.status,
        candidates: candidates ? (candidates || []).map((c) => ({
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
          status: c.approvalStatus?.toLowerCase()?.replace("pending_approval", "pending") || "pending",
          reason: c.rejectionReason || c.terminationReason,
          createdBy: c.createdBy
        })) : s.candidates,
        positions: (positions || []).map((p) => ({
          id: p.positionId,
          name: p.positionName
        })),
        devices: (devices || []).map((d) => ({
          id: d.deviceId,
          name: d.deviceName,
          lastSeen: d.lastUsedDate || d.createdDate,
          status: d.locked ? "locked" : "active"
        })),
        results: results || [],
        stats: {
          totalVotes: analytics?.totalVotes || 0,
          activeDevices: analytics?.activeDevices || 0,
          totalCandidates: analytics?.totalCandidates || 0
        },
        accessCode: accessCode?.code || s.accessCode,
        codeProtection: isAdmin ? accessCode?.active ?? s.codeProtection : codeStatus?.codeRequired ?? s.codeProtection,
        isLoading: false
      }));
    } catch (error) {
      console.error("Failed to refresh election state:", error);
      setState((s) => ({ ...s, isLoading: false }));
    }
  },
  async addCandidate(c) {
    try {
      const username = typeof window !== "undefined" ? localStorage.getItem("username") : "staff";
      await candidateApi.create({
        ...c,
        approvalStatus: "PENDING_APPROVAL",
        createdBy: username || "staff"
      });
      await this.refresh();
    } catch (error) {
      console.error("Failed to add candidate:", error);
      throw error;
    }
  },
  async setCandidateStatus(id, status, reason) {
    const previousCandidates = [...state.candidates];
    setState((s) => ({
      ...s,
      candidates: s.candidates.map(
        (c) => c.id === id ? { ...c, status, reason } : c
      )
    }));
    try {
      if (status === "approved") {
        await candidateApi.approve(id);
      } else if (status === "rejected") {
        await candidateApi.reject(id, reason || "");
      } else if (status === "terminated") {
        await candidateApi.terminate(id, reason || "");
      }
      this.refresh();
    } catch (error) {
      console.error("Failed to set candidate status:", error);
      setState((s) => ({ ...s, candidates: previousCandidates }));
      throw error;
    }
  },
  async startElection() {
    try {
      await electionApi.startElection();
      this.refresh();
      const isAdmin = typeof window !== "undefined" && localStorage.getItem("role") === "ADMIN";
      if (isAdmin) {
        accessCodeApi.getLatest().then((accessCode) => {
          if (accessCode) {
            setState((s) => ({
              ...s,
              accessCode: accessCode.code || "------",
              codeProtection: accessCode.active ?? true
            }));
          }
        }).catch(() => null);
      }
    } catch (error) {
      console.error("Failed to start election:", error);
      throw error;
    }
  },
  async stopElection() {
    try {
      const s = this.getState();
      if (s.electionId) {
        await electionApi.stopElection(s.electionId);
        this.refresh();
      }
    } catch (error) {
      console.error("Failed to stop election:", error);
      throw error;
    }
  },
  async generateCode() {
    try {
      const res = await accessCodeApi.generate();
      await this.refresh();
      return res.code;
    } catch (error) {
      console.error("Failed to generate code:", error);
      throw error;
    }
  },
  async setCode(code) {
    try {
      await accessCodeApi.setManual(code);
      await this.refresh();
    } catch (error) {
      console.error("Failed to set code:", error);
      throw error;
    }
  },
  async setCodeProtection(on) {
    try {
      await accessCodeApi.toggleProtection(on);
      await this.refresh();
    } catch (error) {
      console.error("Failed to set code protection:", error);
      throw error;
    }
  },
  async setEmergencyLock(on) {
    try {
      if (on) {
        await deviceApi.lockAll();
      } else {
        await deviceApi.unlockAll();
      }
      setState((s) => ({ ...s, emergencyLock: on }));
      this.refresh();
    } catch (error) {
      console.error("Failed to set emergency lock:", error);
      throw error;
    }
  },
  async submitVotes(deviceId, picks) {
    try {
      const s = this.getState();
      const selections = {};
      picks.forEach((p) => {
        if (!selections[p.positionId]) selections[p.positionId] = [];
        selections[p.positionId].push(p.candidateId);
      });
      await voteApi.submit({
        deviceId,
        electionId: s.electionId,
        selections
      });
      this.refresh();
    } catch (error) {
      console.error("Failed to submit votes:", error);
      throw error;
    }
  }
};
function useElection(selector) {
  return useSyncExternalStore(
    electionStore.subscribe,
    () => selector(electionStore.getState()),
    () => selector(state)
  );
}
function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "DEVICE-SSR";
  const KEY = "civis-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "DEVICE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem(KEY, id);
  }
  return id;
}
function tallyForPosition(positionId) {
  const s = electionStore.getState();
  const res = s.results.find((r) => r.positionId === positionId);
  if (!res) {
    return {
      total: 0,
      candidates: []
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
        photo: ""
      },
      votes: c.voteCount,
      percent: Math.round(c.percentage),
      winner: c.winner
    }))
  };
}
export {
  electionStore as e,
  getOrCreateDeviceId as g,
  tallyForPosition as t,
  useElection as u
};
