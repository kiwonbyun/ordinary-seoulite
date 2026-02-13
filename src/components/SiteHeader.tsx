import Link from "next/link";
import Button from "./Button";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="text-lg font-semibold">
        Ordinary Seoulite
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/board">Board</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/profile">About</Link>
        <Button href="/dm">DM a question</Button>
      </nav>
    </header>
  );
}
