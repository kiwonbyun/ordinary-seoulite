import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryRoute } from "./gallery";
import { useGalleryItems } from "@/features/gallery/hooks";
import { useAuthSession } from "@/features/auth/hooks";

vi.mock("@/features/gallery/hooks", () => ({
  useGalleryItems: vi.fn(),
  useCreateGalleryItem: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/features/auth/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/auth/hooks")>("@/features/auth/hooks");
  return {
    ...actual,
    useAuthSession: vi.fn(),
  };
});

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={String(to)} {...props}>
      {children}
    </a>
  ),
}));

const mockedUseGalleryItems = vi.mocked(useGalleryItems);
const mockedUseAuthSession = vi.mocked(useAuthSession);

describe("GalleryRoute create navigation", () => {
  beforeEach(() => {
    mockedUseGalleryItems.mockReturnValue(
      {
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useGalleryItems>,
    );
  });

  it("shows create link to dedicated page for admins", () => {
    mockedUseAuthSession.mockReturnValue(
      {
        user: { app_metadata: { role: "admin" } },
        session: null,
        loading: false,
      } as unknown as ReturnType<typeof useAuthSession>,
    );

    render(<GalleryRoute />);

    const createLink = screen.getByRole("link", { name: "Create" });
    expect(createLink).toHaveAttribute("href", "/gallery/create");
    expect(screen.queryByText("Upload image")).not.toBeInTheDocument();
  });

  it("renders gallery media with original aspect ratio and magazine-style caption", () => {
    mockedUseAuthSession.mockReturnValue(
      {
        user: null,
        session: null,
        loading: false,
      } as unknown as ReturnType<typeof useAuthSession>,
    );
    mockedUseGalleryItems.mockReturnValue(
      {
        data: [
          {
            id: "g1",
            imageUrl: "https://cdn.example.com/g1.jpg",
            locationTag: "Itaewon",
            caption: "Late afternoon light across the hillside.",
            createdAt: "2026-02-18T00:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useGalleryItems>,
    );

    render(<GalleryRoute />);

    const image = screen.getByRole("img", { name: "Late afternoon light across the hillside." });
    expect(image).toHaveClass("h-auto");
    expect(image).not.toHaveClass("aspect-[4/3]");

    const location = screen.getByText("Itaewon");
    expect(location).toHaveClass("uppercase");
    expect(location).toHaveClass("tracking-[0.22em]");
    expect(location.closest("figcaption")).toHaveClass("absolute");

    const masonryRoot = screen.getByText("Itaewon").closest("section")?.querySelector(".columns-1");
    expect(masonryRoot).toBeInTheDocument();
    expect(masonryRoot).toHaveClass("md:columns-2");

    const imageLink = image.closest("a");
    expect(imageLink).toHaveAttribute("href", "https://cdn.example.com/g1.jpg");
    expect(imageLink).toHaveAttribute("target", "_blank");
    expect(imageLink).toHaveAttribute("rel", "noreferrer");
  });
});
