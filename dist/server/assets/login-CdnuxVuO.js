import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, EyeOff, Eye } from "lucide-react";
import { c as cn, B as Button, b as authApi } from "./api-CgB5BbtB.js";
import { L as Label, I as Input } from "./label-cpSE3KQn.js";
import { T as Toaster } from "./sonner-DeNSN9-c.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "axios";
import "@radix-ui/react-label";
const Card = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.login({
        username: email.trim(),
        password: password.trim()
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      toast.success("Login successful");
      if (data.role === "ADMIN") {
        navigate({
          to: "/admin"
        });
      } else if (data.role === "STAFF") {
        navigate({
          to: "/staff"
        });
      } else {
        navigate({
          to: "/vote"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.error || error.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: [
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md border-border bg-card", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Lock, { className: "size-6" }) }) }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-center font-bold tracking-tight", children: "Portal Login" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: "Enter your credentials to access the management portal" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, children: [
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-3 size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", placeholder: "admin@gmail.com", className: "pl-10", value: email, onChange: (e) => setEmail(e.target.value), required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "password", type: showPassword ? "text" : "password", className: "pl-10 pr-10", value: password, onChange: (e) => setPassword(e.target.value), required: true }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "absolute right-3 top-3 size-4 text-muted-foreground hover:text-foreground focus:outline-none", onClick: () => setShowPassword(!showPassword), children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Logging in..." : "Login" }) })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
