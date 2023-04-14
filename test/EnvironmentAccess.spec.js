/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Environment from "../src/model/Environment";

describe("Environment Access", () => {
  before(() => {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get environment access", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/environments/1/access",
      [
        {
          id: "alice",
          _links: {
            self: {
              href: "https://test.com/api/projects/ffzefzef3/environments/1/access/alice",
              meta: {
                get: {
                  responses: {
                    default: {
                      description: "",
                      schema: {
                        type: "object",
                        properties: {
                          user: {
                            type: "string",
                            title: "User"
                          },
                          email: {
                            type: "string",
                            title: "E-mail address"
                          },
                          role: {
                            type: "string",
                            title: "Role"
                          }
                        },
                        required: ["user", "email", "role"],
                        additionalProperties: false
                      }
                    }
                  },
                  parameters: []
                }
              }
            }
          },
          _embedded: {
            users: [
              {
                id: "alice",
                created_at: "2013-04-18T21:19:04+00:00",
                updated_at: "2013-04-18T21:19:04+00:00",
                display_name: "Alice"
              }
            ]
          },
          user: "alice",
          role: "admin"
        }
      ]
    );

    const environment = new Environment(
      {
        _links: {
          "#manage-access": {
            href: "/api/projects/ffzefzef3/environments/1/access"
          }
        },
        id: 1
      },
      "https://test.com/api/projects/ffzefzef3/environments"
    );

    const accesses = await environment.getUsers();

    const user = accesses[0].getUser();

    assert.equal(user.id, "alice");
    assert.equal(user.constructor.name, "User");
  });
});
