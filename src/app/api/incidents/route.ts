import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titre, description, categorie, priorite, localisation, date_ouverture } = body;
    if (!titre || !description || !categorie) {
      return NextResponse.json({ error: "Titre, description et catégorie requis." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("incidents")
      .insert({
        titre, description, categorie,
        priorite: priorite ?? "NORMALE",
        localisation: localisation ?? null,
        date_ouverture: date_ouverture ?? new Date().toISOString().slice(0, 10),
        statut: "NOUVEAU",
        assurance_declaration: false,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
