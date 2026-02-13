import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteHeader from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the primary CTA", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /dm a question/i })).toBeInTheDocument();
  });
});
