import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import mainImage from "@/app/assets/main.jpg";

export function HomeRoute() {
  return (
    <section className="space-y-8 py-6">
      <header className="space-y-6 border-b pb-10">
        <figure className="relative overflow-hidden rounded-sm border">
          <img
            src={mainImage}
            alt="N Seoul Tower above the city skyline"
            className="h-[48vh] w-full object-cover object-center grayscale-[0.15] md:h-[56vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          <figcaption className="absolute bottom-4 right-4 text-[11px] tracking-[0.14em] text-white/80 uppercase">
            N Seoul Tower
          </figcaption>

          <div className="absolute bottom-6 left-6 space-y-4 text-white md:bottom-8 md:left-8">
            <h1 className="font-editorial content-measure max-w-3xl text-5xl leading-[1.02] md:text-6xl">
              Practical Korea guidance for English-speaking travelers.
            </h1>
            <p className="content-measure max-w-2xl text-base leading-7 text-white/90 md:text-lg md:leading-8">
              Ask real questions, get local context fast, and continue privately when you need direct help.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/board">Explore Board</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/80 bg-white/10 text-white hover:bg-white/20">
                <Link to="/dm">Open DM</Link>
              </Button>
            </div>
          </div>
        </figure>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <article className="space-y-2">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground">Board</h2>
          <p className="text-sm leading-6">Single feed with question, review, and tip tags.</p>
        </article>
        <article className="space-y-2">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground">DM</h2>
          <p className="text-sm leading-6">One private thread for direct local advice.</p>
        </article>
        <article className="space-y-2">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground">Gallery</h2>
          <p className="text-sm leading-6">Curated visuals from an admin-managed feed.</p>
        </article>
      </div>
    </section>
  );
}
