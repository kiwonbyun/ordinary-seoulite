import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginClient from "./LoginClient";

describe("LoginClient", () => {
  it("renders media and form panels", () => {
    render(<LoginClient redirectTo="/board/new" />);
    expect(screen.getByTestId("login-media-panel")).toBeInTheDocument();
    expect(screen.getByTestId("login-form-panel")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue with google/i })).toHaveAttribute(
      "href",
      "/auth/start?redirectTo=%2Fboard%2Fnew",
    );
  });
});
