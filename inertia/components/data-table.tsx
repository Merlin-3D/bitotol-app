'use client'
import React, { useMemo, useState } from 'react'

import classNames from 'classnames'
import { isEmpty } from 'lodash'

type SortOrder = 'asc' | 'desc'

interface SortState {
  column: string
  order: SortOrder
}

interface Data {
  [key: string]: any
}

export interface Column<T> {
  Header: string
  accessor: string
  render?: (data: T, index?: number) => React.ReactNode
  sortable?: boolean
  width?: number
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: Data[]
  itemsPerPage?: number
  withPaginate?: boolean
  showCheckbox?: boolean
  className?: string
  emptyMessage?: string
  onRowSelect?: (index: number) => void
}

export function DataTable<T>({
  columns,
  data,
  itemsPerPage = 20,
  withPaginate,
  emptyMessage = 'Aucune données',
  showCheckbox = false,
  className = 'overflow-auto',
  onRowSelect,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<any>(new Set())

  const handleSort = (column: string) => {
    if (sortState?.column === column) {
      setSortState({
        column,
        order: sortState.order === 'asc' ? 'desc' : 'asc',
      })
    } else {
      setSortState({ column, order: 'asc' })
    }
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIndexes = new Set(data.map((_, index) => index))
      setSelectedRows(allIndexes)
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (index: number) => {
    setSelectedRows((prev: any) =>
      prev.has(index) ? new Set([...prev].filter((i) => i !== index)) : new Set(prev.add(index))
    )
    if (onRowSelect) {
      onRowSelect(index)
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortState) return data
    const sorted = [...data].sort((a, b) => {
      if (a[sortState.column] < b[sortState.column]) {
        return sortState.order === 'asc' ? -1 : 1
      }
      if (a[sortState.column] > b[sortState.column]) {
        return sortState.order === 'asc' ? 1 : -1
      }
      return 0
    })
    return sorted
  }, [data, sortState])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage!
    return sortedData.slice(startIndex, startIndex + itemsPerPage!)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(data.length / itemsPerPage!)

  return (
    <div className="min-h-full">
      <div className={classNames(className)}>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className={classNames('bg-green-800 bg-primary-100 sticky top-0 z-10')}>
            <tr>
              {showCheckbox && (
                <th className="py-3.5 pr-3 border-b border-b-gray-100 text-left text-sm font-normal text-white pl-4 sm:pl-6 lg:pl-4">
                  {/* <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedRows.size === data.length}
              /> */}
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{ width: column.width }}
                  className="py-3.5 pr-3 border-b border-b-gray-100 text-left text-sm font-normal text-white pl-4 sm:pl-6 lg:pl-8 cursor-pointer"
                  onClick={() => column.sortable && handleSort(column.accessor)}
                >
                  {column.Header}
                  {sortState?.column === column.accessor && (
                    <span>{sortState.order === 'asc' ? ' 🔼' : ' 🔽'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isEmpty(paginatedData) ? (
              paginatedData.map((row: any, rowIndex) => (
                <tr key={rowIndex} className={classNames('hover:bg-green-50 even:bg-gray-50')}>
                  {showCheckbox && (
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={classNames(
                        {
                          'border-b border-b-gray-50': rowIndex !== paginatedData.length - 1,
                        },
                        ' pl-8 py-4 font-medium text-sm text-gray-text'
                      )}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="text-slate-400 text-sm">
                <td className="p-2">
                  <span>{emptyMessage}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {withPaginate && (
        <nav className="sticky bottom-0 z-10 bg-white flex items-center justify-between border-t border-gray-100 px-4 sm:px-8">
          <div className="-mt-px flex w-0 flex-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center border-t-2 border-transparent pr-1 py-4 text-sm cursor-pointer font-bold text-gray-500 hover:border-green-600 hover:text-gray-700"
              disabled={currentPage === 1}
            >
              Précédent
            </button>
          </div>
          <div className="hidden md:-mt-px md:flex">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex items-center cursor-pointer border-t-2 px-4 text-sm font-medium border-green-600 text-green-500 border-transparent text-gray-500 hover:border-green-600 hover:text-gray-700`}
              >
                {page}
              </button>
            ))}
          </div>
          <div className="-mt-px flex w-0 flex-1 justify-end">
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="inline-flex items-center border-t-2 cursor-pointer border-transparent py-4 pl-1 text-sm font-bold text-gray-500 hover:border-green-600 hover:text-gray-700"
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
