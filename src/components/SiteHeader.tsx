import Link from "next/link";
import AuthMenu from "./AuthMenu";
import Button from "./Button";
import { getSessionUserFromCookies } from "@/lib/server-auth";
import { toSessionUserView } from "@/lib/session-user";

export default async function SiteHeader() {
  const sessionUser = await getSessionUserFromCookies();
  const user = sessionUser
    ? toSessionUserView({
        email: sessionUser.email,
        user_metadata: { avatar_url: sessionUser.avatarUrl },
      })
    : null;

  return (
    <header
      data-testid="site-header"
      className="sunset-header sticky top-0 mt-4 z-20 -mx-2 flex items-center justify-between rounded-2xl px-2 py-4"
    >
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Ordinary Seoulite
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/board"
          className="text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--accent-warm)]"
        >
          Board
        </Link>
        <Link
          href="/gallery"
          className="text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--accent-warm)]"
        >
          Gallery
        </Link>
        <Link
          href="/profile"
          className="text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--accent-warm)]"
        >
          About
        </Link>
        <Button href="/dm">DM a question</Button>
        {user ? <AuthMenu email={user.email} avatarUrl={user.avatarUrl} initial={user.initial} /> : null}
      </nav>
    </header>
  );
}
