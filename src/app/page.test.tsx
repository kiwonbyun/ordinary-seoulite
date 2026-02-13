import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "./page";

describe("Landing page", () => {
  it("highlights the 24h response promise", () => {
    render(<Page />);
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });
});
