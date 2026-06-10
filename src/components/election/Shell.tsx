import { Link, useLocation, useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useElection } from "@/lib/election-store";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string };

export function AdminShell({
  children,
  nav,
  role,
}: {
  children: ReactNode;
  nav: NavItem[];
  role: "Staff" | "Administration";
}) {
  const status = useElection((s) => s.status);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all auth data
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded bg-foreground">
                <div className="size-3 border-2 border-background" />
              </div>
              <span className="text-xl font-extrabold uppercase tracking-tighter">
                Gentanjali school voting
              </span>
            </Link>
            <div className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      active
                        ? "border-b-2 border-primary py-1 text-foreground"
                        : "py-1 transition-colors hover:text-foreground"
                    }
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill status={status} />
            <span className="hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:inline">
              {role}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="size-4" />
            </Button>
            <div className="size-8 rounded-full border border-border bg-secondary" />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>Gentanjali school voting</span>
          <span>All votes validated via secure transaction</span>
        </div>
      </footer>
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "draft" | "active" | "closed";
}) {
  const map = {
    active: {
      dot: "bg-success",
      bg: "bg-success/10 text-success",
      label: "Election Active",
    },
    closed: {
      dot: "bg-accent",
      bg: "bg-accent/10 text-accent",
      label: "Election Closed",
    },
    draft: {
      dot: "bg-muted-foreground",
      bg: "bg-secondary text-muted-foreground",
      label: "Draft",
    },
  } as const;
  const v = map[status];
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${v.bg}`}
    >
      <span className={`size-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      </div>
      {right}
    </div>
  );
}
