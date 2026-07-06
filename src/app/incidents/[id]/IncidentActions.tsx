"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { personneNom } from "@/lib/personne";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const STATUTS = ["NOUVEAU", "EN_COURS", "CLOS"] as const;
const statutLabel: Record<string, string> = { NOUVEAU: "Nouveau", EN_COURS: "En cours", CLOS: "Clos" };

const TYPE_INTERVENTION = [
  { value: "DIAGNOSTIC", label: "Diagnostic" },
  { value: "REPARATION_CAUSES", label: "Réparation des causes" },
  { value: "REPARATION_CONSEQUENCES", label: "Réparation des conséquences" },
];

type PersonneBrief = {
  id: string; type: string; description: string | null;
  contacts: { prenom: string | null; nom: string | null }[];
};

type Intervention = {
  id: string;
  type_intervention: string;
  notes: string | null;
  created_at: string;
  prestataire: PersonneBrief | null;
};

type Incident = {
  id: string;
  statut: string;
  assurance_declaration: boolean;
  assurance_compagnie: string | null;
  assurance_date_declaration: string | null;
  assurance_montant: number | null;
  assurance_date_paiement: string | null;
  interventions: Intervention[];
  [key: string]: unknown;
};

export function IncidentActions({ incident, personnes }: { incident: Incident; personnes: PersonneBrief[] }) {
  const router = useRouter();
  const [statut, setStatut] = useState(incident.statut);
  const [loading, setLoading] = useState(false);

  // Assurance
  const [assurance, setAssurance] = useState(incident.assurance_declaration);
  const [assuranceOpen, setAssuranceOpen] = useState(incident.assurance_declaration);
  const [assCompagnie, setAssCompagnie] = useState(incident.assurance_compagnie ?? "");
  const [assDateDecl, setAssDateDecl] = useState(incident.assurance_date_declaration ?? "");
  const [assMontant, setAssMontant] = useState(incident.assurance_montant?.toString() ?? "");
  const [assDatePaiement, setAssDatePaiement] = useState(incident.assurance_date_paiement ?? "");
  const [savingAss, setSavingAss] = useState(false);

  // Interventions
  const [interventions, setInterventions] = useState<Intervention[]>(incident.interventions ?? []);
  const [addingIntervention, setAddingIntervention] = useState(false);
  const [newPrestataireId, setNewPrestataireId] = useState("");
  const [newTypeIntervention, setNewTypeIntervention] = useState("DIAGNOSTIC");
  const [newNotes, setNewNotes] = useState("");
  const [savingIntervention, setSavingIntervention] = useState(false);

  // Commentaires
  const [auteur, setAuteur] = useState("");
  const [contenu, setContenu] = useState("");

  async function updateStatut(newStatut: string) {
    setLoading(true);
    await fetch(`/api/incidents/${incident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });
    setStatut(newStatut);
    setLoading(false);
    router.refresh();
  }

  async function toggleAssurance() {
    const val = !assurance;
    setAssurance(val);
    setAssuranceOpen(val);
    await fetch(`/api/incidents/${incident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assurance_declaration: val }),
    });
    router.refresh();
  }

  async function saveAssurance() {
    setSavingAss(true);
    await fetch(`/api/incidents/${incident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assurance_compagnie: assCompagnie || null,
        assurance_date_declaration: assDateDecl || null,
        assurance_montant: assMontant ? parseFloat(assMontant) : null,
        assurance_date_paiement: assDatePaiement || null,
      }),
    });
    setSavingAss(false);
    router.refresh();
  }

  async function addIntervention() {
    setSavingIntervention(true);
    const res = await fetch("/api/interventions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incident_id: incident.id,
        prestataire_id: newPrestataireId || null,
        type_intervention: newTypeIntervention,
        notes: newNotes || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setInterventions((prev) => [...prev, data]);
      setNewPrestataireId("");
      setNewTypeIntervention("DIAGNOSTIC");
      setNewNotes("");
      setAddingIntervention(false);
      router.refresh();
    }
    setSavingIntervention(false);
  }

  async function deleteIntervention(id: string) {
    await fetch(`/api/interventions/${id}`, { method: "DELETE" });
    setInterventions((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim() || !auteur.trim()) return;
    setLoading(true);
    await fetch(`/api/incidents/${incident.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu, auteur }),
    });
    setContenu("");
    setLoading(false);
    router.refresh();
  }

  const typeInterventionLabel: Record<string, string> = {
    DIAGNOSTIC: "Diagnostic",
    REPARATION_CAUSES: "Réparation des causes",
    REPARATION_CONSEQUENCES: "Réparation des conséquences",
  };

  return (
    <div className="space-y-4">
      {/* Statut */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Statut</p>
        <div className="flex gap-2">
          {STATUTS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatut(s)}
              disabled={loading || s === statut}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                s === statut
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              {statutLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Assurance */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">Déclaration assurance</p>
          </div>
          <div className="flex items-center gap-2">
            {assurance && (
              <button onClick={() => setAssuranceOpen((o) => !o)} className="text-gray-400 hover:text-gray-600">
                {assuranceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={toggleAssurance}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${assurance ? "bg-purple-600" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${assurance ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {assurance && assuranceOpen && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Compagnie</label>
                <input value={assCompagnie} onChange={(e) => setAssCompagnie(e.target.value)} className={inputCls} placeholder="Ex: AXA, Groupama…" />
              </div>
              <div>
                <label className={labelCls}>Date de déclaration</label>
                <input type="date" value={assDateDecl} onChange={(e) => setAssDateDecl(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Montant pris en charge (€)</label>
                <input type="number" step="0.01" value={assMontant} onChange={(e) => setAssMontant(e.target.value)} className={inputCls} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Date de paiement</label>
                <input type="date" value={assDatePaiement} onChange={(e) => setAssDatePaiement(e.target.value)} className={inputCls} />
              </div>
            </div>
            <button
              onClick={saveAssurance}
              disabled={savingAss}
              className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {savingAss ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {/* Interventions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Interventions ({interventions.length})</p>
          {!addingIntervention && (
            <button onClick={() => setAddingIntervention(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          )}
        </div>

        <div className="space-y-2">
          {interventions.map((intv) => (
            <div key={intv.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {typeInterventionLabel[intv.type_intervention] ?? intv.type_intervention}
                </p>
                {intv.prestataire && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {personneNom(intv.prestataire as { type: string; description: string | null; contacts: { prenom?: string | null; nom?: string | null }[] })}
                  </p>
                )}
                {intv.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{intv.notes}</p>}
              </div>
              <button onClick={() => deleteIntervention(intv.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-3">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {interventions.length === 0 && !addingIntervention && (
            <p className="text-sm text-gray-400 text-center py-2">Aucune intervention.</p>
          )}

          {addingIntervention && (
            <div className="border border-blue-200 rounded-lg p-3 space-y-3 bg-blue-50">
              <div>
                <label className={labelCls}>Type d&apos;intervention</label>
                <select value={newTypeIntervention} onChange={(e) => setNewTypeIntervention(e.target.value)} className={inputCls}>
                  {TYPE_INTERVENTION.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Prestataire</label>
                <select value={newPrestataireId} onChange={(e) => setNewPrestataireId(e.target.value)} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {personnes.map((p) => (
                    <option key={p.id} value={p.id}>{personneNom(p as { type: string; description: string | null; contacts: { prenom?: string | null; nom?: string | null }[] })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} className={inputCls} placeholder="Notes optionnelles…" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingIntervention(false)} className="flex-1 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-white">
                  Annuler
                </button>
                <button onClick={addIntervention} disabled={savingIntervention} className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {savingIntervention ? "Ajout…" : "Ajouter"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Commentaire */}
      <form onSubmit={addComment} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Ajouter un commentaire</p>
        <input value={auteur} onChange={(e) => setAuteur(e.target.value)} placeholder="Votre nom" className={inputCls} />
        <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} placeholder="Votre commentaire…" rows={3} className={inputCls} />
        <button
          type="submit"
          disabled={loading || !contenu.trim() || !auteur.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Publier"}
        </button>
      </form>
    </div>
  );
}
