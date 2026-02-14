import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("DM page", () => {
  it("mentions response within 24 hours", () => {
    render(<Page />);
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });

  it("uses themed surface container", () => {
    render(<Page />);
    expect(screen.getByTestId("dm-page").className).toMatch(/theme-surface/);
  });
});
