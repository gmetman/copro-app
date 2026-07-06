import { supabase } from "@/lib/supabase";
import { personneNom } from "@/lib/personne";
import { notFound } from "next/navigation";
import Link from "next/link";

const typeLotLabel: Record<string, string> = {
  APPARTEMENT: "Appartement", PARKING: "Parking", CAVE: "Cave",
  LOCAL_COMMERCIAL: "Local commercial", AUTRE: "Autre",
};
const porteLabel: Record<string, string> = {
  droite: "Droite", gauche: "Gauche", face: "Face", cour: "Cour", rue: "Rue",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

function PersonneLink({ p }: { p: { id: string; type: string; description: string | null; contacts: { nom?: string | null; prenom?: string | null }[] } | null }) {
  if (!p) return <span className="text-gray-300">—</span>;
  return <Link href={`/personnes/${p.id}`} className="text-blue-600 hover:underline">{personneNom(p)}</Link>;
}

export default async function LotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: lot } = await supabase
    .from("lots")
    .select(`
      *,
      proprietaire:proprietaire_id(id, type, description, contacts(*)),
      mandataire:mandataire_id(id, type, description, contacts(*)),
      locataire:locataire_id(id, type, description, contacts(*)),
      lot_principal:lot_principal_id(id, numero, batiment)
    `)
    .eq("id", id)
    .single();

  if (!lot) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lot {lot.numero}</h1>
          <p className="text-gray-500 text-sm">{typeLotLabel[lot.type] ?? lot.type}</p>
        </div>
        <Link
          href={`/lots/${id}/modifier`}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Modifier
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">Caractéristiques</h2>
        <Row label="Type" value={typeLotLabel[lot.type] ?? lot.type} />
        <Row label="Bâtiment" value={lot.batiment} />
        <Row label="Porte" value={lot.porte ? porteLabel[lot.porte] : null} />
        <Row label="Étage" value={lot.etage != null ? `${lot.etage}e étage` : null} />
        <Row label="Superficie" value={lot.superficie != null ? `${lot.superficie} m²` : null} />
        <Row label="Tantièmes" value={lot.tantiemes} />
        <Row label="Lot principal" value={
          lot.lot_principal
            ? <Link href={`/lots/${(lot.lot_principal as {id:string}).id}`} className="text-blue-600 hover:underline">
                Lot {(lot.lot_principal as {numero:string}).numero}
                {(lot.lot_principal as {batiment:string|null}).batiment ? ` (Bât. ${(lot.lot_principal as {batiment:string}).batiment})` : ""}
              </Link>
            : null
        } />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Personnes associées</h2>
        <Row label="Propriétaire" value={<PersonneLink p={lot.proprietaire as Parameters<typeof PersonneLink>[0]["p"]} />} />
        <Row label="Mandataire" value={<PersonneLink p={lot.mandataire as Parameters<typeof PersonneLink>[0]["p"]} />} />
        <Row label="Locataire" value={<PersonneLink p={lot.locataire as Parameters<typeof PersonneLink>[0]["p"]} />} />
      </div>
    </div>
  );
}
