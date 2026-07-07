import { supabase } from "@/lib/supabase";
import { personneNom } from "@/lib/personne";
import { Plus, Home, ParkingSquare, Vault, Store, Package } from "lucide-react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";

const typeLotConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; filterColor: string }> = {
  APPARTEMENT:      { label: "Appt.",    icon: Home,          color: "text-blue-500 bg-blue-50",   filterColor: "bg-blue-500 text-white border-blue-500" },
  PARKING:          { label: "Parking",  icon: ParkingSquare, color: "text-slate-500 bg-slate-50", filterColor: "bg-slate-500 text-white border-slate-500" },
  CAVE:             { label: "Cave",     icon: Vault,         color: "text-amber-600 bg-amber-50", filterColor: "bg-amber-500 text-white border-amber-500" },
  LOCAL_COMMERCIAL: { label: "Commerce", icon: Store,         color: "text-green-600 bg-green-50", filterColor: "bg-green-600 text-white border-green-600" },
  AUTRE:            { label: "Autre",    icon: Package,       color: "text-gray-500 bg-gray-50",   filterColor: "bg-gray-500 text-white border-gray-500" },
};

export default async function LotsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const filterType = params.type ?? null;
  const filterBat = params.batiment ?? null;
  const filterPorte = params.porte ?? null;
  const filterEtage = params.etage ?? null;

  let query = supabase
    .from("lots")
    .select(`id, numero, type, batiment, porte, tantiemes, etage,
      proprietaire:proprietaire_id(id, type, description, contacts(*)),
      locataire:locataire_id(id, type, description, contacts(*))`)
    .order("batiment", { ascending: true })
    .order("numero", { ascending: true });

  if (filterType) query = query.eq("type", filterType);
  if (filterBat) query = query.eq("batiment", filterBat);
  if (filterPorte) query = query.ilike("porte", filterPorte);
  if (filterEtage !== null) query = query.eq("etage", parseInt(filterEtage));

  const { data: lots = [] } = await query;
  const totalTantiemes = (lots ?? []).reduce((s, l) => s + (l.tantiemes ?? 0), 0);

  const filterGroups = [
    {
      param: "type",
      label: "Type",
      options: Object.entries(typeLotConfig).map(([value, cfg]) => ({
        value,
        label: cfg.label,
        color: cfg.filterColor,
      })),
    },
    {
      param: "batiment",
      label: "Bâtiment",
      options: [
        { value: "A",  label: "Bât. A" },
        { value: "B",  label: "Bât. B" },
        { value: "AB", label: "Bât. AB" },
      ],
    },
    {
      param: "porte",
      label: "Porte",
      options: [
        { value: "droite", label: "Droite" },
        { value: "gauche", label: "Gauche" },
        { value: "face",   label: "Face" },
        { value: "cour",   label: "Cour" },
        { value: "rue",    label: "Rue" },
      ],
    },
    {
      param: "etage",
      label: "Étage",
      options: [
        { value: "0", label: "RDC" },
        { value: "1", label: "1er" },
        { value: "2", label: "2e" },
        { value: "3", label: "3e" },
        { value: "4", label: "4e" },
        { value: "5", label: "5e" },
        { value: "6", label: "6e" },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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

      <FilterBar groups={filterGroups} />

      {!lots?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun lot correspondant.</p>
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
                        ? <Link href={`/personnes/${(l.proprietaire as unknown as {id:string}).id}`} className="hover:underline text-blue-600">{personneNom(l.proprietaire as unknown as { type: string; description: string | null; contacts: { prenom?: string | null; nom?: string | null }[] })}</Link>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {l.locataire
                        ? <Link href={`/personnes/${(l.locataire as unknown as {id:string}).id}`} className="hover:underline text-blue-600">{personneNom(l.locataire as unknown as { type: string; description: string | null; contacts: { prenom?: string | null; nom?: string | null }[] })}</Link>
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
