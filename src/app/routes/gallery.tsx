import { useGalleryItems } from "@/features/gallery/hooks";
import { Button } from "@/components/ui/button";
import { canManageGallery, useAuthSession } from "@/features/auth/hooks";
import { toast } from "sonner";

export function GalleryRoute() {
  const { user } = useAuthSession();
  const roleRaw = user?.app_metadata?.role;
  const role = typeof roleRaw === "string" ? roleRaw : null;
  const isAdmin = canManageGallery(role);
  const { data = [], isLoading, error } = useGalleryItems();

  return (
    <section className="space-y-6 py-6">
      <header className="flex items-end justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-editorial text-5xl leading-none">Gallery</h1>
          <p className="text-sm text-muted-foreground">Curated visual notes from around Korea.</p>
        </div>
        {isAdmin ? (
          <Button
            size="sm"
            onClick={() => {
              toast("Gallery create flow will be added next.");
            }}
          >
            Create
          </Button>
        ) : null}
      </header>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading gallery...</p> : null}
      {error ? <p className="text-sm text-destructive">Failed to load gallery.</p> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        {data.map((item) => (
          <figure key={item.id} className="space-y-2">
            <div className="aspect-[4/3] w-full rounded-md bg-muted" />
            <figcaption className="space-y-1 text-sm">
              <p className="font-medium">{item.locationTag ?? "Korea"}</p>
              <p className="text-muted-foreground">{item.caption ?? ""}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
