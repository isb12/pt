import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAppContext } from '../context/AppContext';
import {
    Upload,
    Trash2,
    Loader2,
    Pencil,
    Camera
} from 'lucide-react';
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const CompanySettings = () => {
    const { company: contextCompany, fetchCompany } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [initialData, setInitialData] = useState<any>(null);
    const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

    // Bank Account Modal State
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [editingBankIndex, setEditingBankIndex] = useState<number | null>(null);
    const [bankAccountForm, setBankAccountForm] = useState({
        bank_name: '',
        iik: '',
        bik: '',
        currency: 'KZT',
        is_primary: false
    });

    // Address Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState({
        full_address: '',
        is_legal: false
    });

    // Responsible Person Modal State
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
    const [personForm, setPersonForm] = useState({
        full_name: '',
        iin: '',
        role: '',
        birth_date: '',
        gender: 'Male',
        residency: 'Resident',
        signature_stamp: ''
    });

    useEffect(() => {
        if (contextCompany) {
            setFormData(contextCompany);
            setInitialData(contextCompany);
            setLoading(false);
        } else {
            const loadData = async () => {
                await fetchCompany();
            };
            loadData();
        }
    }, [contextCompany, fetchCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                // Optimistic UI update
                setFormData((prev: any) => ({ ...prev, [field]: base64 }));

                // Auto-save branding
                try {
                    const updatedData = { ...formData, [field]: base64 };
                    const response = await api.put('/companies/my', updatedData);
                    setFormData(response.data);
                    setInitialData(response.data);
                    await fetchCompany(); // Update global context
                    toast.success("Изображение обновлено");
                } catch (err: any) {
                    toast.error("Не удалось сохранить изображение");
                    // Rollback on error
                    setFormData((prev: any) => ({ ...prev, [field]: initialData[field] }));
                }
            };
            reader.readAsDataURL(file);
        }
    };





    const handleSave = async (sectionLabel: string) => {
        setSaving(true);
        try {
            const response = await api.put('/companies/my', formData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success(`Данные (${sectionLabel}) успешно сохранены!`);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleResetBasic = () => {
        setFormData((p: any) => ({
            ...p,
            name: initialData.name,
            bin_iin: initialData.bin_iin,
            type: initialData.type,
            vat_status: initialData.vat_status,
            kbe: initialData.kbe
        }));
    };

    // Bank Account Modal Helpers
    const handleAddBank = () => {
        setEditingBankIndex(null);
        setBankAccountForm({
            bank_name: '',
            iik: '',
            bik: '',
            currency: 'KZT',
            is_primary: formData.bank_accounts.length === 0
        });
        setIsBankModalOpen(true);
    };

    const handleEditBank = (index: number) => {
        setEditingBankIndex(index);
        setBankAccountForm({ ...formData.bank_accounts[index] });
        setIsBankModalOpen(true);
    };

    const handleSaveBankModal = async () => {
        const updatedAccounts = [...formData.bank_accounts];

        // If this one is primary, unset others
        if (bankAccountForm.is_primary) {
            updatedAccounts.forEach((acc: any) => acc.is_primary = false);
        }

        if (editingBankIndex === null) {
            updatedAccounts.push(bankAccountForm);
        } else {
            updatedAccounts[editingBankIndex] = bankAccountForm;
        }

        const updatedFormData = { ...formData, bank_accounts: updatedAccounts };
        setFormData(updatedFormData);
        setIsBankModalOpen(false);

        // Bonus: trigger save to backend
        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Список счетов обновлен");
        } catch (err: any) {
            toast.error("Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveBank = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedAccounts = formData.bank_accounts.filter((_: any, i: number) => i !== index);
        const updatedFormData = { ...formData, bank_accounts: updatedAccounts };

        setFormData(updatedFormData);
        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Счет удален");
        } catch (err: any) {
            toast.error("Ошибка при удалении");
        } finally {
            setSaving(false);
        }
    };

    // Address Modal Helpers
    const handleAddAddress = () => {
        setEditingAddressIndex(null);
        setAddressForm({
            full_address: '',
            is_legal: formData.addresses.length === 0
        });
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (index: number) => {
        setEditingAddressIndex(index);
        setAddressForm({ ...formData.addresses[index] });
        setIsAddressModalOpen(true);
    };

    const handleSaveAddressModal = async () => {
        const updatedAddresses = [...formData.addresses];

        if (addressForm.is_legal) {
            updatedAddresses.forEach((addr: any) => addr.is_legal = false);
        }

        if (editingAddressIndex === null) {
            updatedAddresses.push(addressForm);
        } else {
            updatedAddresses[editingAddressIndex] = addressForm;
        }

        const updatedFormData = { ...formData, addresses: updatedAddresses };
        setFormData(updatedFormData);
        setIsAddressModalOpen(false);

        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Список адресов обновлен");
        } catch (err: any) {
            toast.error("Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveAddress = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedAddresses = formData.addresses.filter((_: any, i: number) => i !== index);
        const updatedFormData = { ...formData, addresses: updatedAddresses };

        setFormData(updatedFormData);
        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Адрес удален");
        } catch (err: any) {
            toast.error("Ошибка при удалении");
        } finally {
            setSaving(false);
        }
    };

    // Responsible Person Modal Helpers
    const handleAddPerson = () => {
        setEditingPersonIndex(null);
        setPersonForm({
            full_name: '',
            iin: '',
            role: '',
            birth_date: '',
            gender: 'Male',
            residency: 'Resident',
            signature_stamp: ''
        });
        setIsPersonModalOpen(true);
    };

    const handleEditPerson = (index: number) => {
        setEditingPersonIndex(index);
        setPersonForm({ ...formData.responsible_persons[index] });
        setIsPersonModalOpen(true);
    };

    const handleSavePersonModal = async () => {
        const updatedPersons = [...formData.responsible_persons];

        if (editingPersonIndex === null) {
            updatedPersons.push(personForm);
        } else {
            updatedPersons[editingPersonIndex] = personForm;
        }

        const updatedFormData = { ...formData, responsible_persons: updatedPersons };
        setFormData(updatedFormData);
        setIsPersonModalOpen(false);

        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Данные ответственных лиц обновлены");
        } catch (err: any) {
            toast.error("Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePerson = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedPersons = formData.responsible_persons.filter((_: any, i: number) => i !== index);
        const updatedFormData = { ...formData, responsible_persons: updatedPersons };

        setFormData(updatedFormData);
        try {
            setSaving(true);
            const response = await api.put('/companies/my', updatedFormData);
            setFormData(response.data);
            setInitialData(response.data);
            await fetchCompany(); // Update global context
            toast.success("Лицо удалено");
        } catch (err: any) {
            toast.error("Ошибка при удалении");
        } finally {
            setSaving(false);
        }
    };

    const handlePersonModalFileChange = (file: File | undefined) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPersonForm(p => ({ ...p, signature_stamp: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };



    const handleResetContact = () => {
        setFormData((p: any) => ({
            ...p,
            phone: initialData.phone,
            email: initialData.email,
            website: initialData.website
        }));
    };



    const hasBasicChanges = initialData && (
        formData.name !== initialData.name ||
        formData.bin_iin !== initialData.bin_iin ||
        formData.type !== initialData.type ||
        formData.vat_status !== initialData.vat_status ||
        formData.kbe !== initialData.kbe
    );

    const hasContactChanges = initialData && (
        formData.phone !== initialData.phone ||
        formData.email !== initialData.email ||
        formData.website !== initialData.website
    );

    if (loading) return null;
    if (!formData) return <div className="p-8 text-center text-muted-foreground">Компания не найдена</div>;

    return (
        <div className="max-w-[700px] mx-auto space-y-8 py-4 pb-12">
            {/* Basic Info Section (Top, Preview Style) */}
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
                    Основная информация
                </h2>
                <Card className="shadow-sm border-border/50 bg-card p-6 px-7 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {formData.type} {formData.name}
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground border-border/60"
                                onClick={() => setIsBasicModalOpen(true)}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">ИИН/БИН</p>
                            <p className="text-[15px] font-medium">{formData.bin_iin}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">Кбе</p>
                            <p className="text-[15px] font-medium">{formData.kbe || '—'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">Тип компании</p>
                            <p className="text-[15px] font-medium">{formData.type}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-semibold">НДС</p>
                            <p className="text-[15px] font-medium">
                                {formData.vat_status ? 'Плательщик НДС' : 'Без НДС'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Basic Info Dialog (Editor) */}
                <Dialog open={isBasicModalOpen} onOpenChange={setIsBasicModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Редактировать основные данные</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Название компании</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">БИН / ИИН</Label>
                                    <Input
                                        name="bin_iin"
                                        value={formData.bin_iin}
                                        onChange={handleChange}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Кбе</Label>
                                    <Input
                                        name="kbe"
                                        value={formData.kbe || ''}
                                        onInput={(e: any) => setFormData((p: any) => ({ ...p, kbe: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Тип компании</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData((p: any) => ({ ...p, type: v }))}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ТОО">ТОО (Товарищество с огран. отв.)</SelectItem>
                                        <SelectItem value="ИП">ИП (Индивидуальный предприниматель)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="vat-modal"
                                    checked={formData.vat_status}
                                    onCheckedChange={(v) => setFormData((p: any) => ({ ...p, vat_status: !!v }))}
                                />
                                <Label htmlFor="vat-modal" className="cursor-pointer">Плательщик НДС</Label>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => { handleResetBasic(); setIsBasicModalOpen(false); }}>
                                Отмена
                            </Button>
                            <Button
                                onClick={async () => {
                                    await handleSave("Основная информация");
                                    setIsBasicModalOpen(false);
                                }}
                                disabled={!hasBasicChanges || saving}
                            >
                                {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>

            {/* Branding Section */}
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
                    Брендинг
                </h2>
                <Card className="shadow-sm border-border/50 overflow-hidden bg-card p-0 gap-0">
                    {/* Logo Item */}
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="space-y-0.5">
                            <Label className="text-[14px] font-medium">Логотип</Label>
                            <p className="text-[12px] text-muted-foreground">Используется в документах</p>
                        </div>
                        <label className="cursor-pointer group relative">
                            <div className="h-14 w-14 border rounded-lg flex items-center justify-center bg-muted/5 group-hover:bg-muted/10 transition-colors overflow-hidden">
                                {formData.logo ? (
                                    <img src={formData.logo} className="h-full w-full object-cover" />
                                ) : (
                                    <Upload className="size-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
                                <Camera className="size-4 text-white drop-shadow-md" />
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                        </label>
                    </div>

                    <div className="h-[1px] bg-border/40 w-full" />

                    {/* Stamp Item */}
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="space-y-0.5">
                            <Label className="text-[14px] font-medium">Печать компании</Label>
                            <p className="text-[12px] text-muted-foreground">Для печати на актах и счетах</p>
                        </div>
                        <label className="cursor-pointer group relative">
                            <div className="h-14 w-14 border rounded-full flex items-center justify-center bg-muted/5 group-hover:bg-muted/10 transition-colors overflow-hidden">
                                {formData.stamp ? (
                                    <img src={formData.stamp} className="h-full w-full object-cover" />
                                ) : (
                                    <Upload className="size-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-full">
                                <Camera className="size-4 text-white drop-shadow-md" />
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'stamp')} />
                        </label>
                    </div>
                </Card>
            </section>

            {/* Bank Accounts Section */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        Банковские счета
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 uppercase tracking-tight"
                        onClick={handleAddBank}
                    >
                        + Добавить счет
                    </Button>
                </div>

                <div className="space-y-3">
                    {formData.bank_accounts.map((ba: any, index: number) => (
                        <Card
                            key={index}
                            className="shadow-none border-border/50 bg-card hover:bg-muted/10 transition-colors p-5 relative cursor-pointer group"
                            onClick={() => handleEditBank(index)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[15px] font-bold tracking-tight">
                                            {ba.bank_name || 'Наименование банка не указано'}
                                        </h3>
                                        {ba.is_primary && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 uppercase tracking-tighter">
                                                основной
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[14px] text-muted-foreground/80 font-medium tabular-nums">
                                        {ba.iik || 'Номер счета не указан'}
                                    </p>
                                    <p className="text-[12px] text-muted-foreground/60">
                                        {ba.bik ? `БИК: ${ba.bik}` : 'БИК не указан'} • {ba.currency}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 -mt-1 -mr-1"
                                    onClick={(e) => handleRemoveBank(index, e)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {formData.bank_accounts.length === 0 && (
                        <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center bg-muted/5">
                            <p className="text-muted-foreground text-sm">Список счетов пуст</p>
                        </Card>
                    )}
                </div>

                {/* Bank Account Modal */}
                <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingBankIndex !== null ? 'Редактировать счет' : 'Добавить банковский счет'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Наименование банка</Label>
                                <Input
                                    value={bankAccountForm.bank_name}
                                    onChange={(e) => setBankAccountForm(p => ({ ...p, bank_name: e.target.value }))}
                                    placeholder="Напр. Kaspi Bank"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">ИИК (Номер счета)</Label>
                                <Input
                                    value={bankAccountForm.iik}
                                    onChange={(e) => setBankAccountForm(p => ({ ...p, iik: e.target.value }))}
                                    placeholder="KZ..."
                                    className="h-10 font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">БИК</Label>
                                    <Input
                                        value={bankAccountForm.bik}
                                        onChange={(e) => setBankAccountForm(p => ({ ...p, bik: e.target.value }))}
                                        placeholder="CASPKZKA"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Валюта</Label>
                                    <Select
                                        value={bankAccountForm.currency}
                                        onValueChange={(v) => setBankAccountForm(p => ({ ...p, currency: v }))}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="KZT">KZT (Тенге)</SelectItem>
                                            <SelectItem value="USD">USD (Доллар)</SelectItem>
                                            <SelectItem value="EUR">EUR (Евро)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="is-primary-modal"
                                    checked={bankAccountForm.is_primary}
                                    onCheckedChange={(v) => setBankAccountForm(p => ({ ...p, is_primary: !!v }))}
                                />
                                <Label htmlFor="is-primary-modal" className="cursor-pointer">Сделать этот счет основным</Label>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsBankModalOpen(false)}>
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSaveBankModal}
                                disabled={saving || !bankAccountForm.bank_name || !bankAccountForm.iik}
                            >
                                {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>

            {/* Contacts Section */}
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
                    Контакты
                </h2>
                <Card className="shadow-sm border-border/50 overflow-hidden bg-card p-0 gap-0">
                    {/* Phone Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Телефон</Label>
                            <p className="text-[12px] text-muted-foreground">Официальный номер телефона компании.</p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="h-[1px] bg-border/40 w-full" />

                    {/* Email Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Email</Label>
                            <p className="text-[12px] text-muted-foreground">Электронная почта для связи.</p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="h-[1px] bg-border/40 w-full" />

                    {/* Website Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Сайт</Label>
                            <p className="text-[12px] text-muted-foreground">Адрес корпоративного сайта.</p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <CardFooter className="bg-muted/40 p-3 px-5 flex justify-end gap-3 border-t border-border/40">
                        {hasContactChanges && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-normal" onClick={handleResetContact} disabled={saving}>
                                Сбросить
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="px-5 h-8 font-medium text-xs rounded-md shadow-sm"
                            disabled={!hasContactChanges || saving}
                            onClick={() => handleSave("Контакты")}
                        >
                            {saving ? <Loader2 className="size-3 mr-2 animate-spin" /> : null}
                            Сохранить
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            {/* Addresses Section */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        Адреса
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 uppercase tracking-tight"
                        onClick={handleAddAddress}
                    >
                        + Добавить адрес
                    </Button>
                </div>

                <div className="space-y-3">
                    {formData.addresses.map((addr: any, index: number) => (
                        <Card
                            key={index}
                            className="shadow-none border-border/50 bg-card hover:bg-muted/10 transition-colors p-5 relative cursor-pointer group"
                            onClick={() => handleEditAddress(index)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-[15px] font-bold tracking-tight">
                                        {addr.full_address || 'Адрес не указан'}
                                    </h3>
                                    <p className="text-[12px] text-muted-foreground/60">
                                        {addr.is_legal ? 'Юридический адрес' : 'Фактический адрес'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 -mt-1 -mr-1"
                                    onClick={(e) => handleRemoveAddress(index, e)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {formData.addresses.length === 0 && (
                        <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center bg-muted/5">
                            <p className="text-muted-foreground text-sm">Список адресов пуст</p>
                        </Card>
                    )}
                </div>

                {/* Address Modal */}
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingAddressIndex !== null ? 'Редактировать адрес' : 'Добавить адрес'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Полный адрес</Label>
                                <Input
                                    value={addressForm.full_address}
                                    onChange={(e) => setAddressForm(p => ({ ...p, full_address: e.target.value }))}
                                    placeholder="г. Алматы, ул. Абая, 1..."
                                    className="h-10"
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="is-legal-modal"
                                    checked={addressForm.is_legal}
                                    onCheckedChange={(v) => setAddressForm(p => ({ ...p, is_legal: !!v }))}
                                />
                                <Label htmlFor="is-legal-modal" className="cursor-pointer">Юридический адрес</Label>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsAddressModalOpen(false)}>
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSaveAddressModal}
                                disabled={saving || !addressForm.full_address}
                            >
                                {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>

            {/* Responsible Persons Section */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        Ответственные лица
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 uppercase tracking-tight"
                        onClick={handleAddPerson}
                    >
                        + Добавить лицо
                    </Button>
                </div>

                <div className="space-y-3">
                    {formData.responsible_persons.map((person: any, index: number) => (
                        <Card
                            key={index}
                            className="shadow-none border-border/50 bg-card hover:bg-muted/10 transition-colors p-5 relative cursor-pointer group"
                            onClick={() => handleEditPerson(index)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-16 border rounded bg-muted/5 flex items-center justify-center overflow-hidden">
                                        {person.signature_stamp ? (
                                            <img src={person.signature_stamp} className="h-full w-full object-contain p-1" />
                                        ) : (
                                            <Upload className="size-4 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[15px] font-bold tracking-tight">
                                            {person.full_name || 'ФИО не указано'}
                                        </h3>
                                        <p className="text-[12px] text-muted-foreground/60">
                                            {person.role || 'Должность не указана'} • ИИН: {person.iin || '---'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                                    onClick={(e) => handleRemovePerson(index, e)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {formData.responsible_persons.length === 0 && (
                        <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center bg-muted/5">
                            <p className="text-muted-foreground text-sm">Список ответственных лиц пуст</p>
                        </Card>
                    )}
                </div>

                {/* Responsible Person Modal */}
                <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPersonIndex !== null ? 'Редактировать лицо' : 'Добавить ответственное лицо'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-sm font-medium">ФИО</Label>
                                    <Input
                                        value={personForm.full_name}
                                        onChange={(e) => setPersonForm(p => ({ ...p, full_name: e.target.value }))}
                                        placeholder="Иванов Иван Иванович"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">ИИН</Label>
                                    <Input
                                        value={personForm.iin}
                                        onChange={(e) => setPersonForm(p => ({ ...p, iin: e.target.value }))}
                                        placeholder="123456789012"
                                        maxLength={12}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Должность</Label>
                                    <Input
                                        value={personForm.role}
                                        onChange={(e) => setPersonForm(p => ({ ...p, role: e.target.value }))}
                                        placeholder="Напр. Директор"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Дата рождения</Label>
                                    <Input
                                        type="date"
                                        value={personForm.birth_date}
                                        onChange={(e) => setPersonForm(p => ({ ...p, birth_date: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Пол</Label>
                                    <Select
                                        value={personForm.gender}
                                        onValueChange={(v) => setPersonForm(p => ({ ...p, gender: v }))}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Мужской</SelectItem>
                                            <SelectItem value="Female">Женский</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Резидентство</Label>
                                    <Select
                                        value={personForm.residency}
                                        onValueChange={(v) => setPersonForm(p => ({ ...p, residency: v }))}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Resident">Резидент РК</SelectItem>
                                            <SelectItem value="NonResident">Нерезидент</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Подпись / Печать</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-20 border rounded bg-muted/5 flex items-center justify-center overflow-hidden shrink-0">
                                            {personForm.signature_stamp ? (
                                                <img src={personForm.signature_stamp} className="h-full w-full object-contain p-1" />
                                            ) : (
                                                <Upload className="size-4 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <label className="cursor-pointer">
                                            <div className="px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-muted transition-colors">
                                                Загрузить
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handlePersonModalFileChange(e.target.files?.[0])}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsPersonModalOpen(false)}>
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSavePersonModal}
                                disabled={saving || !personForm.full_name || !personForm.iin}
                            >
                                {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>
        </div>
    );
};

export default CompanySettings;
