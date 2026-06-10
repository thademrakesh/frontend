import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const API_BASE_URL = "http://localhost:8080/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL
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
    delete config.headers.Authorization;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes("/auth/login")) {
      console.log("Session expired or invalid - logging out");
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
const authApi = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  }
};
const electionApi = {
  getActiveElection: async () => {
    const response = await api.get("/elections/active");
    return response.data;
  },
  startElection: async (id) => {
    if (id) {
      const response = await api.put(`/elections/${id}/start`);
      return response.data;
    } else {
      const response = await api.post(`/elections/start`);
      return response.data;
    }
  },
  stopElection: async (id) => {
    const response = await api.put(`/elections/${id}/stop`);
    return response.data;
  }
};
const candidateApi = {
  getAll: async () => {
    const response = await api.get("/candidates");
    return response.data;
  },
  create: async (candidateData) => {
    const response = await api.post("/candidates", candidateData);
    return response.data;
  },
  approve: async (id) => {
    const response = await api.put(`/candidates/${id}/approve`);
    return response.data;
  },
  reject: async (id, reason) => {
    const response = await api.put(`/candidates/${id}/reject`, { reason });
    return response.data;
  },
  terminate: async (id, reason) => {
    const response = await api.put(`/candidates/${id}/terminate`, { reason });
    return response.data;
  }
};
const positionApi = {
  getAll: async () => {
    const response = await api.get("/positions");
    return response.data;
  }
};
const deviceApi = {
  getAll: async () => {
    const response = await api.get("/devices");
    return response.data;
  },
  register: async (deviceId, deviceName) => {
    const response = await api.post("/devices/register", { deviceId, deviceName });
    return response.data;
  },
  lockAll: async () => {
    const response = await api.post("/devices/lock-all");
    return response.data;
  },
  unlockAll: async () => {
    const response = await api.post("/devices/unlock-all");
    return response.data;
  }
};
const voteApi = {
  submit: async (voteData) => {
    const response = await api.post("/voting/submit", voteData);
    return response.data;
  }
};
const accessCodeApi = {
  getLatest: async () => {
    const response = await api.get("/access-codes/latest");
    return response.data;
  },
  generate: async () => {
    const response = await api.post("/access-codes/generate");
    return response.data;
  },
  setManual: async (code) => {
    const response = await api.post("/access-codes/manual", { code });
    return response.data;
  },
  toggleProtection: async (active) => {
    const response = await api.put("/access-codes/toggle", { active });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get("/access-codes/status");
    return response.data;
  },
  verify: async (code) => {
    const response = await api.post("/access-codes/verify", { code });
    return response.data;
  }
};
const resultApi = {
  getResults: async () => {
    const response = await api.get("/results");
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get("/results/analytics");
    return response.data;
  }
};
export {
  Button as B,
  accessCodeApi as a,
  authApi as b,
  cn as c,
  deviceApi as d,
  electionApi as e,
  candidateApi as f,
  positionApi as p,
  resultApi as r,
  voteApi as v
};
