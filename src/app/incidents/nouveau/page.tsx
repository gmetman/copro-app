"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "PARTIES_COMMUNES", "ASCENSEUR", "TOITURE", "PLOMBERIE",
  "ELECTRICITE", "ESPACES_VERTS", "SECURITE", "AUTRE",
];
const categorieLabel: Record<string, string> = {
  PARTIES_COMMUNES: "Parties communes", ASCENSEUR: "Ascenseur",
  TOITURE: "Toiture", PLOMBERIE: "Plomberie", ELECTRICITE: "Électricité",
  ESPACES_VERTS: "Espaces verts", SECURITE: "Sécurité", AUTRE: "Autre",
};

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NouvelIncidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateOuverture, setDateOuverture] = useState(today());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    const data = {
      titre: get("titre"),
      description: get("description"),
      categorie: get("categorie"),
      priorite: get("priorite"),
      localisation: get("localisation") || null,
      date_ouverture: dateOuverture,
      statut: "NOUVEAU",
    };
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      router.push(`/incidents/${json.id}`);
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la création.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Signaler un incident</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className={labelCls}>Titre *</label>
          <input name="titre" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea name="description" required rows={3} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Catégorie *</label>
            <select name="categorie" required className={inputCls}>
              {categories.map((c) => <option key={c} value={c}>{categorieLabel[c]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Priorité *</label>
            <select name="priorite" defaultValue="NORMALE" className={inputCls}>
              <option value="BASSE">Basse</option>
              <option value="NORMALE">Normale</option>
              <option value="HAUTE">Haute</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Localisation</label>
            <input name="localisation" placeholder="Ex: Cage A, 3e étage" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date d&apos;ouverture</label>
            <input
              type="date"
              value={dateOuverture}
              onChange={(e) => setDateOuverture(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Enregistrement…" : "Signaler"}
          </button>
        </div>
      </form>
    </div>
  );
}
