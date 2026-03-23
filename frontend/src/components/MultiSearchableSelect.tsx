import { useState, useRef, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface MultiSearchableSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  options: Option[]
  placeholder?: string
  className?: string
  disabled?: boolean
  minSelected?: number
}

export default function MultiSearchableSelect({
  values,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  disabled = false,
  minSelected = 0,
}: MultiSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter(opt => values.includes(opt.value))

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      if (values.length <= minSelected) return
      onChange(values.filter(v => v !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }

  const removeValue = (optionValue: string) => {
    if (values.length <= minSelected) return
    onChange(values.filter(v => v !== optionValue))
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-2 py-1.5 border border-gray-300 rounded-lg text-left flex items-center gap-1 flex-wrap min-h-[38px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
      >
        {selectedOptions.length > 0 ? (
          <>
            {selectedOptions.map(opt => (
              <span key={opt.value} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {opt.label}
                <span
                  onClick={(e) => { e.stopPropagation(); removeValue(opt.value) }}
                  className="hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))}
          </>
        ) : (
          <span className="text-gray-400 text-sm px-1">{placeholder}</span>
        )}
        <Search className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400 text-center">Nenhum item encontrado</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = values.includes(opt.value)
                const cantRemove = isSelected && values.length <= minSelected
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleOption(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                      isSelected ? 'bg-blue-50 font-medium' : 'hover:bg-gray-50'
                    } ${cantRemove ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                    {opt.label}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
