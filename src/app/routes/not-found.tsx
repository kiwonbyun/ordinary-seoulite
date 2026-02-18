import { Link } from "@tanstack/react-router";

export function NotFoundRoute() {
  return (
    <section className="relative overflow-hidden border-y border-border/80 bg-card/80 px-6 py-10 md:px-10 md:py-14">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Ordinary-Seoulite Editorial
          </p>
          <div className="h-px w-20 bg-border" />
        </div>

        <div className="space-y-4">
          <h1 className="font-editorial text-7xl leading-none text-foreground sm:text-8xl md:text-9xl">404</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We could not find the page you are looking for.
            <br />
            The address may have changed, or this content is no longer available.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center border border-foreground px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
          >
            Home
          </Link>
          <Link
            to="/board"
            className="inline-flex items-center border border-border px-4 py-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:border-foreground hover:text-foreground"
          >
            Board
          </Link>
        </div>
      </div>
    </section>
  );
}
