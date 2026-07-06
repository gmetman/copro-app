import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { numero, type, batiment, porte, etage, superficie, tantiemes,
            lot_principal_id, proprietaire_id, mandataire_id, locataire_id } = body;
    if (!numero || !type) return NextResponse.json({ error: "Numéro et type requis." }, { status: 400 });
    const { data, error } = await supabase
      .from("lots")
      .insert({ numero, type, batiment, porte, etage, superficie, tantiemes: tantiemes ?? 0,
                lot_principal_id, proprietaire_id, mandataire_id, locataire_id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
