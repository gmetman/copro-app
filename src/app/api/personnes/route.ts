import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { type, categorie, description, contacts = [] } = await req.json();
    if (!type) return NextResponse.json({ error: "Type requis." }, { status: 400 });

    const { data: personne, error } = await supabase
      .from("personnes")
      .insert({ type, categorie: categorie ?? "RESIDENT", description })
      .select()
      .single();
    if (error) throw error;

    if (contacts.length > 0) {
      await supabase.from("contacts").insert(
        contacts.map((c: Record<string, string>) => ({ ...c, personne_id: personne.id }))
      );
    }

    return NextResponse.json(personne, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
