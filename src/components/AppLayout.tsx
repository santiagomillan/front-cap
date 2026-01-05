import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  FilePlus,
  FileText,
  CheckCircle,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: ("OPERATOR" | "APPROVER" | "OPERADOR" | "APROBADOR")[];
}

const navItems: NavItem[] = [
  {
    label: "Create Transaction",
    path: "/transactions/create",
    icon: FilePlus,
    roles: ["OPERATOR", "OPERADOR"],
  },
  {
    label: "My Transactions",
    path: "/transactions",
    icon: FileText,
    roles: ["OPERATOR", "OPERADOR"],
  },
  {
    label: "Pending Approvals",
    path: "/approvals",
    icon: CheckCircle,
    roles: ["APPROVER", "APROBADOR"],
  },
  {
    label: "All Transactions",
    path: "/transactions",
    icon: FileText,
    roles: ["APPROVER", "APROBADOR"],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground hidden sm:block">
              Transaction Management
            </span>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {user?.role}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Mobile */}
        <aside
          className={cn(
            "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border transform transition-transform duration-300 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
