import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

const statutLabel: Record<string, string> = {
  NOUVEAU: "Nouveau", EN_COURS: "En cours", CLOS: "Clos",
};
const statutColor: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-orange-100 text-orange-700",
  CLOS: "bg-gray-100 text-gray-500",
};
const prioriteColor: Record<string, string> = {
  URGENTE: "bg-red-500", HAUTE: "bg-orange-400", NORMALE: "bg-blue-400", BASSE: "bg-gray-300",
};
const prioriteOrder: Record<string, number> = { URGENTE: 4, HAUTE: 3, NORMALE: 2, BASSE: 1 };

export default async function IncidentsPage() {
  const { data: incidents = [] } = await supabase
    .from("incidents")
    .select("*, commentaires(count), interventions(count)")
    .order("created_at", { ascending: false });

  const sorted = (incidents ?? []).sort(
    (a, b) => (prioriteOrder[b.priorite] ?? 0) - (prioriteOrder[a.priorite] ?? 0)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travaux & Incidents</h1>
          <p className="text-gray-500">{incidents?.length ?? 0} ticket(s)</p>
        </div>
        <Link
          href="/incidents/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Signaler
        </Link>
      </div>

      {(incidents?.length ?? 0) === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun incident signalé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((inc) => {
            const nbCommentaires = inc.commentaires?.[0]?.count ?? 0;
            const nbInterventions = inc.interventions?.[0]?.count ?? 0;
            return (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className={`mt-1.5 h-3 w-3 rounded-full flex-shrink-0 ${prioriteColor[inc.priorite]}`} title={inc.priorite} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">{inc.titre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statutColor[inc.statut] ?? "bg-gray-100 text-gray-500"}`}>
                      {statutLabel[inc.statut] ?? inc.statut}
                    </span>
                    {inc.assurance_declaration && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Assurance
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-1">{inc.description}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                    <span>{inc.categorie?.replace(/_/g, " ")}</span>
                    {inc.localisation && <span>· {inc.localisation}</span>}
                    {nbInterventions > 0 && <span>· {nbInterventions} intervention(s)</span>}
                    {nbCommentaires > 0 && <span>· {nbCommentaires} commentaire(s)</span>}
                    <span>· {formatDate(inc.date_ouverture ?? inc.created_at)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
