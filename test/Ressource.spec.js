import { expect } from "chai";
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
    it("Throws if the operation is not available", () => {
      const data = {
        _links: {}
      };
      const resource = new MockResource("/test", {}, {}, data);

      expect(() => resource.runOperation("test")).to.throw(
        "Operation not available: test"
      );
    });
  });
});
