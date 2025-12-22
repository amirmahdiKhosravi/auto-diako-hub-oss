"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "AI Config", href: "/dashboard/ai-config", icon: Brain },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isMobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const sidebarContent = (
    <>
      {/* Logo/Name */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
          <span className="text-xl font-bold text-white">AD</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Auto Diako Hub</h1>
          <p className="text-xs text-muted-foreground">Dealership Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Logout */}
      <div className="px-4 py-6 border-t border-border">
        {mounted && user && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-accent/50">
            <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border bg-card">
      {sidebarContent}
    </div>
  );
}
