"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, Wrench, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Tableau de bord", icon: Building2 },
  { href: "/personnes", label: "Personnes", icon: Users },
  { href: "/lots", label: "Lots", icon: KeyRound },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/incidents", label: "Travaux & Incidents", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-gray-900 leading-tight">
            Mon Syndicat
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Conseil syndical</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
