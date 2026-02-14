import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Profile page", () => {
  it("renders an about heading", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
  });

  it("uses themed surface container", () => {
    render(<Page />);
    expect(screen.getByTestId("profile-page").className).toMatch(/theme-surface/);
  });
});
