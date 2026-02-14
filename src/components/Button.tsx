import Link from "next/link";
import { type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export default function Button({ href, children, variant = "primary" }: ButtonProps) {
  const uiVariant = variant === "primary" ? "default" : "ghost";
  const legacyClass = variant === "primary" ? "btn-primary" : "btn-ghost";

  return (
    <Link className={cn(buttonVariants({ variant: uiVariant }), legacyClass)} href={href}>
      {children}
    </Link>
  );
}
