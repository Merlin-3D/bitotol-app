'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useForm, usePage } from '@inertiajs/react'
import Bars3Icon from '~/components/icons/bars3.icon'
import ChevronIcon from '~/components/icons/chevron.icon'

const userNavigation = [{ name: 'Déconnexion', href: '#' }]

interface NavbarProps {
  onClose: (value: boolean) => void
}

export default function Navbar({ onClose }: NavbarProps) {
  const { post } = useForm()
  const { props } = usePage<any>()

  const handleLogout = () => {
    post('/dashboard/logout')
  }
  const getInitials = (user: any) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((name: any) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.name.charAt(0).toUpperCase()
  }
  return (
    <header className="top-0 sticky left-64 right-0 h-[72px] bg-white border-b border-gray-200 rounded-t-xl z-20 flex items-center justify-between px-6">
      <div className="sticky top-0 z-40 w-full">
        <div className="flex h-16 items-center gap-x-4 sm:gap-x-6 xl:px-0 xl:shadow-none">
          <button
            type="button"
            onClick={() => onClose(true)}
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 xl:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>

          {/* Separator */}
          <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between">
            <form className="relative hidden md:flex items-center">
              {/* <button
                type="button"
                onClick={() => onClose(true)}
                className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars4Icon aria-hidden="true" className="size-6" />
              </button> */}
            </form>
            <div></div>
            <div className="flex items-center gap-x-4 lg:gap-x-3">
              <Menu as="div" className="relative">
                <MenuButton className="relative flex items-center">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-white">
                      {props.user ? getInitials(props.user) : 'A'}
                    </span>
                  </div>

                  <span className="hidden lg:flex lg:items-center">
                    <span
                      aria-hidden="true"
                      className="capitalize ml-2 text-sm/6 font-semibold text-gray-900"
                    >
                      {props.user ? props.user.name : ''}
                    </span>
                    <ChevronIcon aria-hidden="true" className="ml-2 size-3 text-gray-400" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="cursor-pointer absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      <button
                        onClick={() => handleLogout()}
                        className="cursor-pointer block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                      >
                        {item.name}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
