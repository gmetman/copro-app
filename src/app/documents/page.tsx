import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, Download } from "lucide-react";
import Link from "next/link";

const categorieLabel: Record<string, string> = {
  PV_AG: "PV d'AG", CONTRAT: "Contrat", REGLEMENT: "Règlement",
  DEVIS: "Devis", FACTURE: "Facture", ASSURANCE: "Assurance", AUTRE: "Autre",
};
const categorieColor: Record<string, string> = {
  PV_AG: "bg-purple-100 text-purple-700",
  CONTRAT: "bg-blue-100 text-blue-700",
  REGLEMENT: "bg-gray-100 text-gray-700",
  DEVIS: "bg-yellow-100 text-yellow-700",
  FACTURE: "bg-orange-100 text-orange-700",
  ASSURANCE: "bg-green-100 text-green-700",
  AUTRE: "bg-gray-100 text-gray-600",
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default async function DocumentsPage() {
  const { data: documents = [] } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  const byCategorie = (documents ?? []).reduce<Record<string, NonNullable<typeof documents>>>((acc, doc) => {
    acc[doc.categorie] = acc[doc.categorie] ?? [];
    acc[doc.categorie]!.push(doc);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">{documents.length} fichier(s)</p>
        </div>
        <Link
          href="/documents/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun document enregistré.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byCategorie).map(([cat, docs]) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {categorieLabel[cat]} ({docs.length})
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 p-4">
                    <FileText className="h-8 w-8 text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{doc.titre}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categorieColor[doc.categorie]}`}>
                          {categorieLabel[doc.categorie]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(doc.uploaded_at)}</span>
                        {doc.fileSize && <span className="text-xs text-gray-400">{formatSize(doc.fileSize)}</span>}
                      </div>
                      {doc.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{doc.description}</p>}
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
