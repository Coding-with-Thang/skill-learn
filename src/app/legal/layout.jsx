export default function LegalLayout({ children }) {
    return (
        <main>
            <div className="max-w-full bg-[var(--primary)] m-8 flex flex-col items-center justify-center">{children}</div>
        </main>
    );
}