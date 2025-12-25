import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UserPlus, Eye, EyeOff } from "lucide-react"

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase();
        if (/^[a-z0-9]*$/.test(val)) {
            setUsername(val);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (username.length < 3) {
            toast.error("Никнейм должен быть не менее 3 символов");
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/register', { username, email, password });
            toast.success("Регистрация успешна! Теперь вы можете войти.");
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Не удалось зарегистрироваться');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <UserPlus className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Создать аккаунт</CardTitle>
                    <CardDescription>
                        Присоединяйтесь к нашей системе управления компаниями
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Никнейм (только en/0-9)</Label>
                            <Input
                                id="username"
                                placeholder="mycompany123"
                                value={username}
                                onChange={handleUsernameChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Загрузка..." : "Зарегистрироваться"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Уже есть аккаунт?{" "}
                            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                                Войти
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register;
