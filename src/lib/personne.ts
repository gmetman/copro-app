export type Contact = {
  id: string;
  civilite: "M." | "Mme" | null;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
};

export type Categorie = "RESIDENT" | "FOURNISSEUR";

export type Personne = {
  id: string;
  description: string | null;
  type: "physique" | "morale";
  categorie: Categorie;
  conseil_syndical: boolean;
  contacts: Contact[];
  created_at: string;
};

export type Role = "propriétaire" | "locataire" | "mandataire" | "conseil syndical" | "bailleur" | "résident";

export function personneNom(p: Pick<Personne, "type" | "description" | "contacts">): string {
  if (p.type === "morale") return p.description ?? "Sans nom";
  const names = (p.contacts ?? [])
    .slice(0, 2)
    .map((c) => [c.prenom, c.nom].filter(Boolean).join(" "))
    .filter(Boolean);
  return names.join(", ") || p.description || "Sans contact";
}

export function contactNom(c: Pick<Contact, "civilite" | "prenom" | "nom">): string {
  return [c.civilite, c.prenom, c.nom].filter(Boolean).join(" ") || "Sans nom";
}

export const roleColor: Record<Role, string> = {
  "propriétaire":     "bg-blue-100 text-blue-700",
  "locataire":        "bg-green-100 text-green-700",
  "mandataire":       "bg-purple-100 text-purple-700",
  "conseil syndical": "bg-yellow-100 text-yellow-700",
  "bailleur":         "bg-orange-100 text-orange-700",
  "résident":         "bg-teal-100 text-teal-700",
};

export const categorieLabel: Record<Categorie, string> = {
  RESIDENT:    "Propriétaires & Résidents",
  FOURNISSEUR: "Fournisseur",
};

export const categorieColor: Record<Categorie, string> = {
  RESIDENT:    "bg-indigo-100 text-indigo-700",
  FOURNISSEUR: "bg-amber-100 text-amber-700",
};
