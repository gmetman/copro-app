"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["PV_AG", "CONTRAT", "REGLEMENT", "DEVIS", "FACTURE", "ASSURANCE", "AUTRE"];
const categorieLabel: Record<string, string> = {
  PV_AG: "PV d'AG", CONTRAT: "Contrat", REGLEMENT: "Règlement",
  DEVIS: "Devis", FACTURE: "Facture", ASSURANCE: "Assurance", AUTRE: "Autre",
};

export default function NouveauDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    const data = {
      titre: get("titre"),
      categorie: get("categorie"),
      description: get("description") || null,
      fileUrl: get("fileUrl"),
      filename: get("filename") || get("fileUrl").split("/").pop() || "document",
    };
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/documents");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la création.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ajouter un document</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input name="titre" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
          <select name="categorie" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map((c) => <option key={c} value={c}>{categorieLabel[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL du fichier *</label>
          <input name="fileUrl" type="url" required placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">Lien Supabase Storage, Google Drive, etc.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
          <input name="filename" placeholder="PV_AG_2024.pdf" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Enregistrement…" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}
