/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Me from "../src/model/Me";

describe("Me", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get me", done => {
    fetchMock.get(`${api_url}/platform/me`, {
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

    Me.get().then(me => {
      assert.equal(me.id, 1);
      assert.equal(me.email, "test@test.com");
      assert.equal(me.constructor.name, "Me");
      done();
    });
  });

  it("Get and update me", done => {
    fetchMock.get(`${api_url}/platform/me`, {
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

    fetchMock.patch(`${api_url}/platform/me`, {
      id: 1,
      email: "test@test.com",
      picture: "testNewPic"
    });

    Me.get().then(me => {
      me.update({ picture: "testNewPic" }).then(newMe => {
        assert.equal(newMe.id, 1);
        assert.equal(newMe.email, "test@test.com");
        assert.equal(newMe.picture, "testNewPic");
        assert.equal(newMe.constructor.name, "Me");
        done();
      });
    });
  });
});
