import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { canManageGallery, getAuthRedirectPath, useAuthSession } from "@/features/auth/hooks";
import { useCreateGalleryItem } from "@/features/gallery/hooks";
import { toast } from "sonner";

export function GalleryCreateRoute() {
  const navigate = useNavigate();
  const { user, loading } = useAuthSession();
  const createGalleryItem = useCreateGalleryItem();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [locationTag, setLocationTag] = useState("");

  const role = user?.app_metadata?.role;
  const isAdmin = canManageGallery(role);
  const canSubmit = Boolean(imageFile) && !createGalleryItem.isPending;

  useEffect(() => {
    const redirectTo = getAuthRedirectPath("/gallery/create", Boolean(user));
    if (!loading && redirectTo) {
      void navigate({ to: redirectTo, replace: true });
    }
  }, [loading, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }
    try {
      await createGalleryItem.mutateAsync({ imageFile, caption, locationTag });
      toast.success("Gallery image added.");
      void navigate({ to: "/gallery", replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create gallery item.";
      toast.error(message);
    }
  };

  if (loading) {
    return <section className="py-6 text-sm text-muted-foreground">Loading...</section>;
  }

  if (!isAdmin) {
    return (
      <section className="space-y-4 py-6">
        <h1 className="font-editorial text-4xl leading-none">Create Gallery Item</h1>
        <p className="text-sm text-muted-foreground">Only admins can create gallery items.</p>
        <Button asChild variant="outline">
          <Link to="/gallery" className="cursor-pointer">
            Back to Gallery
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-6">
      <header className="space-y-1 border-b pb-4">
        <h1 className="font-editorial text-5xl leading-none">Create Gallery Item</h1>
        <p className="text-sm text-muted-foreground">Upload a curated image with optional caption and location.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-sm border bg-card p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Upload image</p>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Caption</p>
          <Input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Short caption"
            maxLength={160}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Location</p>
          <Input
            value={locationTag}
            onChange={(event) => setLocationTag(event.target.value)}
            placeholder="Location tag"
            maxLength={80}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/gallery" className="cursor-pointer">
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {createGalleryItem.isPending ? "Creating..." : "Add to Gallery"}
          </Button>
        </div>
      </form>
    </section>
  );
}
