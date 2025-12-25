import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setToken } from '../api';
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
import { Building2, Eye, EyeOff } from "lucide-react"

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/users/token', formData);
            setToken(response.data.access_token);
            toast.success("Вход выполнен успешно");
            navigate('/');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Ошибка входа');
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
                            <Building2 className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
                    <CardDescription>
                        Введите свои данные для доступа к кабинету
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email или Никнейм</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Пароль</Label>
                            </div>
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
                            {loading ? "Загрузка..." : "Войти"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Нет аккаунта?{" "}
                            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                                Зарегистрироваться
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
