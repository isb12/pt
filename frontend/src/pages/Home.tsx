import { useAppContext } from '../context/AppContext';

const Home = () => {
    const { user, loading } = useAppContext();

    if (loading || !user) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="space-y-2 max-w-2xl px-4">
                <h1 className="text-4xl font-bold tracking-tight">Добро пожаловать, {user.username}!</h1>
                <p className="text-xl text-muted-foreground">
                    Вы успешно вошли в систему управления бизнесом.
                </p>
            </div>
        </div>
    );
};

export default Home;
