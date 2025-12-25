import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        const val = e.target.value;
        // Allow only lower case English letters and numbers
        if (/^[a-z0-9]*$/.test(val)) {
            setUsername(val);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (username.length < 3) {
            setError("Никнейм должен быть не менее 3 символов");
            return;
        }
        try {
            await api.post('/users/register', { username, email, password });
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Не удалось зарегистрироваться');
            }
        }
    };

    return (
        <div className="container">
            <h1>Регистрация</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Никнейм (только en)"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
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
                <button type="submit">Зарегистрироваться</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <div className="link-text">
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </div>
        </div>
    );
};

export default Register;
