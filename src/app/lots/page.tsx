import { supabase } from "@/lib/supabase";
import { personneNom } from "@/lib/personne";
import { Plus, Home, ParkingSquare, Vault, Store, Package } from "lucide-react";
import Link from "next/link";

const typeLotConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  APPARTEMENT:      { label: "Appt.",       icon: Home,          color: "text-blue-500 bg-blue-50" },
  PARKING:          { label: "Parking",     icon: ParkingSquare, color: "text-slate-500 bg-slate-50" },
  CAVE:             { label: "Cave",        icon: Vault,         color: "text-amber-600 bg-amber-50" },
  LOCAL_COMMERCIAL: { label: "Commerce",    icon: Store,         color: "text-green-600 bg-green-50" },
  AUTRE:            { label: "Autre",       icon: Package,       color: "text-gray-500 bg-gray-50" },
};

export default async function LotsPage() {
  const { data: lots = [] } = await supabase
    .from("lots")
    .select(`
      id, numero, type, batiment, porte, tantiemes, etage,
      proprietaire:proprietaire_id(id, type, description, contacts(*)),
      locataire:locataire_id(id, type, description, contacts(*))
    `)
    .order("batiment", { ascending: true })
    .order("numero", { ascending: true });

  const totalTantiemes = (lots ?? []).reduce((s, l) => s + (l.tantiemes ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lots</h1>
          <p className="text-gray-500">{lots?.length ?? 0} lot(s) · {totalTantiemes} tantièmes</p>
        </div>
        <Link
          href="/lots/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {!lots?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun lot enregistré.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Lot</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Bât.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Porte</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Propriétaire</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Locataire</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Tantièmes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lots.map((l) => {
                const cfg = typeLotConfig[l.type] ?? typeLotConfig.AUTRE;
                const Icon = cfg.icon;
                return (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/lots/${l.id}`} className="font-semibold text-blue-600 hover:underline">
                        {l.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{l.batiment ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.porte ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {l.proprietaire
                        ? <Link href={`/personnes/${(l.proprietaire as {id:string}).id}`} className="hover:underline text-blue-600">{personneNom(l.proprietaire as Parameters<typeof personneNom>[0])}</Link>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {l.locataire
                        ? <Link href={`/personnes/${(l.locataire as {id:string}).id}`} className="hover:underline text-blue-600">{personneNom(l.locataire as Parameters<typeof personneNom>[0])}</Link>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{l.tantiemes ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
