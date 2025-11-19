import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import Sidebar from './SideBar'
import Navbar from './NavBar'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className=" bg-[#f5f6f6] h-screen">
      <Head title={title} />
      <div className="flex bg-dashboard pr-2 py-2 h-full">
        <Sidebar onClose={setSidebarOpen} sidebarOpen={sidebarOpen} />

        <div className="flex flex-col flex-1 ml-2 xl:ml-64  h-full bg-white rounded-xl">
          <Navbar onClose={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto py-4 px-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
