"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

type Option = { id: string; label: string };
type Lot = Record<string, unknown>;

export default function LotEditForm({ lot, personneOptions, lotOptions }: {
  lot: Lot; personneOptions: Option[]; lotOptions: Option[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
    const data = {
      numero: get("numero"),
      type: get("type"),
      batiment: get("batiment") || null,
      porte: get("porte") || null,
      etage: get("etage") ? parseInt(get("etage")) : null,
      superficie: get("superficie") ? parseFloat(get("superficie")) : null,
      tantiemes: parseInt(get("tantiemes")) || 0,
      lot_principal_id: get("lot_principal_id") || null,
      proprietaire_id: get("proprietaire_id") || null,
      mandataire_id: get("mandataire_id") || null,
      locataire_id: get("locataire_id") || null,
    };
    const res = await fetch(`/api/lots/${lot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/lots/${lot.id}`);
      router.refresh();
    } else {
      setError("Erreur lors de la mise à jour.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement le lot ${lot.numero} ?`)) return;
    setDeleting(true);
    await fetch(`/api/lots/${lot.id}`, { method: "DELETE" });
    router.push("/lots");
    router.refresh();
  }

  const selectOpt = (name: string, label: string, options: Option[], currentId?: string | null) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select name={name} defaultValue={currentId ?? ""} className={inputCls}>
        <option value="">— Aucun —</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Numéro *</label>
          <input name="numero" required defaultValue={lot.numero as string} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Type *</label>
          <select name="type" required defaultValue={lot.type as string} className={inputCls}>
            <option value="APPARTEMENT">Appartement</option>
            <option value="PARKING">Parking</option>
            <option value="CAVE">Cave</option>
            <option value="LOCAL_COMMERCIAL">Local commercial</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Bâtiment</label>
          <select name="batiment" defaultValue={(lot.batiment as string) ?? ""} className={inputCls}>
            <option value="">— Aucun —</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Porte</label>
          <select name="porte" defaultValue={(lot.porte as string) ?? ""} className={inputCls}>
            <option value="">— Aucune —</option>
            <option value="droite">Droite</option>
            <option value="gauche">Gauche</option>
            <option value="face">Face</option>
            <option value="cour">Cour</option>
            <option value="rue">Rue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Étage</label>
          <input name="etage" type="number" defaultValue={(lot.etage as number) ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Superficie (m²)</label>
          <input name="superficie" type="number" step="0.01" defaultValue={(lot.superficie as number) ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Tantièmes *</label>
          <input name="tantiemes" type="number" required defaultValue={(lot.tantiemes as number) ?? 0} className={inputCls} />
        </div>
      </div>

      {selectOpt("lot_principal_id", "Lot principal", lotOptions, lot.lot_principal_id as string)}

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personnes associées</p>

      {selectOpt("proprietaire_id", "Propriétaire", personneOptions, lot.proprietaire_id as string)}
      {selectOpt("mandataire_id", "Mandataire", personneOptions, lot.mandataire_id as string)}
      {selectOpt("locataire_id", "Locataire", personneOptions, lot.locataire_id as string)}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Suppression…" : "Supprimer ce lot"}
        </button>
      </div>
    </form>
  );
}
