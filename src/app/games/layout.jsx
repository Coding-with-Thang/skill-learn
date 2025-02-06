export default function GamesLayout({ children }) {
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen">{children}</div>
    </main>
  );
}