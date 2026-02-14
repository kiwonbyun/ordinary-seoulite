import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Landing page", () => {
  it("highlights the 24h response promise", () => {
    render(<Page />);
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });

  it("renders the hero container", () => {
    render(<Page />);
    expect(screen.getByTestId("landing-hero")).toBeInTheDocument();
  });

  it("renders responsive hero media hooks", () => {
    render(<Page />);
    expect(screen.getByTestId("landing-hero-media")).toBeInTheDocument();
    expect(screen.getByTestId("landing-hero-overlay")).toBeInTheDocument();
  });
});
