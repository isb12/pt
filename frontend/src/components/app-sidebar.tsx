import * as React from "react"
import {
    Building2,
    LayoutDashboard,
    FileText,
    Warehouse,
    Users,
    ChevronRight,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import api from "../api"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [company, setCompany] = React.useState<any>(null)

    React.useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get('/companies/my');
                setCompany(response.data);
            } catch (err) {
                // Silently fail if no company
            }
        };
        fetchCompany();
    }, []);

    const navMain = [
        {
            title: "Главная",
            url: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Документы",
            url: "/documents",
            icon: FileText,
        },
        {
            title: "Склад",
            url: "/warehouse",
            icon: Warehouse,
        },
        {
            title: "Контрагенты",
            url: "/counterparties",
            icon: Users,
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Inventar</span>
                                <span className="truncate text-xs">Система управления</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navMain.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <NavLink to={item.url} style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'inherit' })}>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </NavLink>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <SidebarSeparator />
            </SidebarContent>
            <SidebarFooter>
                {company && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <NavLink to="/company-settings">
                                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={company.logo} alt={company.name} />
                                        <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                                            <Building2 className="size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{company.name}</span>
                                        <span className="truncate text-xs">{company.type}</span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </NavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
