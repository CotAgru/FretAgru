import { FileDown, FileSpreadsheet } from 'lucide-react'

interface ExportButtonsProps {
  onExportPDF: () => void
  onExportExcel: () => void
}

export default function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={onExportExcel}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
        title="Exportar Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>
      <button
        onClick={onExportPDF}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        title="Exportar PDF"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  )
}
