import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

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
            toast.error("Username должен быть не менее 3 символов");
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
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Создать аккаунт</CardTitle>
                        <CardDescription>
                            Присоединяйтесь к нашей системе управления компаниями
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="username">Username</FieldLabel>
                                    <Input
                                        id="username"
                                        placeholder="mycompany123"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field className="mb-2">
                                    <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pr-10"
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
                                </Field>
                                <Field>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Загрузка..." : "Зарегистрироваться"}
                                    </Button>
                                    <div className="text-center text-sm text-muted-foreground mt-2">
                                        Уже есть аккаунт?{" "}
                                        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                                            Войти
                                        </Link>
                                    </div>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
