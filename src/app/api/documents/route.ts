import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titre, categorie, description, fileUrl, filename } = body;
    if (!titre || !categorie || !fileUrl) {
      return NextResponse.json({ error: "Titre, catégorie et URL requis." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("documents")
      .insert({ titre, categorie, description, file_url: fileUrl, filename })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
