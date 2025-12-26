import { useState, useEffect } from 'react';
import api from '../api';
import { useAppContext } from '../context/AppContext';
import { Camera, Loader2 } from 'lucide-react';
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const Account = () => {
    const { user: contextUser, fetchUser } = useAppContext();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const hasProfileChanges = user && (
        username !== user.username ||
        avatar !== null
    );

    const hasSecurityChanges = user && (
        email !== user.email ||
        password !== ''
    );

    useEffect(() => {
        if (contextUser) {
            setUser(contextUser);
            setUsername(contextUser.username);
            setEmail(contextUser.email);
            setAvatarPreview(contextUser.avatar);
            setLoading(false);
        } else {
            fetchUser();
        }
    }, [contextUser, fetchUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Размер файла не должен превышать 2МБ");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatar(result);
                setAvatarPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!/^[a-z0-9]*$/.test(username)) {
            toast.error('Username может содержать только строчные английские буквы и цифры');
            return;
        }

        setSaving(true);
        try {
            const payload: any = { username };
            if (avatar !== null) payload.avatar = avatar;

            const response = await api.put('/users/me', payload);
            setUser(response.data);
            await fetchUser(); // Update global context
            toast.success('Профиль обновлен');
            setAvatar(null);
            setAvatarPreview(response.data.avatar);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        setSaving(true);
        try {
            const payload: any = { email };
            if (password) payload.password = password;

            const response = await api.put('/users/me', payload);
            setUser(response.data);
            await fetchUser(); // Update global context
            toast.success('Данные безопасности обновлены');
            setPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        setUsername(user.username);
        setAvatar(null);
        setAvatarPreview(user.avatar);
    };

    const handleCancelSecurity = () => {
        setEmail(user.email);
        setPassword('');
    };

    if (loading || !user) return null;

    return (
        <div className="max-w-[700px] mx-auto space-y-6 py-4">
            {/* Profile Section */}
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider text-center md:text-left">
                    Профиль
                </h2>

                <Card className="shadow-sm border-border/50 overflow-hidden bg-card p-0 gap-0">
                    {/* Avatar Item */}
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="space-y-0.5">
                            <Label className="text-[14px] font-medium">Аватар</Label>
                            <p className="text-[12px] text-muted-foreground">
                                Нажмите на аватар, чтобы загрузить новый
                            </p>
                        </div>
                        <label className="cursor-pointer group relative">
                            <Avatar className="h-12 w-12 border-2 group-hover:opacity-80 transition-opacity">
                                <AvatarImage src={avatarPreview || undefined} alt={username} />
                                <AvatarFallback className="text-lg bg-primary/5 text-primary">
                                    {username[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="size-4 text-white drop-shadow-md" />
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    {/* Username Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4 border-t border-border/40">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Username</Label>
                            <p className="text-[12px] text-muted-foreground">
                                Имя пользователя отображается во всех разделах панели управления.
                            </p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                                placeholder="Username"
                            />
                        </div>
                    </div>

                    {/* Footer Save Area */}
                    <CardFooter className="bg-muted/40 p-3 px-5 flex justify-end gap-3 border-t border-border/40">
                        {hasProfileChanges && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-normal" onClick={handleCancelProfile} disabled={saving}>
                                Сбросить
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="px-5 h-8 font-medium text-xs rounded-md shadow-sm"
                            disabled={!hasProfileChanges || saving}
                            onClick={handleSaveProfile}
                        >
                            {saving ? <Loader2 className="size-3 mr-2 animate-spin" /> : null}
                            Сохранить
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            {/* Security Section */}
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider text-center md:text-left">
                    Безопасность
                </h2>

                <Card className="shadow-sm border-border/50 overflow-hidden bg-card p-0 gap-0">
                    {/* Email Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Email</Label>
                            <p className="text-[12px] text-muted-foreground">
                                Основной адрес почты для уведомлений аккаунта.
                            </p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                                placeholder="Email"
                            />
                        </div>
                    </div>

                    {/* Password Item */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 gap-4 border-t border-border/40">
                        <div className="space-y-0.5 max-w-[340px]">
                            <Label className="text-[14px] font-medium">Пароль</Label>
                            <p className="text-[12px] text-muted-foreground">
                                Изменить пароль для входа в аккаунт
                            </p>
                        </div>
                        <div className="flex-1 max-w-[320px] w-full">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-muted/10 border-border/50 h-9 text-sm focus-visible:ring-primary/20"
                                placeholder="Введите новый пароль"
                            />
                        </div>
                    </div>

                    {/* Footer Save Area */}
                    <CardFooter className="bg-muted/40 p-3 px-5 flex justify-end gap-3 border-t border-border/40">
                        {hasSecurityChanges && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-normal" onClick={handleCancelSecurity} disabled={saving}>
                                Сбросить
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="px-5 h-8 font-medium text-xs rounded-md shadow-sm"
                            disabled={!hasSecurityChanges || saving}
                            onClick={handleSaveSecurity}
                        >
                            {saving ? <Loader2 className="size-3 mr-2 animate-spin" /> : null}
                            Сохранить
                        </Button>
                    </CardFooter>
                </Card>
            </section>
        </div>
    );
};

export default Account;
