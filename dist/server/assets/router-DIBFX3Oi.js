import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const appCss = "/assets/styles-CNRpUHzS.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$7 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$7.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter$5 = () => import("./vote-55hnNAM6.js");
const Route$6 = createFileRoute("/vote")({
  head: () => ({
    meta: [{
      title: "Voting Portal — Gentanjali school voting"
    }, {
      name: "description",
      content: "Cast your vote in the school election."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./staff-CBhA5_3f.js");
const Route$5 = createFileRoute("/staff")({
  beforeLoad: ({
    location
  }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "STAFF" && role !== "ADMIN") {
        console.warn("STAFF ACCESS DENIED: Redirecting to login", {
          hasToken: !!token,
          role
        });
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href
          }
        });
      }
    }
  },
  head: () => ({
    meta: [{
      title: "Staff Portal — Gentanjali school voting"
    }, {
      name: "description",
      content: "Register candidates for school elections."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./login-CdnuxVuO.js");
const Route$4 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin-kof7kGvD.js");
const Route$3 = createFileRoute("/admin")({
  beforeLoad: ({
    location
  }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "ADMIN") {
        console.warn("ADMIN ACCESS DENIED: Redirecting to login", {
          hasToken: !!token,
          role
        });
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href
          }
        });
      }
    }
  },
  head: () => ({
    meta: [{
      title: "Administration — Gentanjali school voting"
    }, {
      name: "description",
      content: "Election control panel and candidate verification."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const Route$2 = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/vote" });
  }
});
const $$splitComponentImporter$1 = () => import("./admin.results-V3p6ZMty.js");
const Route$1 = createFileRoute("/admin/results")({
  beforeLoad: ({
    location
  }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "ADMIN") {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href
          }
        });
      }
    }
  },
  head: () => ({
    meta: [{
      title: "Results — Gentanjali school voting"
    }, {
      name: "description",
      content: "Election results dashboard."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./admin.devices-B492R-w3.js");
const Route = createFileRoute("/admin/devices")({
  beforeLoad: ({
    location
  }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "ADMIN") {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href
          }
        });
      }
    }
  },
  head: () => ({
    meta: [{
      title: "Devices — Gentanjali school voting"
    }, {
      name: "description",
      content: "Voting kiosk monitoring."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const VoteRoute = Route$6.update({
  id: "/vote",
  path: "/vote",
  getParentRoute: () => Route$7
});
const StaffRoute = Route$5.update({
  id: "/staff",
  path: "/staff",
  getParentRoute: () => Route$7
});
const LoginRoute = Route$4.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$7
});
const AdminRoute = Route$3.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$7
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const AdminResultsRoute = Route$1.update({
  id: "/results",
  path: "/results",
  getParentRoute: () => AdminRoute
});
const AdminDevicesRoute = Route.update({
  id: "/devices",
  path: "/devices",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminDevicesRoute,
  AdminResultsRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  LoginRoute,
  StaffRoute,
  VoteRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
