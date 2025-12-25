import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Warehouse, Users, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import api from '../api';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const [company, setCompany] = React.useState(null);

    React.useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get('/companies/my');
                setCompany(response.data);
            } catch (err) {
                // Silently fail if no company (onboarding will catch)
            }
        };
        fetchCompany();
    }, []);

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="logo-area">
                {collapsed ? 'Inv' : 'Inventar'}
            </div>

            <button
                className="sidebar-toggle"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expand" : "Collapse"}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Главная">
                    <LayoutDashboard className="nav-icon" size={20} />
                    {!collapsed && <span>Главная</span>}
                </NavLink>

                <NavLink to="/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Документы">
                    <FileText className="nav-icon" size={20} />
                    {!collapsed && <span>Документы</span>}
                </NavLink>

                <NavLink to="/warehouse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Склад">
                    <Warehouse className="nav-icon" size={20} />
                    {!collapsed && <span>Склад</span>}
                </NavLink>

                <NavLink to="/counterparties" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Контрагенты">
                    <Users className="nav-icon" size={20} />
                    {!collapsed && <span>Контрагенты</span>}
                </NavLink>
            </nav>

            {company && (
                <NavLink to="/company-settings" className="sidebar-company-link">
                    <div className="sidebar-company">
                        <div className="company-logo">
                            {company.logo ? (
                                <img src={company.logo} alt="Company Logo" />
                            ) : (
                                <Building2 size={20} />
                            )}
                        </div>
                        {!collapsed && (
                            <div className="company-info">
                                <div className="company-name">{company.name}</div>
                                <div className="company-type">{company.type}</div>
                            </div>
                        )}
                    </div>
                </NavLink>
            )}
        </div>
    );
};

export default Sidebar;
