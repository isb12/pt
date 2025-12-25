import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Placeholder = ({ title }: { title: string }) => {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>В разработке</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Этот раздел появится в ближайших обновлениях.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Placeholder;
