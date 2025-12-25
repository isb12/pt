import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight } from "lucide-react"

const Home = () => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (err) {
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать, {user.username}!</h1>
                <p className="text-muted-foreground">
                    Вы успешно вошли в систему управления бизнесом.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Моя Компания</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Управление данными</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Реквизиты, счета и ответственные лица
                        </p>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate('/company-settings')}>
                            Перейти <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;
