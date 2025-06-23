import { useEffect, useState } from "react";

const THEMES = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "Ocean", value: "ocean" },
    { label: "Sunset", value: "sunset" },
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
        <div className="flex items-center gap-2">
            <span className="text-sm">Theme:</span>
            <select
                className="border rounded px-2 py-1 bg-background text-foreground"
                value={theme}
                onChange={e => setTheme(e.target.value)}
            >
                {THEMES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
        </div>
    );
}
