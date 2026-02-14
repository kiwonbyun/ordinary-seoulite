import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Gallery page", () => {
  it("renders a gallery heading", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /gallery/i })).toBeInTheDocument();
  });

  it("uses themed surface container", () => {
    render(<Page />);
    expect(screen.getByTestId("gallery-page").className).toMatch(/theme-surface/);
  });
});
