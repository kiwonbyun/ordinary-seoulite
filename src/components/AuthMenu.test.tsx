import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthMenu from "./AuthMenu";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

describe("AuthMenu", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders email and actions when opened", () => {
    render(<AuthMenu email="user@example.com" avatarUrl={null} initial="U" />);

    fireEvent.click(screen.getByRole("button", { name: /account menu/i }));

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /write a post/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /sign out/i })).toBeInTheDocument();
  });

  it("signs out immediately via server route", async () => {
    render(<AuthMenu email="user@example.com" avatarUrl={null} initial="U" />);

    fireEvent.click(screen.getByRole("button", { name: /account menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /sign out/i }));

    expect(fetch).toHaveBeenCalledWith("/auth/signout", { method: "POST" });
  });

  it("opens on hover for desktop pointers", () => {
    render(<AuthMenu email="user@example.com" avatarUrl={null} initial="U" />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: /account menu/i }));

    expect(screen.getByRole("menuitem", { name: /write a post/i })).toBeInTheDocument();
  });
});
