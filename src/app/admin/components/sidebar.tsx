'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, FileText, Layout, Users, PieChart, PlusCircle, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Layout },
    { name: 'Survey Management', href: '/admin/survey-management', icon: FileText },
    { name: 'Template Management', href: '/admin/survey-templates', icon: FileText },
    { name: 'Survey Analytics', href: '/admin/analytics', icon: PieChart },
    { name: 'User Management', href: '/admin/users-mangement', icon: Users },
]

export default function SidebarNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

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
                    <SidebarMenuItem>
                        {/* Dropdown for Settings */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {session ? session.user.name : 'Settings'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {session ? (
                                    <>
                                        <DropdownMenuItem className="text-sm">
                                            <p className="font-medium">{session.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut()}>
                                            Sign Out
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem asChild>
                                        <Link href="/signin">Sign In</Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
