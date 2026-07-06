import { supabase } from "@/lib/supabase";
import { personneNom } from "@/lib/personne";
import { notFound } from "next/navigation";
import LotEditForm from "./LotEditForm";

export default async function ModifierLotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: lot }, { data: personnes = [] }, { data: lots = [] }] = await Promise.all([
    supabase.from("lots").select("*").eq("id", id).single(),
    supabase.from("personnes").select("id, type, description, contacts(*)").order("created_at"),
    supabase.from("lots").select("id, numero, batiment").order("numero"),
  ]);

  if (!lot) notFound();

  const personneOptions = (personnes ?? []).map((p) => ({
    id: p.id,
    label: personneNom(p as Parameters<typeof personneNom>[0]),
  }));

  const lotOptions = (lots ?? [])
    .filter((l) => l.id !== id)
    .map((l) => ({
      id: l.id,
      label: `Lot ${l.numero}${l.batiment ? ` (Bât. ${l.batiment})` : ""}`,
    }));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Modifier le lot {lot.numero}</h1>
      <LotEditForm lot={lot} personneOptions={personneOptions} lotOptions={lotOptions} />
    </div>
  );
}
