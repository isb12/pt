import { useTheme } from "@/components/theme-provider"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Moon, Sun, Monitor } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Settings = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className="max-w-[700px] mx-auto space-y-6 py-4">
            <section className="space-y-3">
                <h2 className="text-[13px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
                    Интерфейс
                </h2>

                <Card className="shadow-sm border-border/50">
                    <CardContent className="p-0">
                        {/* Theme Section */}
                        <div className="flex items-center justify-between p-4">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Тема</Label>
                                <p className="text-[13px] text-muted-foreground">
                                    Выберите предпочтительную цветовую схему
                                </p>
                            </div>
                            <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-md transition-all duration-200 ease-in-out relative z-10",
                                        theme === "system"
                                            ? "bg-background dark:bg-[#2c2c2d] shadow-sm text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-muted/30"
                                    )}
                                    onClick={() => setTheme("system")}
                                >
                                    <Monitor className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-md transition-all duration-200 ease-in-out relative z-10",
                                        theme === "light"
                                            ? "bg-background dark:bg-[#2c2c2d] shadow-sm text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-muted/30"
                                    )}
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-md transition-all duration-200 ease-in-out relative z-10",
                                        theme === "dark"
                                            ? "bg-background dark:bg-[#2c2c2d] shadow-sm text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-muted/30"
                                    )}
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        {/* Language Section */}
                        <div className="flex items-center justify-between p-4">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Язык</Label>
                                <p className="text-[13px] text-muted-foreground">
                                    Выберите предпочтительный язык
                                </p>
                            </div>
                            <Select defaultValue="ru">
                                <SelectTrigger className="w-[180px] bg-muted/20 border-border/50 h-9 text-sm">
                                    <SelectValue placeholder="Выберите язык" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ru">Русский</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="kz">Қазақша</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default Settings

