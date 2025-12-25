import * as React from "react"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import api, { setToken } from "../api"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
    SidebarInset,
    SidebarProvider,
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
import { Button } from "@/components/ui/button"
import { LogOut, User as UserIcon, Settings, Building2, ChevronsUpDown } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Layout = () => {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(true);
    const [company, setCompany] = React.useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get('/companies/my');
                setCompany(response.data);
            } catch (err) {
                // Silently fail
            }
        };
        fetchCompany();
    }, []);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                let token = null;
                try {
                    token = localStorage.getItem('token');
                } catch (e) {
                    console.warn('localStorage access denied');
                }

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
        try {
            localStorage.removeItem('token');
        } catch (e) {
            console.warn('localStorage access denied');
        }
        setToken(null);
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

    if (user && !user.has_company) {
        if (user.is_admin) {
            if (location.pathname !== '/onboarding') {
                return <Navigate to="/onboarding" replace />;
            }
        } else {
            return (
                <div className="flex h-screen items-center justify-center p-4 text-center bg-background text-foreground">
                    <div className="max-w-md space-y-4">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h1 className="text-2xl font-bold">Компания не найдена</h1>
                        <p className="text-muted-foreground">
                            Похоже, администратор еще не настроил компанию. Пожалуйста, обратитесь к администратору системы.
                        </p>
                        <Button onClick={handleLogout} variant="outline">Выйти</Button>
                    </div>
                </div>
            );
        }
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
            <div className="flex h-screen w-full flex-col overflow-hidden">
                <header className="flex h-12 shrink-0 items-center justify-between pl-3 pr-4 border-b bg-background z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary text-white shadow-sm">
                                <Building2 className="size-3.5" />
                            </div>
                        </div>

                        <svg width="6" height="14" viewBox="0 0 6 14" fill="none" className="text-muted-foreground/30 select-none mx-0.5">
                            <path d="M4.5 1L1.5 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>

                        {company && (
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Avatar className="h-6 w-6 border shadow-sm flex-shrink-0">
                                        <AvatarImage src={company.logo} alt={company.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                                            {company.name?.[0] || 'C'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-semibold truncate max-w-[150px]">{company.name}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-center p-0.5 rounded transition-colors hover:bg-muted focus:outline-none text-muted-foreground hover:text-foreground">
                                            <ChevronsUpDown className="size-3 flex-shrink-0" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Организация: {company.type}</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link to="/company-settings" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Профиль компании</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        <svg width="6" height="14" viewBox="0 0 6 14" fill="none" className="text-muted-foreground/30 select-none mx-0.5 hidden md:block">
                            <path d="M4.5 1L1.5 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>

                        <Breadcrumb className="hidden lg:block select-none">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-muted-foreground font-normal text-sm">
                                        {getPageTitle(location.pathname)}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-7 w-7 cursor-pointer border ring-primary/20 transition-all hover:ring-4">
                                    <AvatarImage src={user?.avatar} alt={user?.username} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                                <DropdownMenuItem asChild>
                                    <Link to="/account">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Аккаунт</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/company-settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Настройки компании</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Выйти</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar className="top-12 h-[calc(100vh-3rem)]" />
                    <SidebarInset className="overflow-auto bg-background">
                        <div className="p-6">
                            <Outlet />
                        </div>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
