import React, { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import Button from './button'

interface ConfirmOrderDialogProps {
  isOpen: boolean
  isLoading?: boolean
  title?: string
  description: React.ReactNode
  setOpen: () => void
  onConfirm: () => void
}

export const ConfirmOrderDialog = ({
  isOpen,
  isLoading,
  title,
  description,
  setOpen,
  onConfirm,
}: ConfirmOrderDialogProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75"></div>
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-transform ease-out duration-300"
          enterFrom="scale-95"
          enterTo="scale-100"
          leave="transition-transform ease-in duration-200"
          leaveFrom="scale-100"
          leaveTo="scale-95"
        >
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3M12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1m1 4h-2v-2h2z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <Button color="warning" isLoading={isLoading} label="Oui" onClick={onConfirm} />
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-transparent sm:mt-0 sm:w-auto sm:text-sm"
                onClick={setOpen}
              >
                Non
              </button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  )
}
