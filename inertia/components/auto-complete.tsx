'use client'

import { useState } from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'

interface AutoCompleteProps<T> {
  label: string
  className?: string
  parentClassName?: string
  selected?: T
  disabled?: boolean
  data: T[]
  error?: boolean
  getLabel: (option?: T) => string
  getKey: (option?: T) => string
  onSelected: (value: T) => void
}

export default function AutoComplete<T>({
  selected,
  className,
  label,
  data,
  disabled,
  error,
  parentClassName = 'w-full',
  getLabel,
  getKey,
  onSelected,
}: AutoCompleteProps<T>) {
  const [query, setQuery] = useState('')

  const filteredData =
    query === ''
      ? data
      : data.filter((item) => getLabel(item).toLowerCase().includes(query.toLowerCase()))

  return (
    <Combobox
      as="div"
      value={selected}
      onChange={(item) => {
        setQuery('')
        onSelected(item as T)
      }}
      className={parentClassName}
    >
      <div className={classNames(className, 'relative w-full')}>
        <ComboboxInput
          disabled={disabled}
          className={classNames(
            'focus:ring-green-600',
            { 'bg-sub-heading/10 cursor-not-allowed border-0': disabled },
            { 'bg-white border-0': !error },
            {
              'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500':
                error,
            },
            'w-full rounded-md   py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset  focus:outline-none sm:text-sm sm:leading-6'
          )}
          onChange={(event) => setQuery(event.target.value)}
          //   onBlur={() => setQuery("")}
          placeholder={label}
          displayValue={(value) => getLabel(value as T)}
        />
        <ComboboxButton
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>

        {filteredData.length > 0 && (
          <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData.map((item) => (
              <ComboboxOption
                key={getKey(item)}
                value={item}
                className={classNames(
                  'data-[focus]:bg-green-600 group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900  data-[focus]:text-white'
                )}
              >
                <span className="block truncate group-data-[selected]:font-semibold">
                  {getLabel(item)}
                </span>
                <span
                  className={classNames(
                    'text-green-600 absolute inset-y-0 right-0 hidden items-center pr-4 group-data-[selected]:flex group-data-[focus]:text-white'
                  )}
                >
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
      {error && <p className="text-xs text-red-600 ">Champ obligatoire.</p>}
    </Combobox>
  )
}
