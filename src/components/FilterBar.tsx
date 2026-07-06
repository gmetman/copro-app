"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type FilterOption = { value: string; label: string; color?: string };
type FilterGroup = { param: string; label: string; options: FilterOption[] };

export function FilterBar({ groups }: { groups: FilterGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle(param: string, value: string) {
    const current = searchParams.get(param);
    const params = new URLSearchParams(searchParams.toString());
    if (current === value) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasAny = groups.some((g) => searchParams.get(g.param));

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {groups.map((g) => (
        <div key={g.param} className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">{g.label} :</span>
          {g.options.map((opt) => {
            const active = searchParams.get(g.param) === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => toggle(g.param, opt.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                  active
                    ? (opt.color ?? "bg-blue-600 text-white border-blue-600")
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ))}
      {hasAny && (
        <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
          Réinitialiser
        </button>
      )}
    </div>
  );
}
