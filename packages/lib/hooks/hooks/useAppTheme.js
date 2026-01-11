import { useEffect, useState } from "react";

export function useAppTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });

    useEffect(() => {
        const handler = () => {
            setTheme(localStorage.getItem("theme") || "light");
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    return theme;
}
