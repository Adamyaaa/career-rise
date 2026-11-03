"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "../nav-config";
import { useResourcesStore } from "@/features/resources";

export function Sidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { open: openResources, isOpen: isResourcesOpen } = useResourcesStore();

  useEffect(() => {
    const saved = localStorage.getItem("career_rise_app_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("career_rise_app_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isStudentArea = pathname.startsWith("/student");

  return (
    <aside
      className={cn(
        "sticky top-14 hidden md:flex h-[calc(100vh-3.5rem)] shrink-0 flex-col gap-1 border-r border-border/60 bg-background p-3 transition-all duration-300 ease-in-out",
        collapsed ? "w-16 items-center" : "w-56",
      )}
    >
      <div className="flex flex-1 flex-col gap-1 w-full">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Resources Side Panel Action for Students */}
        {isStudentArea && (
          <button
            type="button"
            onClick={() => openResources()}
            title={collapsed ? "Technical Notes & Resources" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer mt-1",
              collapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "",
              isResourcesOpen ? "bg-primary/10 text-primary font-semibold" : "",
            )}
          >
            <FolderOpen className="size-4 shrink-0 text-primary" />
            {!collapsed && (
              <div className="flex items-center justify-between flex-1 truncate">
                <span className="truncate">Resources</span>
                <span className="text-[10px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-md">
                  Notes
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Collapse / Expand Toggle Button at Bottom */}
      <div className="pt-2 border-t border-border/60 w-full flex justify-center">
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-4 shrink-0" />
              <span className="truncate">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
