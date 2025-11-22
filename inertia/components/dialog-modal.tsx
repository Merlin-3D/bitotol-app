import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { XCircleIcon } from '@heroicons/react/20/solid'
import Button from './button'

type SizeType = 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

interface DialogModalProps {
  open: boolean
  title: string
  size?: SizeType
  confirmTitle?: string
  update?: boolean
  isLoading?: boolean
  disabled?: boolean
  color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'info'
  setOpen: () => void
  handleConfirm?: () => void
}

const Sizes = {
  'lg': ['sm:max-w-lg'],
  'xl': ['sm:max-w-xl'],
  '2xl': ['sm:max-w-2xl'],
  '3xl': ['sm:max-w-3xl'],
  '4xl': ['sm:max-w-4xl'],
  '5xl': ['sm:max-w-5xl'],
  '6xl': ['sm:max-w-6xl'],
}

export default function DialogModal({
  open,
  setOpen,
  handleConfirm,
  title,
  size = 'lg',
  update,
  color,
  isLoading,
  disabled,
  confirmTitle,
  children,
}: React.PropsWithChildren<DialogModalProps>) {
  return (
    <Transition show={open}>
      <Dialog className="relative z-30" onClose={() => {}}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={classNames(
                  Sizes[size],
                  'relative transform  rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6'
                )}
              >
                <div className="sm:flex sm:items-start">
                  <div className="grid grid-cols-1 gap-2  mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <DialogTitle
                      as="h3"
                      className="flex justify-between text-lg font-normal leading-6 text-sub-heading"
                    >
                      <span>{title}</span>
                      <XCircleIcon onClick={setOpen} className="h-6 w-6 cursor-pointer" />
                    </DialogTitle>
                    <hr className="my-2" />
                    <div className="">{children}</div>
                  </div>
                </div>

                {!isEmpty(confirmTitle) && (
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                    <Button
                      onClick={handleConfirm}
                      label={confirmTitle!}
                      isLoading={isLoading}
                      color={color}
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-normal text-sub-heading shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={setOpen}
                      data-autofocus
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
