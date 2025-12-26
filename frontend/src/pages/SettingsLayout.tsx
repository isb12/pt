import { Outlet, NavLink } from "react-router-dom"
import { Settings, Building2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

const SettingsLayout = () => {
    const menuItems = [
        { title: "Основные", icon: Settings, url: "/settings/main" },
        { title: "Моя компания", icon: Building2, url: "/settings/company" },
        { title: "Аккаунт", icon: User, url: "/settings/account" },
    ]

    return (
        <div className="flex flex-col md:flex-row -m-6 h-[calc(100vh-3rem)] overflow-hidden">
            <aside className="w-full md:w-64 shrink-0 pt-2 px-2 border-r border-sidebar-border h-full">
                <div className="flex flex-col gap-1">
                    <SidebarMenu className="gap-1">
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.url}>
                                <NavLink
                                    to={item.url}
                                    end={item.url === "/settings"}
                                    className="w-full block"
                                >
                                    {({ isActive }) => (
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            className={cn(
                                                "transition-colors",
                                                isActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </aside>

            <main className="flex-1 min-w-0 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default SettingsLayout


