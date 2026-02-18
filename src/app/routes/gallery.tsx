import { Link } from "@tanstack/react-router";
import { useGalleryItems } from "@/features/gallery/hooks";
import { Button } from "@/components/ui/button";
import { canManageGallery, useAuthSession } from "@/features/auth/hooks";

export function GalleryRoute() {
  const { user } = useAuthSession();
  const role = user?.app_metadata?.role;
  const isAdmin = canManageGallery(role);
  const { data = [], isLoading, error } = useGalleryItems();

  return (
    <section className="space-y-6 py-6">
      <header className="flex items-end justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-editorial text-5xl leading-none">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Curated visual notes from around Korea.
          </p>
        </div>
        {isAdmin ? (
          <Button asChild size="sm">
            <Link to="/gallery/create" className="cursor-pointer">
              Create
            </Link>
          </Button>
        ) : null}
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading gallery...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">Failed to load gallery.</p>
      ) : null}

      <div className="columns-1 gap-6 space-y-6 md:columns-2">
        {data.map((item) => (
          <figure
            key={item.id}
            className="group mb-6 break-inside-avoid space-y-3"
          >
            <div className="relative overflow-hidden rounded-md border">
              <a
                href={item.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="block cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption ?? item.locationTag ?? "Gallery image"}
                  className="h-auto w-full object-contain"
                />

                <figcaption className="absolute right-0 bottom-0 left-0 p-4 md:p-5">
                  <p
                    className="text-[11px] font-medium tracking-[0.22em] text-white/72 uppercase"
                    style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)" }}
                  >
                    {item.locationTag ?? "Korea"}
                  </p>
                </figcaption>
              </a>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
