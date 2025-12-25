import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Building2,
    CreditCard,
    MapPin,
    Users,
    Upload,
    Plus,
    Trash2,
    Save,
    Loader2
} from 'lucide-react';

const CompanySettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get('/companies/my');
                setFormData(response.data);
            } catch (err) {
                setError('Не удалось загрузить данные компании');
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await api.put('/companies/my', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при сохранении данных');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-content">Загрузка...</div>;
    if (!formData) return <div className="page-content text-danger">{error || 'Компания не найдена'}</div>;

    return (
        <div className="page-content">
            <div className="settings-header">
                <h1>Настройки компании</h1>
                <p>Управление юридическими данными, счетами и ответственными лицами</p>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Данные успешно сохранены!</div>}

                <div className="settings-section">
                    <h2><Building2 size={20} /> Основная информация</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Название компании</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
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
                            <input name="bin_iin" value={formData.bin_iin} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Кбе</label>
                            <input name="kbe" value={formData.kbe} onChange={handleChange} required />
                        </div>
                        <div className="checkbox-row" style={{ gridColumn: 'span 2' }}>
                            <input type="checkbox" name="vat_status" checked={formData.vat_status} onChange={handleChange} id="vat" />
                            <label htmlFor="vat">Плательщик НДС</label>
                        </div>
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

                <div className="settings-section">
                    <h2><CreditCard size={20} /> Банковские счета</h2>
                    {formData.bank_accounts.map((ba, index) => (
                        <div key={index} className="nested-form-block">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>ИИК (Счёт)</label>
                                    <input value={ba.iik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'iik', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Банк</label>
                                    <input value={ba.bank_name} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bank_name', e.target.value)} />
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
                                    </select>
                                </div>
                            </div>
                            <div className="flex-row">
                                <div className="checkbox-row">
                                    <input type="checkbox" checked={ba.is_primary} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'is_primary', e.target.checked)} id={`pba-${index}`} />
                                    <label htmlFor={`pba-${index}`}>Основной</label>
                                </div>
                                <button type="button" className="icon-btn danger" onClick={() => removeListItem('bank_accounts', index)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="secondary-btn" onClick={() => addListItem('bank_accounts', { iik: '', bank_name: '', bik: '', currency: 'KZT', is_primary: false })}>
                        <Plus size={16} /> Добавить счет
                    </button>
                </div>

                <div className="settings-section">
                    <h2><MapPin size={20} /> Адреса и Контакты</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Телефон</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Сайт</label>
                            <input name="website" value={formData.website} onChange={handleChange} />
                        </div>
                    </div>
                    {formData.addresses.map((addr, index) => (
                        <div key={index} className="nested-form-block">
                            <div className="input-group">
                                <label>Адрес</label>
                                <input value={addr.full_address} onChange={(e) => handleNestedChange(index, 'addresses', 'full_address', e.target.value)} />
                            </div>
                            <div className="flex-row">
                                <div className="checkbox-row">
                                    <input type="checkbox" checked={addr.is_legal} onChange={(e) => handleNestedChange(index, 'addresses', 'is_legal', e.target.checked)} id={`laddr-${index}`} />
                                    <label htmlFor={`laddr-${index}`}>Юридический</label>
                                </div>
                                <button type="button" className="icon-btn danger" onClick={() => removeListItem('addresses', index)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="secondary-btn" onClick={() => addListItem('addresses', { full_address: '', is_legal: false })}>
                        <Plus size={16} /> Добавить адрес
                    </button>
                </div>

                <div className="settings-section">
                    <h2><Users size={20} /> Ответственные лица</h2>
                    {formData.responsible_persons.map((person, index) => (
                        <div key={index} className="nested-form-block">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>ФИО ({person.role})</label>
                                    <input value={person.full_name} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'full_name', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>ИИН</label>
                                    <input value={person.iin} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'iin', e.target.value)} />
                                </div>
                            </div>
                            <div className="media-item" style={{ marginTop: '1rem' }}>
                                <label>Подпись</label>
                                <div className="upload-box small" onClick={() => document.getElementById(`sig-${index}`).click()}>
                                    {person.signature_stamp ? <img src={person.signature_stamp} alt="Sig" /> : <Upload size={16} />}
                                    <input type="file" id={`sig-${index}`} hidden onChange={(e) => handlePersonFileChange(index, e.target.files[0])} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>
        </div>
    );
};

export default CompanySettings;
