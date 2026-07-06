import { supabase } from "@/lib/supabase";
import { personneNom } from "@/lib/personne";
import LotForm from "./LotForm";

export default async function NouveauLotPage() {
  const [{ data: personnes = [] }, { data: lots = [] }] = await Promise.all([
    supabase.from("personnes").select("id, type, description, contacts(*)").order("created_at"),
    supabase.from("lots").select("id, numero, batiment").order("numero"),
  ]);

  const personneOptions = (personnes ?? []).map((p) => ({
    id: p.id,
    label: personneNom(p as Parameters<typeof personneNom>[0]),
  }));

  const lotOptions = (lots ?? []).map((l) => ({
    id: l.id,
    label: `Lot ${l.numero}${l.batiment ? ` (Bât. ${l.batiment})` : ""}`,
  }));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouveau lot</h1>
      <LotForm personneOptions={personneOptions} lotOptions={lotOptions} />
    </div>
  );
}
