import { Outlet, Navigate, useLocation } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { setToken } from "../api"
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
import { LogOut, User as UserIcon, Settings, Building2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useAppContext } from "../context/AppContext"

const Layout = () => {
    const { user, company, loading, isAuthenticated, setIsAuthenticated } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
        } catch (e) {
            console.warn('localStorage access denied');
        }
        setToken(null);
        setIsAuthenticated(false);
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
        if (pathname.startsWith('/settings/')) {
            const sub = pathname.split('/')[2];
            switch (sub) {
                case 'main': return 'Основные настройки';
                case 'company': return 'Настройки компании';
                case 'account': return 'Настройки аккаунта';
                default: return 'Настройки';
            }
        }
        switch (pathname) {
            case '/': return 'Главная';
            case '/documents': return 'Документы';
            case '/warehouse': return 'Склад';
            case '/counterparties': return 'Контрагенты';
            case '/onboarding': return 'Регистрация компании';
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
                            <Link
                                to="/settings/company"
                                className="flex items-center gap-2 hover:bg-muted p-1 px-1.5 -ml-1 rounded-md transition-colors transition-opacity active:opacity-70 group"
                            >
                                <div className="h-6 w-6 border shadow-sm flex-shrink-0 rounded-sm overflow-hidden bg-primary/10">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-primary text-[10px] font-bold">
                                            {company.name?.[0] || 'C'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-semibold truncate max-w-[150px] transition-colors">
                                    {company.name}
                                </span>
                            </Link>
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
                                    <Link to="/settings/account">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Аккаунт</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings/company">
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
