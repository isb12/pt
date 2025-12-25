import { useTheme } from "@/components/theme-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

const Settings = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
                <p className="text-muted-foreground">
                    Управление параметрами приложения и интерфейса.
                </p>
            </div>
            <Separator />

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Интерфейс</h2>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Тема оформления</CardTitle>
                        <CardDescription>
                            Выберите между темной и светлой темой для комфортной работы.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-full">
                                {theme === "dark" ? (
                                    <Moon className="size-5 text-primary" />
                                ) : (
                                    <Sun className="size-5 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {theme === "dark" ? "Темная тема" : "Светлая тема"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Переключите режим отображения интерфейса.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="theme-mode" className="sr-only">
                                Переключить тему
                            </Label>
                            <Switch
                                id="theme-mode"
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default Settings
