import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted min-h-screen">
      <h1 className="mt-20 font-bold text-xl text-primary">404</h1>
      <p className="mt-4 text-6xl text-muted-foreground">Oops! Page not found.</p>
      <p className="mt-2 text-muted-foreground">Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
      <Button className="mt-6" asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}