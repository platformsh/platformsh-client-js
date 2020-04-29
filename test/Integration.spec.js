/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Integration from "../src/model/Integration";

describe("Integration", () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get integrations", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/integrations",
      [
        {
          id: 1,
          name: "thevar"
        }
      ]
    );

    Integration.query({
      projectId: "ffzefzef3"
    }).then(integration => {
      assert.equal(integration.length, 1);
      assert.equal(integration[0].id, 1);
      done();
    });
  });

  it("Get integration", done => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/integrations/1",
      {
        id: 1,
        name: "thevar"
      }
    );

    Integration.get({
      projectId: "ffzefzef3",
      id: "1"
    }).then(integration => {
      assert.equal(integration.id, 1);
      done();
    });
  });
});
