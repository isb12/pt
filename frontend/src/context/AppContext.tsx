import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

interface AppContextType {
    user: any;
    company: any;
    loading: boolean;
    isAuthenticated: boolean;
    fetchUser: () => Promise<void>;
    fetchCompany: () => Promise<void>;
    setIsAuthenticated: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            const response = await api.get('/users/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthenticated(false);
        }
    }, []);

    const fetchCompany = useCallback(async () => {
        try {
            const response = await api.get('/companies/my');
            setCompany(response.data);
        } catch (err) {
            // Silently fail if no company yet
            setCompany(null);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            if (isAuthenticated) {
                await Promise.all([fetchUser(), fetchCompany()]);
            }
            setLoading(false);
        };
        init();
    }, [isAuthenticated, fetchUser, fetchCompany]);

    return (
        <AppContext.Provider value={{
            user,
            company,
            loading,
            isAuthenticated,
            fetchUser,
            fetchCompany,
            setIsAuthenticated
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
