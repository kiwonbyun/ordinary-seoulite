import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthSession, getInitial } from "@/features/auth/hooks";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { HomeRoute } from "./routes/home";
import { BoardRoute } from "./routes/board";
import { BoardDetailRoute } from "./routes/board-detail";
import { DMRoute } from "./routes/dm";
import { GalleryRoute } from "./routes/gallery";
import { GalleryCreateRoute } from "./routes/gallery-create";
import { LoginRoute } from "./routes/login";
import { NotFoundRoute } from "./routes/not-found";

const LazyBoardNewRoute = lazy(async () => {
  const module = await import("./routes/board-new");
  return { default: module.BoardNewRoute };
});

function BoardNewRouteLazy() {
  return (
    <Suspense fallback={<section className="py-6 text-sm text-muted-foreground">Loading editor...</section>}>
      <LazyBoardNewRoute />
    </Suspense>
  );
}

function RootLayout() {
  const { user, loading } = useAuthSession();
  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;
  const initial = getInitial(user?.email);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out.");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-card/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6 md:h-16">
          <Link to="/" className="font-editorial text-2xl leading-none text-foreground md:text-3xl">
            Ordinary-Seoulite
          </Link>
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase [&.active]:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/board"
              className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase [&.active]:text-foreground"
            >
              Board
            </Link>
            <Link
              to="/dm"
              className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase [&.active]:text-foreground"
            >
              DM
            </Link>
            <Link
              to="/gallery"
              className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase [&.active]:text-foreground"
            >
              Gallery
            </Link>
          </div>
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-background text-sm font-medium"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleSignOut();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-6 pt-[72px] md:pt-[84px]">
        <Outlet />
      </main>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundRoute,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
});

const boardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/board",
  component: BoardRoute,
});

const boardDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/board/$postId",
  component: BoardDetailRoute,
});

const boardNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/board/new",
  component: BoardNewRouteLazy,
});

const dmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dm",
  component: DMRoute,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryRoute,
});

const galleryCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery/create",
  component: GalleryCreateRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => {
    const result: { next?: string } = {};
    if (typeof search.next === "string" && search.next.trim()) {
      result.next = search.next;
    }
    return result;
  },
  component: LoginRoute,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  boardRoute,
  boardNewRoute,
  boardDetailRoute,
  dmRoute,
  galleryRoute,
  galleryCreateRoute,
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
