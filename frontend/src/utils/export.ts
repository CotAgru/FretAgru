import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// =============================================================
// iAgru - Utilitários de Exportação (PDF e Excel)
// =============================================================

interface ExportColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface ExportOptions {
  filename: string
  title: string
  columns: ExportColumn[]
  data: any[]
  getValue?: (item: any, key: string) => string
}

/** Exportar dados para Excel (.xlsx) */
export function exportToExcel({ filename, title, columns, data, getValue }: ExportOptions) {
  const headers = columns.map(c => c.label)
  const rows = data.map(item =>
    columns.map(col => {
      if (getValue) return getValue(item, col.key)
      const val = item[col.key]
      return val != null ? String(val) : ''
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Ajustar largura das colunas
  ws['!cols'] = columns.map((_, i) => {
    const maxLen = Math.max(
      headers[i].length,
      ...rows.map(r => String(r[i] || '').length)
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}.xlsx`)
}

/** Exportar dados para PDF */
export function exportToPDF({ filename, title, columns, data, getValue }: ExportOptions) {
  const doc = new jsPDF({ orientation: data.length > 0 && columns.length > 6 ? 'landscape' : 'portrait' })

  // Título
  doc.setFontSize(16)
  doc.setTextColor(22, 163, 74) // green-600
  doc.text(`FretAgru - ${title}`, 14, 18)

  // Data de geração
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  const now = new Date()
  const dataStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  doc.text(`Gerado em ${dataStr}`, 14, 24)
  doc.text(`Total: ${data.length} registros`, 14, 29)

  // Tabela
  const headers = columns.map(c => c.label)
  const rows = data.map(item =>
    columns.map(col => {
      if (getValue) return getValue(item, col.key)
      const val = item[col.key]
      return val != null ? String(val) : ''
    })
  )

  const columnStyles: Record<number, any> = {}
  columns.forEach((col, i) => {
    if (col.align === 'right') columnStyles[i] = { halign: 'right' }
    else if (col.align === 'center') columnStyles[i] = { halign: 'center' }
  })

  autoTable(doc, {
    startY: 33,
    head: [headers],
    body: rows,
    columnStyles,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `iAgru Ecossistema - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    )
  }

  doc.save(`${filename}.pdf`)
}
