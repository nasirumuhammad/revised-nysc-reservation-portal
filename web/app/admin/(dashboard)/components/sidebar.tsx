"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GraduationCap, Users, Building2 } from "lucide-react";
import { AdminProfile } from "./admin-profile";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Role } from "@/types/role";

const navItems = [
  {
    href: "/admin/students",
    label: "Students",
    icon: GraduationCap,
    adminOnly: false,
  },
  { href: "/admin/staff", label: "Staff", icon: Users, adminOnly: true },
  {
    href: "/admin/departments",
    label: "Departments",
    icon: Building2,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useCurrentRole();
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || role === Role.SUPER_ADMIN,
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <Image
          src="/abu-logo.png"
          alt="ABU logo"
          height={40}
          width={40}
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            NYSC Mobilization
          </p>
          <h1 className="truncate text-sm font-semibold leading-tight text-foreground">
            Verification Portal
          </h1>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {visibleNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <AdminProfile />
    </aside>
  );
}
