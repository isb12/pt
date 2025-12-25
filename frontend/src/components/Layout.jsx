import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import api, { getToken } from '../api';

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Auth Check inside Layout
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getToken();
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

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to onboarding if company is missing and NOT already on onboarding page
    if (user && !user.has_company && window.location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="main-wrapper">
                <Navbar user={user} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
