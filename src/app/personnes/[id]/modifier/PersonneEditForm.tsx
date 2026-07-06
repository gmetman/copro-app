"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Personne, Categorie } from "@/lib/personne";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function PersonneEditForm({ personne }: { personne: Personne }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"physique" | "morale">(personne.type);
  const [categorie, setCategorie] = useState<Categorie>(personne.categorie ?? "RESIDENT");
  const [description, setDescription] = useState(personne.description ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/personnes/${personne.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, categorie, description: description || null }),
    });
    if (res.ok) {
      router.push(`/personnes/${personne.id}`);
      router.refresh();
    } else {
      setError("Erreur lors de la mise à jour.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette personne et tous ses contacts ?")) return;
    setDeleting(true);
    await fetch(`/api/personnes/${personne.id}`, { method: "DELETE" });
    router.push("/personnes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <label className={labelCls}>Catégorie *</label>
        <div className="flex gap-3">
          {(["RESIDENT", "FOURNISSEUR"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategorie(cat)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                categorie === cat ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat === "RESIDENT" ? "Propriétaires & Résidents" : "Fournisseur"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Type *</label>
        <div className="flex gap-3">
          {(["physique", "morale"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                type === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "physique" ? "Personne physique" : "Personne morale"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>{type === "morale" ? "Raison sociale *" : "Description / Notes"}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required={type === "morale"}
          rows={2}
          className={inputCls}
          placeholder={type === "morale" ? "Nom de la société" : "Notes optionnelles…"}
        />
      </div>

      <p className="text-xs text-gray-400">Pour modifier les contacts, rendez-vous sur la fiche de la personne.</p>

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
          {deleting ? "Suppression…" : "Supprimer cette personne"}
        </button>
      </div>
    </form>
  );
}
