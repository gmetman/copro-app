import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PersonneEditForm from "./PersonneEditForm";

export default async function ModifierPersonnePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: personne } = await supabase
    .from("personnes")
    .select("*, contacts(*)")
    .eq("id", id)
    .single();

  if (!personne) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Modifier la personne</h1>
      <PersonneEditForm personne={personne} />
    </div>
  );
}
