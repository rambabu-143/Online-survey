import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SidebarNav from './components/sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Survey Dashboard',
    description: 'Manage your surveys and analyze results',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <SidebarNav />
            <main className='w-full'>
                <SidebarTrigger className='bg-green-600 p-4 text-3xl' />
                <SessionProvider>
                    {children}
                </SessionProvider>
            </main>
        </SidebarProvider>
    )
}