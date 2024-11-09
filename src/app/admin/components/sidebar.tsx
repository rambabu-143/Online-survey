'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, FileText, Layout, Settings, Users, PieChart, PlusCircle } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Layout },
    { name: 'Survey Management', href: '/admin/survey-management', icon: FileText },
    { name: 'Template Management', href: '/admin/survey-templates', icon: FileText },
    { name: 'Survey Analytics', href: '/analytics', icon: PieChart },
    { name: 'User Management', href: '/admin/users-mangement', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export default function SidebarNav() {
    const pathname = usePathname()

    return (

        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <BarChart2 className="w-6 h-6 mr-2" />
                                <span className="font-bold">Survey App</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={pathname === item.href}>
                                <Link href={item.href}>
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/new">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create Survey
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
}