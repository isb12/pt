import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Mail, Save, X, Edit2, Lock, Camera, Trash2 } from 'lucide-react';

const Account = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null); // Actual file or base64 or "" for delete
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
            setUsername(response.data.username);
            setEmail(response.data.email);
            setAvatarPreview(response.data.avatar);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Размер файла не должен превышать 2МБ");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Base64 string
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAvatar = () => {
        setAvatar(""); // Mark for deletion
        setAvatarPreview(null);
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (!/^[a-z0-9]*$/.test(username)) {
            setError('Никнейм может содержать только строчные английские буквы и цифры');
            return;
        }

        try {
            const payload = { username, email };
            if (password) {
                payload.password = password;
            }
            if (avatar !== null) {
                payload.avatar = avatar;
            }

            const response = await api.put('/users/me', payload);
            setUser(response.data);
            setSuccess('Данные успешно обновлены');
            setEditing(false);
            setPassword(''); // Clear password field
            setAvatar(null); // Clear pending avatar

            // Update preview based on new user data
            setAvatarPreview(response.data.avatar);

            // Reload page to update navbar (or we could use context, but reload is simpler for now)
            window.location.reload();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при сохранении');
        }
    };

    const handleCancel = () => {
        setUsername(user.username);
        setEmail(user.email);
        setPassword('');
        setAvatar(null);
        setAvatarPreview(user.avatar);
        setEditing(false);
        setError('');
        setSuccess('');
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Аккаунт</h1>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem', display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                        <Edit2 size={16} /> Изменить
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="error-message" style={{ background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71' }}>{success}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Avatar Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{user.username[0].toUpperCase()}</span>
                        )}
                    </div>

                    {editing && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#3498db',
                                        fontWeight: 500
                                    }}
                                >
                                    <Camera size={18} /> Загрузить
                                </label>
                            </div>

                            {avatarPreview && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff6b6b',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        width: 'auto',
                                        marginTop: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Username Field */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#888' }}>
                        <User size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Никнейм</span>
                    </div>
                    {editing ? (
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Никнейм"
                            style={{ margin: 0 }}
                        />
                    ) : (
                        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{user.username}</div>
                    )}
                </div>

                {/* Email Field */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#888' }}>
                        <Mail size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Email</span>
                    </div>
                    {editing ? (
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={{ margin: 0 }}
                        />
                    ) : (
                        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{user.email}</div>
                    )}
                </div>

                {/* Password Field */}
                {editing && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#888' }}>
                            <Lock size={18} />
                            <span style={{ fontSize: '0.9rem' }}>Новый пароль (необязательно)</span>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите новый пароль для изменения"
                            style={{ margin: 0 }}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                {editing && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleSave} style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                            <Save size={18} /> Сохранить
                        </button>
                        <button onClick={handleCancel} style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={18} /> Отмена
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Account;
