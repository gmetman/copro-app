import { supabase } from "@/lib/supabase";
import { personneNom, roleColor, categorieLabel, categorieColor, type Role, type Categorie } from "@/lib/personne";
import { Plus, Building2, User } from "lucide-react";
import Link from "next/link";

export default async function PersonnesPage() {
  const [{ data: personnes = [] }, { data: lots = [] }] = await Promise.all([
    supabase.from("personnes").select("*, contacts(*)").order("created_at", { ascending: false }),
    supabase.from("lots").select("proprietaire_id, locataire_id, mandataire_id"),
  ]);

  function rolesFor(id: string): Role[] {
    const roles: Role[] = [];
    const asProprietaire = (lots ?? []).filter((l) => l.proprietaire_id === id);
    const asLocataire = (lots ?? []).filter((l) => l.locataire_id === id);
    const asMandataire = (lots ?? []).filter((l) => l.mandataire_id === id);
    const p = (personnes ?? []).find((x) => x.id === id);

    if (asProprietaire.length > 0) roles.push("propriétaire");
    if (asLocataire.length > 0) roles.push("locataire");
    if (asMandataire.length > 0) roles.push("mandataire");
    if (p?.conseil_syndical) roles.push("conseil syndical");
    if (asProprietaire.some((l) => l.locataire_id)) roles.push("bailleur");
    if (asLocataire.length > 0 || asProprietaire.some((l) => !l.locataire_id)) roles.push("résident");
    return roles;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnes</h1>
          <p className="text-gray-500">{personnes?.length ?? 0} enregistrée(s)</p>
        </div>
        <Link
          href="/personnes/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {!personnes?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucune personne enregistrée.</p>
          <Link href="/personnes/nouveau" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Ajouter la première
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {personnes.map((p) => {
            const nom = personneNom(p);
            const Icon = p.type === "morale" ? Building2 : User;
            const c = p.contacts?.[0];
            const roles = rolesFor(p.id);
            return (
              <Link
                key={p.id}
                href={`/personnes/${p.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{nom}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categorieColor[p.categorie as Categorie] ?? "bg-gray-100 text-gray-500"}`}>
                        {categorieLabel[p.categorie as Categorie] ?? p.categorie}
                      </span>
                      {roles.map((r) => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[r]}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 flex flex-col items-end gap-0.5">
                  {c?.email && <span>{c.email}</span>}
                  {c?.telephone && <span>{c.telephone}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
