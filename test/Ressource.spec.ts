import { describe, expect, it } from "vitest";

import Ressource from "../src/model/Ressource";

class MockResource extends Ressource {}

describe("Ressource", () => {
  describe("operationAvailable", () => {
    it("Doesn't throw if _links is undefined", () => {
      const data = {};
      const resource = new MockResource("/test", {}, {}, data);

      expect(() => resource.operationAvailable("test")).not.to.throw();
    });

    it("Doesn't throw if the operation is not present", () => {
      const data = {
        _links: {}
      };
      const resource = new MockResource("/test", {}, {}, data);

      expect(() => resource.operationAvailable("test")).not.to.throw();
    });
  });

  describe("runOperation", () => {
    it("Throws if the operation is not available", async () => {
      const data = {
        _links: {}
      };
      const resource = new MockResource("/test", {}, {}, data);

      await expect(async () =>
        resource.runOperation("test")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Operation not available: test]`
      );
    });
  });
});
