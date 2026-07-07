"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export function SortableHeader({
  col, label, align = "left",
}: { col: string; label: string; align?: "left" | "right" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCol = searchParams.get("sort");
  const currentDir = searchParams.get("dir") ?? "asc";
  const active = currentCol === col;
  const nextDir = active && currentDir === "asc" ? "desc" : "asc";

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", col);
    params.set("dir", nextDir);
    router.push(`${pathname}?${params.toString()}`);
  }

  const Icon = active ? (currentDir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <th className={`px-4 py-3 font-medium text-gray-500 text-${align}`}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? "text-blue-500" : "text-gray-300"}`} />
      </button>
    </th>
  );
}
