import { supabase } from "@/lib/supabase";
import { personneNom, roleColor, type Role } from "@/lib/personne";
import { notFound } from "next/navigation";
import { Building2, User } from "lucide-react";
import Link from "next/link";
import PersonneDetail from "./PersonneDetail";

export default async function PersonnePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: personne }, { data: lotsProprietaire }, { data: lotsLocataire }, { data: lotsMandataire }] =
    await Promise.all([
      supabase.from("personnes").select("*, contacts(*)").eq("id", id).single(),
      supabase.from("lots").select("id, numero, type, batiment, locataire_id").eq("proprietaire_id", id),
      supabase.from("lots").select("id, numero, type, batiment").eq("locataire_id", id),
      supabase.from("lots").select("id, numero, type, batiment").eq("mandataire_id", id),
    ]);

  if (!personne) notFound();

  const roles: Role[] = [];
  if ((lotsProprietaire?.length ?? 0) > 0) roles.push("propriétaire");
  if ((lotsLocataire?.length ?? 0) > 0) roles.push("locataire");
  if ((lotsMandataire?.length ?? 0) > 0) roles.push("mandataire");
  if (personne.conseil_syndical) roles.push("conseil syndical");
  if (lotsProprietaire?.some((l) => l.locataire_id)) roles.push("bailleur");
  if ((lotsLocataire?.length ?? 0) > 0 || lotsProprietaire?.some((l) => !l.locataire_id)) roles.push("résident");

  const allLots = [
    ...(lotsProprietaire ?? []),
    ...(lotsLocataire ?? []),
    ...(lotsMandataire ?? []),
  ].filter((l, i, arr) => arr.findIndex((x) => x.id === l.id) === i);

  const Icon = personne.type === "morale" ? Building2 : User;
  const nom = personneNom(personne);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nom}</h1>
            <p className="text-gray-500 text-sm">{personne.type === "morale" ? "Personne morale" : "Personne physique"}</p>
          </div>
        </div>
        <Link href={`/personnes/${id}/modifier`} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Modifier
        </Link>
      </div>

      {roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {roles.map((r) => (
            <span key={r} className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColor[r]}`}>{r}</span>
          ))}
        </div>
      )}

      {personne.description && personne.type !== "morale" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-gray-700 text-sm">{personne.description}</p>
        </div>
      )}

      <PersonneDetail personne={personne} lots={allLots} />
    </div>
  );
}
