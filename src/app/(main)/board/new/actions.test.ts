import { describe, expect, it } from "vitest";
import { parseBoardPostFormData, toBoardPostPayload } from "./form";

function buildValidFormData() {
  const formData = new FormData();
  formData.set("type", "question");
  formData.set("title", "How can I move around Seoul at night?");
  formData.set(
    "body",
    "I am landing late and need safe options between subway, bus, and taxi with luggage.",
  );
  formData.set("locationTag", "Jong-ro");
  return formData;
}

describe("parseBoardPostFormData", () => {
  it("parses valid form data", () => {
    const result = parseBoardPostFormData(buildValidFormData());
    expect(result.success).toBe(true);
  });

  it("rejects form data without type", () => {
    const formData = buildValidFormData();
    formData.delete("type");
    const result = parseBoardPostFormData(formData);
    expect(result.success).toBe(false);
  });
});

describe("toBoardPostPayload", () => {
  it("maps locationTag to location_tag for insert", () => {
    const payload = toBoardPostPayload({
      type: "tip",
      title: "Subway card tip",
      body: "Buy your card in advance to skip long lines at crowded stations in the evening.",
      locationTag: "Myeong-dong",
    });

    expect(payload).toEqual({
      type: "tip",
      title: "Subway card tip",
      body: "Buy your card in advance to skip long lines at crowded stations in the evening.",
      location_tag: "Myeong-dong",
    });
  });
});
