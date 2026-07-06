import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { IncidentActions } from "./IncidentActions";

const statutLabel: Record<string, string> = {
  NOUVEAU: "Nouveau", EN_COURS: "En cours", CLOS: "Clos",
};
const statutColor: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-orange-100 text-orange-700",
  CLOS: "bg-gray-100 text-gray-500",
};
const prioriteLabel: Record<string, string> = {
  BASSE: "Basse", NORMALE: "Normale", HAUTE: "Haute", URGENTE: "Urgente",
};

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: incident }, { data: personnes }] = await Promise.all([
    supabase
      .from("incidents")
      .select("*, commentaires(*), interventions(*, prestataire:prestataire_id(id, type, description, contacts(*)))")
      .eq("id", id)
      .single(),
    supabase
      .from("personnes")
      .select("id, type, description, contacts(prenom, nom)")
      .eq("categorie", "FOURNISSEUR")
      .order("created_at"),
  ]);

  if (!incident) notFound();

  const commentaires = (incident.commentaires ?? []).sort(
    (a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{incident.titre}</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${statutColor[incident.statut] ?? "bg-gray-100 text-gray-500"}`}>
            {statutLabel[incident.statut] ?? incident.statut}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
          <span>{incident.categorie?.replace(/_/g, " ")}</span>
          <span>·</span>
          <span>Priorité : {prioriteLabel[incident.priorite]}</span>
          {incident.localisation && <><span>·</span><span>{incident.localisation}</span></>}
          <span>·</span>
          <span>Ouvert le {formatDate(incident.date_ouverture ?? incident.created_at)}</span>
          {incident.date_cloture && <><span>·</span><span className="text-gray-400">Clos le {formatDate(incident.date_cloture)}</span></>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
      </div>

      <IncidentActions
        incident={incident}
        personnes={personnes ?? []}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Commentaires ({commentaires.length})
        </h2>
        <div className="space-y-3">
          {commentaires.map((c: { id: string; auteur: string; created_at: string; contenu: string }) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 text-sm">{c.auteur}</span>
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
