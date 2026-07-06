"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

type Option = { id: string; label: string };

export default function LotForm({ residentOptions, lotOptions }: { residentOptions: Option[]; lotOptions: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    const res = await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      router.push(`/lots/${json.id}`);
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la création.");
      setLoading(false);
    }
  }

  const selectOpt = (name: string, label: string, options: Option[]) => (
    <div>
      <label className={labelCls}>{label}</label>
      <select name={name} className={inputCls}>
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
          <input name="numero" required className={inputCls} placeholder="Ex: 12" />
        </div>
        <div>
          <label className={labelCls}>Type *</label>
          <select name="type" required className={inputCls}>
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
          <select name="batiment" className={inputCls}>
            <option value="">— Aucun —</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Porte</label>
          <select name="porte" className={inputCls}>
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
          <input name="etage" type="number" className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Superficie (m²)</label>
          <input name="superficie" type="number" step="0.01" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Tantièmes *</label>
          <input name="tantiemes" type="number" required defaultValue={0} className={inputCls} />
        </div>
      </div>

      {selectOpt("lot_principal_id", "Lot principal", lotOptions)}

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personnes associées</p>

      {selectOpt("proprietaire_id", "Propriétaire", residentOptions)}
      {selectOpt("mandataire_id", "Mandataire", residentOptions)}
      {selectOpt("locataire_id", "Locataire", residentOptions)}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
