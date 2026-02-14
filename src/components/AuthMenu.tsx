"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AuthMenuProps = {
  email: string;
  avatarUrl: string | null;
  initial: string;
};

export default function AuthMenu({ email, avatarUrl, initial }: AuthMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const canHoverOpen = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await fetch("/auth/signout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          onClick={() => setOpen((current) => !current)}
          onMouseEnter={() => {
            if (canHoverOpen) setOpen(true);
          }}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-rose)]"
        >
          <Avatar>
            <AvatarImage src={avatarUrl ?? undefined} alt={`${email} avatar`} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onMouseLeave={() => canHoverOpen && setOpen(false)}>
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/board/new">Write a post</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
          disabled={signingOut}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
