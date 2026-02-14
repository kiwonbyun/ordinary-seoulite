import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";
import { resolveRedirectTarget } from "@/lib/auth-redirect";
import { getSessionUserFromCookies } from "@/lib/server-auth";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  if (!params.redirectTo) {
    redirect("/");
  }
  const safeRedirectTo = resolveRedirectTarget(params.redirectTo, "/");
  const user = await getSessionUserFromCookies();
  if (user) {
    redirect(safeRedirectTo);
  }

  return <LoginClient redirectTo={safeRedirectTo} />;
}
