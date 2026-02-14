import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./dropdown-menu";
import { Palette } from "lucide-react";

const THEMES = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
];

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove all theme classes and data-theme
        root.classList.remove("dark");
        root.removeAttribute("data-theme");
        if (theme === "dark") {
            root.classList.add("dark");
        } else if (theme !== "light") {
            root.setAttribute("data-theme", theme);
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label="Open theme switcher"
                    className="flex items-center justify-center rounded-full p-2 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition"
                    style={{ fontFamily: "var(--fun-font)", transition: "var(--transition)" }}
                >
                    <Palette className="w-6 h-6" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ zIndex: 9999, background: "var(--background)", color: "var(--foreground)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)", border: "1px solid var(--border)" }}>
                {THEMES.map((t) => (
                    <DropdownMenuItem
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={theme === t.value ? "font-bold bg-accent text-accent-foreground" : ""}
                    >
                        {t.label}
                        {theme === t.value && (
                            <span className="ml-auto">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
