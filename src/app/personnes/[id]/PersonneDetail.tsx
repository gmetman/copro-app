"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { contactNom, type Personne, type Contact } from "@/lib/personne";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

type Lot = { id: string; numero: string; type: string; batiment: string | null };

type ContactForm = {
  civilite: "" | "M." | "Mme";
  nom: string; prenom: string; telephone: string; email: string;
  adresse: string; code_postal: string; ville: string; pays: string;
};

function emptyForm(c?: Contact): ContactForm {
  return {
    civilite: (c?.civilite ?? "") as ContactForm["civilite"],
    nom: c?.nom ?? "", prenom: c?.prenom ?? "", telephone: c?.telephone ?? "",
    email: c?.email ?? "", adresse: c?.adresse ?? "", code_postal: c?.code_postal ?? "",
    ville: c?.ville ?? "", pays: c?.pays ?? "France",
  };
}

function ContactFormFields({ form, onChange }: { form: ContactForm; onChange: (f: ContactForm) => void }) {
  const set = (k: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [k]: e.target.value });
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Civilité</label>
          <select value={form.civilite} onChange={set("civilite")} className={inputCls}>
            <option value="">—</option>
            <option value="M.">M.</option>
            <option value="Mme">Mme</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Prénom</label>
          <input value={form.prenom} onChange={set("prenom")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Nom</label>
          <input value={form.nom} onChange={set("nom")} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Téléphone</label><input type="tel" value={form.telephone} onChange={set("telephone")} className={inputCls} /></div>
        <div><label className={labelCls}>E-mail</label><input type="email" value={form.email} onChange={set("email")} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Adresse</label><input value={form.adresse} onChange={set("adresse")} className={inputCls} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={labelCls}>CP</label><input value={form.code_postal} onChange={set("code_postal")} className={inputCls} /></div>
        <div><label className={labelCls}>Ville</label><input value={form.ville} onChange={set("ville")} className={inputCls} /></div>
        <div><label className={labelCls}>Pays</label><input value={form.pays} onChange={set("pays")} className={inputCls} /></div>
      </div>
    </>
  );
}

export default function PersonneDetail({ personne, lots }: { personne: Personne; lots: Lot[] }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(personne.contacts ?? []);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContactForm>(emptyForm());
  const [conseilSyndical, setConseilSyndical] = useState(personne.conseil_syndical);
  const [newContact, setNewContact] = useState<ContactForm>(emptyForm());

  async function toggleConseilSyndical() {
    const val = !conseilSyndical;
    setConseilSyndical(val);
    await fetch(`/api/personnes/${personne.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conseil_syndical: val }),
    });
    router.refresh();
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setEditForm(emptyForm(c));
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, civilite: editForm.civilite || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setContacts((cs) => cs.map((c) => c.id === id ? updated : c));
      setEditingId(null);
      router.refresh();
    }
    setSaving(false);
  }

  async function addContact() {
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personne_id: personne.id, ...newContact, civilite: newContact.civilite || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setContacts((cs) => [...cs, data]);
      setNewContact(emptyForm());
      setAdding(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function deleteContact(id: string) {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((cs) => cs.filter((c) => c.id !== id));
    router.refresh();
  }

  const typeLotLabel: Record<string, string> = {
    APPARTEMENT: "Appartement", PARKING: "Parking", CAVE: "Cave",
    LOCAL_COMMERCIAL: "Local commercial", AUTRE: "Autre",
  };

  return (
    <div className="space-y-6">
      {/* Conseil syndical */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Membre du conseil syndical</p>
          <p className="text-xs text-gray-400 mt-0.5">Les autres rôles sont calculés automatiquement selon les lots.</p>
        </div>
        <button
          onClick={toggleConseilSyndical}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${conseilSyndical ? "bg-blue-600" : "bg-gray-200"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${conseilSyndical ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Contacts ({contacts.length})</h2>
          {!adding && (
            <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          )}
        </div>

        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className="border border-gray-100 rounded-lg p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <ContactFormFields form={editForm} onChange={setEditForm} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 flex-1 justify-center border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                      <X className="h-3.5 w-3.5" /> Annuler
                    </button>
                    <button onClick={() => saveEdit(c.id)} disabled={saving} className="flex items-center gap-1 flex-1 justify-center bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{contactNom(c)}</p>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      {c.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{c.email}</p>}
                      {c.telephone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.telephone}</p>}
                      {(c.adresse || c.ville) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {[c.adresse, c.code_postal, c.ville, c.pays].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => startEdit(c)} className="text-gray-300 hover:text-blue-500 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteContact(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {adding && (
            <div className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50">
              <p className="text-sm font-medium text-blue-700">Nouveau contact</p>
              <ContactFormFields form={newContact} onChange={setNewContact} />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-white">Annuler</button>
                <button onClick={addContact} disabled={saving} className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Ajout…" : "Ajouter"}
                </button>
              </div>
            </div>
          )}

          {contacts.length === 0 && !adding && (
            <p className="text-sm text-gray-400 text-center py-4">Aucun contact.</p>
          )}
        </div>
      </div>

      {/* Lots liés */}
      {lots.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Lots associés ({lots.length})</h2>
          <div className="space-y-2">
            {lots.map((l) => (
              <Link key={l.id} href={`/lots/${l.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">Lot {l.numero}</span>
                <span className="text-sm text-gray-500">{typeLotLabel[l.type] ?? l.type}{l.batiment ? ` · Bât. ${l.batiment}` : ""}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
