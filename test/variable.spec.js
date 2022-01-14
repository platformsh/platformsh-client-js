/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Variable from "../src/model/Variable";

describe("Variable", () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Add variable", done => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/environments/1/variables",
      {
        id: 1,
        name: "test",
        value: 1
      },
      "POST"
    );

    const values = {
      name: "test",
      value: 1,
      is_json: false,
      is_enabled: true,
      is_inheritable: true,
      is_sensitive: false,
      visible_build: true,
      visible_runtime: true
    };

    const variable = new Variable(
      values,
      "https://test.com/api/projects/ffzefzef3/environments/1/variables"
    );

    variable.save().then(newVar => {
      done();
    });
  });
});
