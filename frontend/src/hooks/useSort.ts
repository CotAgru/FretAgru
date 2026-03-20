import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  key: string | null
  direction: SortDirection
}

/**
 * Hook reutilizável de ordenação para tabelas.
 * Uso:
 *   const { sortedData, sortKey, sortDirection, toggleSort, SortHeader } = useSort(data)
 *   <SortHeader field="nome" label="Nome" />
 */
export function useSort<T = any>(data: T[]) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })

  const toggleSort = useCallback((key: string) => {
    setSort(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null } // terceiro click limpa
    })
  }, [])

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return data

    const key = sort.key
    const dir = sort.direction === 'asc' ? 1 : -1

    return [...data].sort((a: any, b: any) => {
      let va = a[key]
      let vb = b[key]

      // null/undefined vai pro final
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1

      // Números
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir
      }

      // Booleanos
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return ((va === vb) ? 0 : va ? -1 : 1) * dir
      }

      // Strings (case-insensitive)
      va = String(va).toLowerCase()
      vb = String(vb).toLowerCase()
      return va.localeCompare(vb, 'pt-BR') * dir
    })
  }, [data, sort.key, sort.direction])

  return {
    sortedData,
    sortKey: sort.key,
    sortDirection: sort.direction,
    toggleSort,
  }
}
