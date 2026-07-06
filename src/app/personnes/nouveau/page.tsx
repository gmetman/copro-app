"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Categorie } from "@/lib/personne";

type ContactForm = {
  civilite: "" | "M." | "Mme";
  nom: string; prenom: string; telephone: string;
  email: string; adresse: string; code_postal: string; ville: string; pays: string;
};

const emptyContact = (): ContactForm => ({
  civilite: "", nom: "", prenom: "", telephone: "", email: "",
  adresse: "", code_postal: "", ville: "", pays: "France",
});

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function NouvellePersonnePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"physique" | "morale">("physique");
  const [categorie, setCategorie] = useState<Categorie>("RESIDENT");
  const [description, setDescription] = useState("");
  const [contacts, setContacts] = useState<ContactForm[]>([emptyContact()]);

  function updateContact(i: number, field: keyof ContactForm, value: string) {
    setContacts((cs) => cs.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/personnes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type, categorie, description: description || null,
        contacts: contacts.map((c) => ({ ...c, civilite: c.civilite || null })),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/personnes/${data.id}`);
    } else {
      const json = await res.json();
      setError(json.error || "Erreur lors de la création.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouvelle personne</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Informations générales</h2>
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
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Contacts</h2>
            <button
              type="button"
              onClick={() => setContacts((cs) => [...cs, emptyContact()])}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" /> Ajouter un contact
            </button>
          </div>

          {contacts.map((c, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Contact {i + 1}</span>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContacts((cs) => cs.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Civilité</label>
                  <select value={c.civilite} onChange={(e) => updateContact(i, "civilite", e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Prénom</label>
                  <input value={c.prenom} onChange={(e) => updateContact(i, "prenom", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nom</label>
                  <input value={c.nom} onChange={(e) => updateContact(i, "nom", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Téléphone</label>
                  <input type="tel" value={c.telephone} onChange={(e) => updateContact(i, "telephone", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail</label>
                  <input type="email" value={c.email} onChange={(e) => updateContact(i, "email", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Adresse</label>
                <input value={c.adresse} onChange={(e) => updateContact(i, "adresse", e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Code postal</label>
                  <input value={c.code_postal} onChange={(e) => updateContact(i, "code_postal", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ville</label>
                  <input value={c.ville} onChange={(e) => updateContact(i, "ville", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pays</label>
                  <input value={c.pays} onChange={(e) => updateContact(i, "pays", e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
