import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BoardPostForm from "./BoardPostForm";

vi.mock("./actions", () => ({
  createBoardPostAction: vi.fn(),
}));

describe("BoardNewPage", () => {
  it("uses shadcn field components on the editor form", () => {
    render(<BoardPostForm />);

    expect(screen.getByLabelText(/title/i)).toHaveAttribute("data-slot", "input");
    expect(screen.getByLabelText(/location tag/i)).toHaveAttribute("data-slot", "input");
    expect(screen.getByLabelText(/^type$/i)).toHaveAttribute("data-slot", "select-trigger");
    expect(screen.getByLabelText(/body/i)).toHaveAttribute("data-slot", "textarea");
  });
});
