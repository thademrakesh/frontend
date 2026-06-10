import axios from "axios";

const API_BASE_URL ="https://guru-anvil-anger.ngrok-free.dev/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem("token");
  const isLoginRequest = config.url?.includes("/auth/login");

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Adding token to request:", config.url);
  } else if (isLoginRequest) {
    console.log("Login request - skipping token");
    // Explicitly remove Authorization header if it somehow got there
    delete config.headers.Authorization;
  }

  // ngrok bypass header
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`API SUCCESS [${response.config.url}]:`, response.data);
    return response;
  },
  (error) => {
    console.error(
      `API ERROR [${error.config?.url}]:`,
      error.response?.status,
      error.response?.data || error.message,
    );
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes("/auth/login")
    ) {
      console.log("Session expired or invalid - logging out");
      if (typeof window !== "undefined") {
        localStorage.clear(); // Clear everything for safety
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};

export const electionApi = {
  getActiveElection: async () => {
    const response = await api.get("/elections/active");
    return response.data;
  },
  startElection: async (id?: string) => {
    if (id) {
      const response = await api.put(`/elections/${id}/start`);
      return response.data;
    } else {
      const response = await api.post(`/elections/start`);
      return response.data;
    }
  },
  stopElection: async (id: string) => {
    const response = await api.put(`/elections/${id}/stop`);
    return response.data;
  },
};

export const candidateApi = {
  getAll: async () => {
    const response = await api.get("/candidates");
    return response.data;
  },
  create: async (candidateData: any) => {
    const response = await api.post("/candidates", candidateData);
    return response.data;
  },
  approve: async (id: string) => {
    const response = await api.put(`/candidates/${id}/approve`);
    return response.data;
  },
  reject: async (id: string, reason: string) => {
    const response = await api.put(`/candidates/${id}/reject`, { reason });
    return response.data;
  },
  terminate: async (id: string, reason: string) => {
    const response = await api.put(`/candidates/${id}/terminate`, { reason });
    return response.data;
  },
};

export const positionApi = {
  getAll: async () => {
    const response = await api.get("/positions");
    return response.data;
  },
};

export const deviceApi = {
  getAll: async () => {
    const response = await api.get("/devices");
    return response.data;
  },
  register: async (deviceId: string, deviceName: string) => {
    const response = await api.post("/devices/register", {
      deviceId,
      deviceName,
    });
    return response.data;
  },
  lockAll: async () => {
    const response = await api.post("/devices/lock-all");
    return response.data;
  },
  unlockAll: async () => {
    const response = await api.post("/devices/unlock-all");
    return response.data;
  },
};

export const voteApi = {
  submit: async (voteData: any) => {
    const response = await api.post("/voting/submit", voteData);
    return response.data;
  },
};

export const accessCodeApi = {
  getLatest: async () => {
    const response = await api.get("/access-codes/latest");
    return response.data;
  },
  generate: async () => {
    const response = await api.post("/access-codes/generate");
    return response.data;
  },
  setManual: async (code: string) => {
    const response = await api.post("/access-codes/manual", { code });
    return response.data;
  },
  toggleProtection: async (active: boolean) => {
    const response = await api.put("/access-codes/toggle", { active });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get("/access-codes/status");
    return response.data;
  },
  verify: async (code: string) => {
    const response = await api.post("/access-codes/verify", { code });
    return response.data;
  },
};

export const resultApi = {
  getResults: async () => {
    const response = await api.get("/results");
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get("/results/analytics");
    return response.data;
  },
};

export default api;
