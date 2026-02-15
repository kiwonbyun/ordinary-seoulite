import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders 404 copy with home and board links", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/the seoul alley you're looking for doesn't exist/i),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /go to board/i })).toHaveAttribute("href", "/board");
  });
});
