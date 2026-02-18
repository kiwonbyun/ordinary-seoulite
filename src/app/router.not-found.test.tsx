import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppRouter } from "./router";

describe("Router not-found", () => {
  it("renders custom editorial 404 page for unknown routes", async () => {
    window.history.pushState({}, "", "/missing-editorial-page");

    render(<AppRouter />);

    expect(await screen.findByText(/We could not find the page you are looking for\./)).toBeInTheDocument();
  });
});
