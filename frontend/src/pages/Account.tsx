import { useState, useEffect } from 'react';
import api from '../api';
import { Save, X, Edit2, Camera, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const Account = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
            toast.error("Не удалось загрузить данные пользователя");
        } finally {
            setLoading(false);
        }
    };

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

    const handleDeleteAvatar = () => {
        setAvatar("");
        setAvatarPreview(null);
    };

    const handleSave = async () => {
        if (!/^[a-z0-9]*$/.test(username)) {
            toast.error('Никнейм может содержать только строчные английские буквы и цифры');
            return;
        }

        setSaving(true);
        try {
            const payload: any = { username, email };
            if (password) payload.password = password;
            if (avatar !== null) payload.avatar = avatar;

            const response = await api.put('/users/me', payload);
            setUser(response.data);
            toast.success('Данные успешно обновлены');
            setEditing(false);
            setPassword('');
            setAvatar(null);
            setAvatarPreview(response.data.avatar);

            // Reload to update sidebar (could use context/refresh, but for now simple)
            // No need to full reload if we had a state management, but let's just refresh local state
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setUsername(user.username);
        setEmail(user.email);
        setPassword('');
        setAvatar(null);
        setAvatarPreview(user.avatar);
        setEditing(false);
    };

    if (loading) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Аккаунт</h1>
                    <p className="text-muted-foreground">Управление личной информацией и безопасностью</p>
                </div>
                {!editing && (
                    <Button onClick={() => setEditing(true)} variant="outline">
                        <Edit2 className="mr-2 h-4 w-4" /> Изменить
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Профиль</CardTitle>
                    <CardDescription>Измените ваше имя, email и аватар</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Avatar className="h-24 w-24 border-2">
                            <AvatarImage src={avatarPreview || undefined} alt={user.username} />
                            <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                                {user.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {editing && (
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" asChild>
                                    <label className="cursor-pointer">
                                        <Camera className="mr-2 h-4 w-4" /> Загрузить
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </Button>
                                {avatarPreview && (
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteAvatar}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Никнейм</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={!editing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!editing}
                            />
                        </div>
                        {editing && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Новый пароль (необязательно)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Введите новый пароль"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
                {editing && (
                    <CardFooter className="flex gap-3 justify-end border-t p-4">
                        <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                            <X className="mr-2 h-4 w-4" /> Отмена
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Сохранить
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default Account;
