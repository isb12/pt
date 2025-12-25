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
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
                if (response.data.has_company) {
                    navigate('/');
                }
            } catch (err) {
                navigate('/login');
            } finally {
                setUserLoading(false);
            }
        };
        checkAuth();
    }, [navigate]);

    // Form data
    const [formData, setFormData] = useState<any>({
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

    const handleSubmit = async () => {
        setLoading(true);
        const cleanedData = {
            ...formData,
            responsible_persons: formData.responsible_persons.map((p: any) => ({
                ...p,
                birth_date: p.birth_date === '' ? null : p.birth_date
            }))
        };

        try {
            await api.post('/companies/', cleanedData);
            toast.success("Компания успешно зарегистрирована!");
            window.location.href = '/';
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении данных');
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) return null;

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Регистрация компании</h1>
                    <p className="text-muted-foreground text-lg">Заполните данные для начала работы в системе</p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <React.Fragment key={s}>
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${step >= s ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted-foreground/30 text-muted-foreground'
                                        }`}
                                >
                                    {step > s ? <CheckCircle2 size={20} /> : s}
                                </div>
                                {s < 4 && <div className={`h-0.5 w-12 md:w-20 ${step > s ? 'bg-primary' : 'bg-muted-foreground/30'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <Card className="shadow-lg border-2 border-primary/5">
                    <CardHeader className="bg-primary/5 border-b py-6">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            {step === 1 && <><Building2 className="text-primary" /> Юридическая информация</>}
                            {step === 2 && <><CreditCard className="text-primary" /> Банковские счета</>}
                            {step === 3 && <><MapPin className="text-primary" /> Адреса и Контакты</>}
                            {step === 4 && <><Users className="text-primary" /> Ответственные лица</>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        {step === 1 && (
                            <div className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Название компании</Label>
                                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="ТОО 'Моя Компания'" />
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
                                        <Input name="bin_iin" value={formData.bin_iin} onChange={handleChange} placeholder="12 цифр" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Код бенефициара (Кбе)</Label>
                                        <Input name="kbe" value={formData.kbe} onChange={handleChange} placeholder="17" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="vat" checked={formData.vat_status} onCheckedChange={(v) => setFormData((p: any) => ({ ...p, vat_status: v }))} />
                                    <label htmlFor="vat" className="text-sm font-medium">Плательщик НДС</label>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <Label>Логотип</Label>
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => document.getElementById('logo-up')?.click()}>
                                            {formData.logo ? <img src={formData.logo} className="h-20 w-auto object-contain" /> : <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />}
                                            <span className="text-xs text-muted-foreground mt-2">Загрузить JPG/PNG</span>
                                            <input type="file" id="logo-up" hidden onChange={(e) => handleFileChange(e, 'logo')} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Печать компании</Label>
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => document.getElementById('stamp-up')?.click()}>
                                            {formData.stamp ? <img src={formData.stamp} className="h-20 w-auto object-contain" /> : <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />}
                                            <span className="text-xs text-muted-foreground mt-2">Загрузить JPG/PNG</span>
                                            <input type="file" id="stamp-up" hidden onChange={(e) => handleFileChange(e, 'stamp')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                {formData.bank_accounts.map((ba: any, index: number) => (
                                    <div key={index} className="relative p-6 border rounded-xl bg-muted/20">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Номер счёта (ИИК)</Label>
                                                <Input value={ba.iik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'iik', e.target.value)} placeholder="KZ..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Название банка</Label>
                                                <Input value={ba.bank_name} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bank_name', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>БИК</Label>
                                                <Input value={ba.bik} onChange={(e) => handleNestedChange(index, 'bank_accounts', 'bik', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Валюта</Label>
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
                                        <div className="flex items-center justify-between mt-4 pb-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id={`pba-${index}`} checked={ba.is_primary} onCheckedChange={(v) => handleNestedChange(index, 'bank_accounts', 'is_primary', v)} />
                                                <Label htmlFor={`pba-${index}`}>Основной счёт</Label>
                                            </div>
                                            {formData.bank_accounts.length > 1 && (
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeListItem('bank_accounts', index)}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Удалить
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full dashed border-2 border-dashed h-12" onClick={() => addListItem('bank_accounts', { iik: '', bank_name: '', bik: '', currency: 'KZT', is_primary: false })}>
                                    <Plus className="h-4 w-4 mr-2" /> Добавить счёт
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">Адреса</h3>
                                    {formData.addresses.map((addr: any, index: number) => (
                                        <div key={index} className="space-y-4 p-6 border rounded-xl bg-muted/20">
                                            <div className="space-y-2">
                                                <Label>Полный адрес</Label>
                                                <Input value={addr.full_address} onChange={(e) => handleNestedChange(index, 'addresses', 'full_address', e.target.value)} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`laddr-${index}`} checked={addr.is_legal} onCheckedChange={(v) => handleNestedChange(index, 'addresses', 'is_legal', v)} />
                                                    <Label htmlFor={`laddr-${index}`}>Юридический адрес</Label>
                                                </div>
                                                {formData.addresses.length > 1 && (
                                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeListItem('addresses', index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full dashed border-2 border-dashed h-12" onClick={() => addListItem('addresses', { full_address: '', is_legal: false })}>
                                        <Plus className="h-4 w-4 mr-2" /> Добавить адрес
                                    </Button>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Контакты компании</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Телефон</Label>
                                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+7..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input name="email" value={formData.email} onChange={handleChange} type="email" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Сайт</Label>
                                            <Input name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="grid gap-6">
                                {formData.responsible_persons.map((person: any, index: number) => (
                                    <div key={index} className="p-6 border rounded-xl bg-emerald-50/20 border-emerald-100 shadow-sm transition-all hover:shadow-md">
                                        <h3 className="text-lg font-bold text-emerald-800 border-b border-emerald-100 pb-3 mb-4">{person.role}</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>ФИО полностью</Label>
                                                <Input value={person.full_name} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'full_name', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>ИИН</Label>
                                                <Input value={person.iin} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'iin', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Пол</Label>
                                                <Select value={person.gender} onValueChange={(v) => handleNestedChange(index, 'responsible_persons', 'gender', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Мужской">Мужской</SelectItem>
                                                        <SelectItem value="Женский">Женский</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Дата рождения</Label>
                                                <Input type="date" value={person.birth_date || ''} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'birth_date', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Страна резиденства</Label>
                                                <Input value={person.residency} onChange={(e) => handleNestedChange(index, 'responsible_persons', 'residency', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Подпись</Label>
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 h-[80px] hover:bg-muted/50 cursor-pointer" onClick={() => document.getElementById(`sig-${index}`)?.click()}>
                                                    {person.signature_stamp ? <img src={person.signature_stamp} className="h-full w-auto object-contain" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                                    <input type="file" id={`sig-${index}`} hidden onChange={(e) => handlePersonFileChange(index, e.target.files?.[0])} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                        {step > 1 && (
                            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={loading}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Назад
                            </Button>
                        )}
                        <div className="ml-auto flex gap-3">
                            {step < 4 ? (
                                <Button onClick={() => setStep(step + 1)}>
                                    Продолжить <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="px-8 flex items-center gap-2">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Завершить
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Onboarding;
