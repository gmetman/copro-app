import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = { ...body };
    if (body.statut === "CLOS" && !body.date_cloture) {
      update.date_cloture = new Date().toISOString().slice(0, 10);
    }
    if (body.statut && body.statut !== "CLOS") {
      update.date_cloture = null;
    }
    const { data, error } = await supabase
      .from("incidents")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { contenu, auteur } = body;
    if (!contenu || !auteur) {
      return NextResponse.json({ error: "Contenu et auteur requis." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("commentaires")
      .insert({ contenu, auteur, incident_id: id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
