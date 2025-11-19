import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import Button from './button'

interface ConfirmDialogProps {
  isOpen: boolean
  isLoading?: boolean
  title?: string
  titleButton?: string
  description?: string
  setOpen: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  isOpen,
  isLoading,
  title = 'Confirmer la suppression',
  titleButton = 'Supprimer',
  description = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  setOpen,
  onConfirm,
}: ConfirmDialogProps) => {
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
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
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
              <Button
                isLoading={isLoading}
                color="danger"
                label={titleButton}
                onClick={onConfirm}
              />
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-transparent sm:mt-0 sm:w-auto sm:text-sm"
                onClick={setOpen}
              >
                Annuler
              </button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  )
}
