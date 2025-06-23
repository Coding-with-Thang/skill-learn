export default function LegalLayout({ children }) {
    return (
        <main>
            <div className="max-w-full bg-green-400 m-8 flex flex-col items-center justify-center">{children}</div>
        </main>
    );
}