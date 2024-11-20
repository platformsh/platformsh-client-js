import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Me } from "../src/model/Me";

describe("Me", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get me", async () => {
    fetchMock.get(`${api_url}/me`, {
      id: 1,
      display_name: "test",
      email: "test@test.com",
      projects: [
        {
          id: "ffzefzef",
          name: "greatProject",
          endpoint: "http://test.com/api/projects/ffzefzef"
        }
      ]
    });

    await Me.get().then(me => {
      assert.equal(me.id, "1");
      assert.equal(me.email, "test@test.com");
      assert.equal(me.constructor.name, "Me");
    });
  });

  it("Get and update me", async () => {
    fetchMock.get(`${api_url}/me`, {
      id: 1,
      display_name: "test",
      projects: [
        {
          id: "ffzefzef",
          name: "greatProject",
          endpoint: "http://test.com/api/projects/ffzefzef"
        }
      ]
    });

    fetchMock.patch(`${api_url}/profiles/1`, {
      id: 1,
      email: "test@test.com",
      picture: "testNewPic"
    });

    await Me.get().then(async me => {
      await me.update({ picture: "testNewPic" }).then(newMe => {
        assert.equal(newMe.data.id, 1);
        assert.equal(newMe.data.email, "test@test.com");
        assert.equal(newMe.data.picture, "testNewPic");
        assert.equal(newMe.constructor.name, "Result");
      });
    });
  });
});
