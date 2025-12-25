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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const CompanySettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get('/companies/my');
                setFormData(response.data);
            } catch (err) {
                toast.error('Не удалось загрузить данные компании');
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNestedChange = (index: number, collection: string, field: string, value: any) => {
        const updated = [...formData[collection]];
        updated[index] = { ...updated[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, [collection]: updated }));
    };

    const addListItem = (collection: string, itemTemplate: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [collection]: [...prev[collection], itemTemplate]
        }));
    };

    const removeListItem = (collection: string, index: number) => {
        if (formData[collection].length > 1) {
            const updated = formData[collection].filter((_: any, i: number) => i !== index);
            setFormData((prev: any) => ({ ...prev, [collection]: updated }));
        }
    };

    const handlePersonFileChange = (index: number, file: File | undefined) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleNestedChange(index, 'responsible_persons', 'signature_stamp', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/companies/my', formData);
            toast.success("Данные успешно сохранены!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении данных');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;
    if (!formData) return <div>Компания не найдена</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Настройки компании</h1>
                    <p className="text-muted-foreground">Управление юридическими данными и счетами</p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="shadow-lg">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Сохранить изменения
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" /> Основная информация
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Название компании</Label>
                                <Input name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Тип</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData((p: any) => ({ ...p, type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ТОО">ТОО</SelectItem>
                                        <SelectItem value="ИП">ИП</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>БИН / ИИН</Label>
                                <Input name="bin_iin" value={formData.bin_iin} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Кбе</Label>
                                <Input name="kbe" value={formData.kbe} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="vat" checked={formData.vat_status} onCheckedChange={(v) => setFormData((p: any) => ({ ...p, vat_status: v }))} />
                            <Label htmlFor="vat">Плательщик НДС</Label>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label>Логотип</Label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 h-32 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => document.getElementById('logo-up')?.click()}>
                                    {formData.logo ? <img src={formData.logo} className="h-full w-auto object-contain" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                                    <input type="file" id="logo-up" hidden onChange={(e) => handleFileChange(e, 'logo')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Печать компании</Label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 h-32 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => document.getElementById('stamp-up')?.click()}>
                                    {formData.stamp ? <img src={formData.stamp} className="h-full w-auto object-contain" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                                    <input type="file" id="stamp-up" hidden onChange={(e) => handleFileChange(e, 'stamp')} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Accounts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" /> Банковские счета
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.bank_accounts.map((ba: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/10">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">ИИК (Счёт)</Label>
                                        <Input value={ba.iik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'iik', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Банк</Label>
                                        <Input value={ba.bank_name} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bank_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">БИК</Label>
                                        <Input value={ba.bik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bik', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Валюта</Label>
                                        <Select value={ba.currency} onValueChange={(v) => handleNestedChange(index, 'bank_accounts', 'currency', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="KZT">KZT</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`pba-${index}`} checked={ba.is_primary} onCheckedChange={(v) => handleNestedChange(index, 'bank_accounts', 'is_primary', v)} />
                                        <Label htmlFor={`pba-${index}`} className="text-xs">Основной</Label>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => removeListItem('bank_accounts', index)}>
                                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Удалить
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full h-10 border-dashed" onClick={() => addListItem('bank_accounts', { iik: '', bank_name: '', bik: '', currency: 'KZT', is_primary: false })}>
                            <Plus className="h-4 w-4 mr-2" /> Добавить счет
                        </Button>
                    </CardContent>
                </Card>

                {/* Addresses & Contacts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" /> Адреса и Контакты
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Телефон</Label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Сайт</Label>
                                <Input name="website" value={formData.website} onChange={handleChange} />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            {formData.addresses.map((addr: any, index: number) => (
                                <div key={index} className="p-4 border rounded-lg bg-muted/10 space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Адрес</Label>
                                        <Input value={addr.full_address} onChange={(e) => handleNestedChange(index, 'addresses', 'full_address', e.target.value)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id={`laddr-${index}`} checked={addr.is_legal} onCheckedChange={(v) => handleNestedChange(index, 'addresses', 'is_legal', v)} />
                                            <Label htmlFor={`laddr-${index}`} className="text-xs">Юридический</Label>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => removeListItem('addresses', index)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full h-10 border-dashed" onClick={() => addListItem('addresses', { full_address: '', is_legal: false })}>
                                <Plus className="h-4 w-4 mr-2" /> Добавить адрес
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsible Persons */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Ответственные лица
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {formData.responsible_persons.map((person: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg bg-primary/5 border-primary/10 flex gap-6 items-start">
                                <div className="grid flex-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">ФИО ({person.role})</Label>
                                        <Input value={person.full_name} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'full_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">ИИН</Label>
                                        <Input value={person.iin} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'iin', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 group">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Подпись</Label>
                                    <div className="h-10 w-16 border-2 border-dashed rounded flex items-center justify-center overflow-hidden cursor-pointer hover:bg-background transition-colors" onClick={() => document.getElementById(`sig-${index}`)?.click()}>
                                        {person.signature_stamp ? <img src={person.signature_stamp} className="h-full w-full object-contain" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                                        <input type="file" id={`sig-${index}`} hidden onChange={(e) => handlePersonFileChange(index, e.target.files?.[0])} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CompanySettings;
