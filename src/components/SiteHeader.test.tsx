import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SiteHeader from "./SiteHeader";

const mockGetSessionUserFromCookies = vi.fn();

vi.mock("@/lib/server-auth", () => ({
  getSessionUserFromCookies: () => mockGetSessionUserFromCookies(),
}));

describe("SiteHeader", () => {
  it("renders the primary CTA", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);
    const ui = await SiteHeader();
    render(ui);
    expect(screen.getByRole("link", { name: /dm a question/i })).toBeInTheDocument();
  });

  it("uses sunset header surface class", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);
    const ui = await SiteHeader();
    render(ui);
    expect(screen.getByTestId("site-header").className).toMatch(/sunset-header/);
  });

  it("sticks to the top while scrolling", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue(null);
    const ui = await SiteHeader();
    render(ui);
    const header = screen.getByTestId("site-header");
    expect(header.className).toMatch(/sticky/);
    expect(header.className).toMatch(/top-0/);
  });

  it("renders account menu for signed-in users", async () => {
    mockGetSessionUserFromCookies.mockResolvedValue({
      id: "user-1",
      email: "signed@example.com",
    });

    const ui = await SiteHeader();
    render(ui);

    expect(screen.getByRole("button", { name: /account menu/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dm a question/i })).toBeInTheDocument();
  });
});
