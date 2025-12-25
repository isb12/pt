import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setToken } from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects username
            formData.append('password', password);

            const response = await api.post('/users/token', formData);
            setToken(response.data.access_token);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка входа');
        }
    };

    return (
        <div className="container">
            <h1>Вход</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email или Никнейм"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Войти</button>
            </form>
            <div className="link-text">
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </div>
        </div>
    );
};

export default Login;
