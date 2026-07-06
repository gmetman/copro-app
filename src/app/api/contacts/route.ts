import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personne_id, nom, prenom, telephone, email, adresse, code_postal, ville, pays } = body;
    if (!personne_id) return NextResponse.json({ error: "personne_id requis." }, { status: 400 });
    const { data, error } = await supabase
      .from("contacts")
      .insert({ personne_id, nom, prenom, telephone, email, adresse, code_postal, ville, pays })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
