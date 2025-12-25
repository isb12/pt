import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Dashboard = () => {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Рабочий стол</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Продажи</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0 ₸</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +0% с прошлого месяца
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
