import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (err) {
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
        navigate('/login');
    };

    if (!user) return <div>Загрузка...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Добро пожаловать, {user.email}!</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                Вы успешно вошли в систему.
            </p>
            <button onClick={handleLogout} style={{ maxWidth: '200px' }}>
                Выйти
            </button>
        </div>
    );
};

export default Home;
