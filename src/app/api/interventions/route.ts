import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { incident_id, prestataire_id, type_intervention, notes } = body;
    if (!incident_id || !type_intervention) {
      return NextResponse.json({ error: "incident_id et type_intervention requis." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("interventions")
      .insert({ incident_id, prestataire_id: prestataire_id ?? null, type_intervention, notes: notes ?? null })
      .select("*, prestataire:prestataire_id(id, type, description, contacts(prenom, nom))")
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
