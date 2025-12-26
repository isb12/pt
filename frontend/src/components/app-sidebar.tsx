import * as React from "react"
import {
    LayoutDashboard,
    FileText,
    Warehouse,
    Users,
    Settings as SettingsIcon,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()

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
        {
            title: "Настройки",
            url: "/settings/main",
            icon: SettingsIcon,
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent className="pt-2">
                <SidebarMenu className="px-2 gap-1">
                    {navMain.map((item) => {
                        const isSettingsItem = item.url.startsWith("/settings/")
                        const isItemActive = isSettingsItem
                            ? location.pathname.startsWith("/settings/")
                            : location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url))

                        return (
                            <SidebarMenuItem key={item.title}>
                                <NavLink to={item.url}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isItemActive}
                                        className={`transition-colors flex items-center gap-2 ${isItemActive
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        {item.icon && <item.icon className="size-4" />}
                                        <span className="font-medium">{item.title}</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <SidebarTrigger className="h-8 w-8 hover:bg-muted transition-colors rounded-md" />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
