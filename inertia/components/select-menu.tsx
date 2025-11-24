'use client'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { isEmpty } from 'lodash'
import classNames from 'classnames'

interface SelectMenuProps<T> {
  label: string
  className?: string
  selected?: T
  data: T[]
  disabled?: boolean
  error?: boolean
  getLabel: (option?: T) => string
  getKey: (option?: T) => string
  onSelected: (value: T) => void
}

export default function SelectMenu<T>({
  selected,
  className,
  label,
  data,
  disabled,
  error,
  getLabel,
  getKey,
  onSelected,
}: SelectMenuProps<T>) {
  return (
    <div className="w-full">
      <Listbox value={selected} onChange={onSelected}>
        <div className={classNames(className, 'relative')}>
          <ListboxButton
            disabled={disabled}
            className={classNames(
              'focus:outline-green-700',
              {
                'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500':
                  error,
              },
              {
                'border-0 bg-white': !error,
              },
              'relative w-full cursor-default rounded-md  py-1.5 pl-3 pr-10 text-left text-gray-900 focus:ring-inset ring-1 ring-gray-300 focus:outline-none sm:text-sm sm:leading-6'
            )}
          >
            <span className="block truncate">
              {!isEmpty(selected) ? (
                <span className="capitalize">{getLabel(selected)} </span>
              ) : (
                <span className="text-sub-heading/80">{label}</span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
            </span>
          </ListboxButton>

          <ListboxOptions
            //   transition
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
          >
            {!isEmpty(data) ? (
              data.map((item: T) => (
                <ListboxOption
                  key={getKey(item)}
                  value={item}
                  className={classNames(
                    'data-[focus]:bg-green-600 group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900  data-[focus]:text-white'
                  )}
                >
                  <span className="capitalize block truncate font-normal group-data-[selected]:font-semibold">
                    {getLabel(item)}
                  </span>

                  <span
                    className={
                      'text-green-500 absolute inset-y-0 right-0 flex items-center pr-4 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden'
                    }
                  >
                    <CheckIcon aria-hidden="true" className="h-5 w-5" />
                  </span>
                </ListboxOption>
              ))
            ) : (
              <ListboxOption
                value={''}
                disabled={true}
                className={classNames(
                  'data-[focus]:bg-green-600 group relative cursor-default select-none py-2 pl-3 pr-9 text-sub-heading/80  data-[focus]:text-white'
                )}
              >
                <span className="capitalize block truncate font-normal group-data-[selected]:font-semibold">
                  Aucune option
                </span>
              </ListboxOption>
            )}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && <p className="text-xs text-red-600 ">Champ obligatoire.</p>}
    </div>
  )
}
