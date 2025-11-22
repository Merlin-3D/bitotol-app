'use client'

import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'

import classNames from 'classnames'
import { useForm, usePage } from '@inertiajs/react'
import DashboardIcon from '~/components/icons/dashboard.icon'
import logoBlack from '~/assets/logo/logo_empty.png'
import LogoutIcon from '~/components/icons/logout.icon'
import XMarkIcon from '~/components/icons/xmark.icon'
import CustomerIcon from '~/components/icons/customers.icon'
import ProductsIcon from '~/components/icons/products.icon'
import StockIcon from '~/components/icons/stock.icon'
import InvoiceIcon from '~/components/icons/invoice.icon'
import WarehouseIcon from '~/components/icons/warehouse.icon'
import InventoryIcon from '~/components/icons/inventory.icon'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard/home',
    icon: DashboardIcon,
  },
  {
    name: 'Clients',
    href: '/dashboard/customers',
    icon: CustomerIcon,
  },
  {
    name: 'Produits | Services',
    href: '#',
    icon: ProductsIcon,
  },
  // {
  //   name: 'Catégories',
  //   href: '#',
  //   icon: CategoryIcon,
  // },
  {
    name: 'Stocks',
    href: '#',
    icon: StockIcon,
  },
  {
    name: 'Facturations',
    href: '#',
    icon: InvoiceIcon,
  },
  {
    name: 'Entrepôts',
    href: '/dashboard/warehouses',
    icon: WarehouseIcon,
  },
  {
    name: 'Inventaires',
    href: '#',
    icon: InventoryIcon,
  },
]

interface SidebarProps {
  sidebarOpen: boolean
  onClose: (value: boolean) => void
}

export default function Sidebar({ sidebarOpen, onClose }: SidebarProps) {
  const { url } = usePage<any>()

  const { post } = useForm()

  const handleLogout = () => {
    post('/dashboard/logout')
  }

  return (
    <>
      <div className="hidden xl:flex flex-col h-full border-gray-200 fixed top-0 z-10 pt-20">
        <div className="px-2 fixed top-0 w-64 h-20 border-b border-line flex items-center justify-between">
          <a href="/dashboard/dashboard" className="flex items-center gap-4">
            <img src={logoBlack} alt="" className="h-10 w-10" />
            <h1 className="font-semibold text-xl">KAISEN</h1>
          </a>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-2 w-64">
          {navItems.map((item) => {
            const isActive = url.includes(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`px-2 py-1 flex items-center rounded-md transition-colors duration-150 ease-in-out text-sm font-medium ${
                  isActive
                    ? 'bg-gray-200 font-semibold text-gray-800'
                    : 'text-gray-600 hover:bg-gray-200 group'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span className="group-hover:text-gray-600">{item.name}</span>
              </a>
            )
          })}
        </nav>

        <div className="py-4 space-y-2">
          <div
            onClick={() => handleLogout()}
            className="px-5 py-1 flex items-center rounded-md transition-colors duration-150 ease-in-out text-sm font-medium text-gray-600 hover:bg-active-default"
          >
            <LogoutIcon className="w-5 h-5 mr-2" />
            <span>Déconnexion</span>
          </div>
        </div>
      </div>
      <Dialog open={sidebarOpen} onClose={onClose} className="relative z-50 xl:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button type="button" onClick={() => onClose(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="relative flex h-16 shrink-0 items-center">
                <img src={logoBlack} alt="" className="h-8 w-auto" />
              </div>
              <nav className="relative flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navItems.map((item) => {
                        const isActive = url.includes(item.href)
                        return (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                isActive
                                  ? 'bg-gray-50 text-green-500'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-500',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  isActive
                                    ? 'text-green-500'
                                    : 'text-gray-400 group-hover:text-green-500',
                                  'size-6 shrink-0'
                                )}
                              />
                              {item.name}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </li>

                  <li className="mt-auto">
                    <button
                      onClick={() => handleLogout()}
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary"
                    >
                      <LogoutIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-400 group-hover:text-primary"
                      />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
