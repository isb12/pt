import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import api, { setToken } from '../api';

const Navbar = ({ user }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Mapping paths to titles
    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Главная';
            case '/documents': return 'Документы';
            case '/warehouse': return 'Склад';
            case '/counterparties': return 'Контрагенты';
            case '/account': return 'Аккаунт';
            case '/settings': return 'Настройки';
            case '/onboarding': return 'Регистрация компании';
            case '/company-settings': return 'Настройки компании';
            default: return 'Inventar';
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = () => {
        try {
            setToken(null);
            navigate('/login');
        } catch (e) {
            console.error("Logout error", e);
            navigate('/login');
        }
    };

    return (
        <div className="top-navbar">
            <div className="page-title">
                {getPageTitle(location.pathname)}
            </div>

            <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
                <div className="user-avatar">
                    {user && user.avatar ? (
                        <img src={user.avatar} alt="Ava" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        user?.username?.[0] || 'U'
                    )}
                </div>

                {dropdownOpen && (
                    <div className="user-dropdown">
                        <div className="user-info">
                            <div className="user-name">{user?.username || 'Пользователь'}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>

                        <Link to="/account" className="dropdown-item">
                            <User size={16} /> Аккаунт
                        </Link>

                        <Link to="/settings" className="dropdown-item">
                            <Settings size={16} /> Настройки
                        </Link>

                        <div className="dropdown-item danger" onClick={handleLogout}>
                            <LogOut size={16} /> Выйти
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
