import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("applies primary class names", () => {
    render(<Button href="/dm">DM</Button>);
    expect(screen.getByRole("link", { name: "DM" }).className).toMatch(/btn-primary/);
  });

  it("applies ghost class names", () => {
    render(
      <Button href="/board" variant="ghost">
        Board
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Board" }).className).toMatch(/btn-ghost/);
  });
});
