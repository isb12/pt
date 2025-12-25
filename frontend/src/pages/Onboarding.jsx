import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Building2,
    CreditCard,
    MapPin,
    Users,
    Upload,
    Plus,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
                setUserLoading(false);
            } catch (err) {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        type: 'ТОО',
        bin_iin: '',
        kbe: '',
        vat_status: false,
        phone: '',
        email: '',
        website: '',
        logo: null,
        stamp: null,
        bank_accounts: [{ iik: '', bank_name: '', bik: '', currency: 'KZT', is_primary: true }],
        addresses: [{ full_address: '', is_legal: true }],
        responsible_persons: [
            { role: 'Директор', full_name: '', gender: 'Мужской', birth_date: '', iin: '', residency: 'Казахстан', signature_stamp: null },
            { role: 'Главный бухгалтер', full_name: '', gender: 'Женский', birth_date: '', iin: '', residency: 'Казахстан', signature_stamp: null }
        ]
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNestedChange = (index, collection, field, value) => {
        const updated = [...formData[collection]];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, [collection]: updated }));
    };

    const addListItem = (collection, itemTemplate) => {
        setFormData(prev => ({
            ...prev,
            [collection]: [...prev[collection], itemTemplate]
        }));
    };

    const removeListItem = (collection, index) => {
        if (formData[collection].length > 1) {
            const updated = formData[collection].filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, [collection]: updated }));
        }
    };

    const handlePersonFileChange = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleNestedChange(index, 'responsible_persons', 'signature_stamp', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        // Clean data: replace empty strings with null for optional/date fields
        const cleanedData = {
            ...formData,
            responsible_persons: formData.responsible_persons.map(p => ({
                ...p,
                birth_date: p.birth_date === '' ? null : p.birth_date
            }))
        };

        try {
            console.log('Sending onboarding data:', cleanedData);
            await api.post('/companies/', cleanedData);
            window.location.href = '/'; // Force reload to update user state
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при сохранении данных компании');
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="onboarding-step">
                        <h2><Building2 size={24} /> Юридическая информация</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Название компании</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Например, ТОО 'Моя Компания'" required />
                            </div>
                            <div className="input-group">
                                <label>Тип</label>
                                <select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="ТОО">ТОО</option>
                                    <option value="ИП">ИП</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>БИН / ИИН</label>
                                <input name="bin_iin" value={formData.bin_iin} onChange={handleChange} placeholder="12 цифр" required />
                            </div>
                            <div className="input-group">
                                <label>Код бенефициара (Кбе)</label>
                                <input name="kbe" value={formData.kbe} onChange={handleChange} placeholder="Код Кбе" required />
                            </div>
                        </div>
                        <div className="checkbox-row">
                            <input type="checkbox" name="vat_status" checked={formData.vat_status} onChange={handleChange} id="vat" />
                            <label htmlFor="vat">Плательщик НДС</label>
                        </div>
                        <div className="media-upload-grid">
                            <div className="media-item">
                                <label>Логотип</label>
                                <div className="upload-box" onClick={() => document.getElementById('logo-up').click()}>
                                    {formData.logo ? <img src={formData.logo} alt="Logo" /> : <Upload />}
                                    <input type="file" id="logo-up" hidden onChange={(e) => handleFileChange(e, 'logo')} />
                                </div>
                            </div>
                            <div className="media-item">
                                <label>Печать компании</label>
                                <div className="upload-box" onClick={() => document.getElementById('stamp-up').click()}>
                                    {formData.stamp ? <img src={formData.stamp} alt="Stamp" /> : <Upload />}
                                    <input type="file" id="stamp-up" hidden onChange={(e) => handleFileChange(e, 'stamp')} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="onboarding-step">
                        <h2><CreditCard size={24} /> Банковские счета</h2>
                        {formData.bank_accounts.map((ba, index) => (
                            <div key={index} className="nested-form-block">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Номер счёта (ИИК)</label>
                                        <input value={ba.iik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'iik', e.target.value)} placeholder="KZ..." />
                                    </div>
                                    <div className="input-group">
                                        <label>Название банка</label>
                                        <input value={ba.bank_name} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bank_name', e.target.value)} placeholder="Kaspi, Halyk..." />
                                    </div>
                                    <div className="input-group">
                                        <label>БИК</label>
                                        <input value={ba.bik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bik', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Валюта</label>
                                        <select value={ba.currency} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'currency', e.target.value)}>
                                            <option value="KZT">KZT</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="RUB">RUB</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <div className="checkbox-row" style={{ margin: 0 }}>
                                        <input type="checkbox" checked={ba.is_primary} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'is_primary', e.target.checked)} id={`pba-${index}`} />
                                        <label htmlFor={`pba-${index}`}>Основной счёт</label>
                                    </div>
                                    {formData.bank_accounts.length > 1 && (
                                        <button className="icon-btn danger" onClick={() => removeListItem('bank_accounts', index)}><Trash2 size={16} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button className="secondary-btn" onClick={() => addListItem('bank_accounts', { iik: '', bank_name: '', bik: '', currency: 'KZT', is_primary: false })}>
                            <Plus size={16} /> Добавить счёт
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="onboarding-step">
                        <h2><MapPin size={24} /> Адреса и Контакты</h2>
                        <div className="form-section">
                            <h3>Адреса</h3>
                            {formData.addresses.map((addr, index) => (
                                <div key={index} className="nested-form-block">
                                    <div className="input-group">
                                        <label>Полный адрес</label>
                                        <input value={addr.full_address} onChange={(e) => handleNestedChange(index, 'addresses', 'full_address', e.target.value)} placeholder="Страна, город, улица, дом..." />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <div className="checkbox-row" style={{ margin: 0 }}>
                                            <input type="checkbox" checked={addr.is_legal} onChange={(e) => handleNestedChange(index, 'addresses', 'is_legal', e.target.checked)} id={`laddr-${index}`} />
                                            <label htmlFor={`laddr-${index}`}>Юридический адрес</label>
                                        </div>
                                        {formData.addresses.length > 1 && (
                                            <button className="icon-btn danger" onClick={() => removeListItem('addresses', index)}><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="secondary-btn" onClick={() => addListItem('addresses', { full_address: '', is_legal: false })}>
                                <Plus size={16} /> Добавить адрес
                            </button>
                        </div>
                        <div className="form-section" style={{ marginTop: '2rem' }}>
                            <h3>Контакты</h3>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Телефон</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+7..." />
                                </div>
                                <div className="input-group">
                                    <label>Email компании</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="info@company.kz" />
                                </div>
                                <div className="input-group">
                                    <label>Веб-сайт</label>
                                    <input name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="onboarding-step">
                        <h2><Users size={24} /> Ответственные лица</h2>
                        {formData.responsible_persons.map((person, index) => (
                            <div key={index} className="nested-form-block bg-accent">
                                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>{person.role}</h3>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>ФИО полностью</label>
                                        <input value={person.full_name} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'full_name', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>ИИН</label>
                                        <input value={person.iin} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'iin', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Пол</label>
                                        <select value={person.gender} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'gender', e.target.value)}>
                                            <option value="Мужской">Мужской</option>
                                            <option value="Женский">Женский</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Дата рождения</label>
                                        <input type="date" value={person.birth_date} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'birth_date', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Страна резиденства</label>
                                        <input value={person.residency} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'residency', e.target.value)} />
                                    </div>
                                    <div className="media-item">
                                        <label>Подпись</label>
                                        <div className="upload-box small" onClick={() => document.getElementById(`sig-${index}`).click()}>
                                            {person.signature_stamp ? <img src={person.signature_stamp} alt="Sig" /> : <Upload size={16} />}
                                            <input type="file" id={`sig-${index}`} hidden onChange={(e) => handlePersonFileChange(index, e.target.files[0])} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    if (userLoading) {
        return <div className="onboarding-wrapper"><div className="onboarding-card">Загрузка...</div></div>;
    }

    return (
        <div className="onboarding-page">
            <Navbar user={user} />
            <div className="onboarding-wrapper">
                <div className="onboarding-card">
                    <div className="onboarding-progress">
                        <div className="progress-track">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                                    {step > s ? <CheckCircle2 size={18} /> : s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

                    <div className="step-content">
                        {renderStep()}
                    </div>

                    <div className="onboarding-actions">
                        {step > 1 && (
                            <button className="secondary-btn" onClick={() => setStep(step - 1)} disabled={loading}>
                                Назад
                            </button>
                        )}
                        {step < 4 ? (
                            <button onClick={() => setStep(step + 1)} style={{ marginLeft: 'auto' }}>
                                Продолжить
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: 'auto' }}>
                                {loading ? 'Сохранение...' : 'Завершить регистрацию'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
