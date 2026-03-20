import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { SortDirection } from '../hooks/useSort'

interface SortHeaderProps {
  field: string
  label: string
  sortKey: string | null
  sortDirection: SortDirection
  onSort: (key: string) => void
  align?: 'left' | 'center' | 'right'
}

export default function SortHeader({ field, label, sortKey, sortDirection, onSort, align = 'left' }: SortHeaderProps) {
  const isActive = sortKey === field
  const alignClass = align === 'right' ? 'text-right justify-end' : align === 'center' ? 'text-center justify-center' : 'text-left'

  return (
    <th
      className={`px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 transition-colors ${alignClass}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        <span>{label}</span>
        {isActive && sortDirection === 'asc' && <ArrowUp className="w-3.5 h-3.5 text-green-600" />}
        {isActive && sortDirection === 'desc' && <ArrowDown className="w-3.5 h-3.5 text-green-600" />}
        {!isActive && <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />}
      </div>
    </th>
  )
}
