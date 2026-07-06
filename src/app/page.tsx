import { supabase } from "@/lib/supabase";
import { Users, FileText, Wrench, AlertTriangle, KeyRound } from "lucide-react";
import Link from "next/link";


async function getStats() {
  const [
    { count: personnes },
    { count: lots },
    { count: documents },
    { count: incidents },
    { count: urgents },
  ] = await Promise.all([
    supabase.from("personnes").select("*", { count: "exact", head: true }),
    supabase.from("lots").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("incidents").select("*", { count: "exact", head: true }).neq("statut", "CLOS"),
    supabase.from("incidents").select("*", { count: "exact", head: true }).neq("statut", "CLOS").eq("priorite", "URGENTE"),
  ]);
  return {
    personnes: personnes ?? 0,
    lots: lots ?? 0,
    documents: documents ?? 0,
    incidents: incidents ?? 0,
    urgents: urgents ?? 0,
  };
}

export default async function Home() {
  const stats = await getStats();

  const cards = [
    {
      label: "Personnes",
      value: stats.personnes,
      sub: "copropriétaires & locataires",
      icon: Users,
      href: "/personnes",
      color: "blue",
    },
    {
      label: "Lots",
      value: stats.lots,
      sub: "appartements, caves & commerces",
      icon: KeyRound,
      href: "/lots",
      color: "indigo",
    },
    {
      label: "Documents",
      value: stats.documents,
      sub: "fichiers",
      icon: FileText,
      href: "/documents",
      color: "green",
    },
    {
      label: "Incidents ouverts",
      value: stats.incidents,
      sub: stats.urgents > 0 ? `dont ${stats.urgents} urgent(s)` : "en cours",
      icon: stats.urgents > 0 ? AlertTriangle : Wrench,
      href: "/incidents",
      color: stats.urgents > 0 ? "red" : "orange",
    },
  ];

  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50   text-blue-700   border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green:  "bg-green-50  text-green-700  border-green-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    red:    "bg-red-50    text-red-700    border-red-100",
  };
  const iconColorMap: Record<string, string> = {
    blue:   "text-blue-500",
    indigo: "text-indigo-500",
    green:  "text-green-500",
    orange: "text-orange-500",
    red:    "text-red-500",
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-52 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/20_boulevard_du_Montparnasse,_Paris_15e_2.jpg/1280px-20_boulevard_du_Montparnasse,_Paris_15e_2.jpg"
          alt="20 boulevard du Montparnasse"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-2xl font-bold text-white">20 boulevard du Montparnasse</h1>
          <p className="text-white/80 text-sm mt-0.5">Paris 15e · Copropriété {stats.lots} lots</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${colorMap[color]}`}
          >
            <Icon className={`h-6 w-6 ${iconColorMap[color]}`} />
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs opacity-70 mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
