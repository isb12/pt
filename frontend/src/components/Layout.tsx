import * as React from "react"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import api from "../api"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User as UserIcon, Settings } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Layout = () => {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token");
                }
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Auth check failed", error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user && !user.has_company && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case '/': return 'Главная';
            case '/documents': return 'Документы';
            case '/warehouse': return 'Склад';
            case '/counterparties': return 'Контрагенты';
            case '/account': return 'Аккаунт';
            case '/settings': return 'Настройки';
            case '/onboarding': return 'Регистрация компании';
            case '/company-settings': return 'Настройки компании';
            default: return 'Project';
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Система
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{getPageTitle(location.pathname)}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer border ring-primary/20 transition-all hover:ring-4">
                                    <AvatarImage src={user?.avatar} alt={user?.username} />
                                    <AvatarFallback className="bg-emerald-50 text-emerald-700">
                                        {user?.username?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link to="/account">
                                    <DropdownMenuItem>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Аккаунт</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link to="/company-settings">
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Настройки компании</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Выйти</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto bg-muted/20">
                    <div className="mt-4">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
