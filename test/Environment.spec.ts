import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import { getConfig } from "../src/config";
import { Environment } from "../src/model/Environment";

describe("Environment", () => {
  const { api_url } = getConfig();

  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get environments", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments`, [
      {
        id: "1",
        name: "thevar"
      }
    ]);

    await Environment.query({
      projectId: "ffzefzef3"
    }).then(environment => {
      assert.equal(environment.length, 1);
      assert.equal(environment[0].id, "1");
    });
  });

  it("Get environment", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1`, {
      id: 1,
      name: "thevar"
    });

    await Environment.get({
      projectId: "ffzefzef3",
      id: "1"
    }).then(environment => {
      assert.equal(environment.id, "1");
    });
  });

  it("Get variable", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1/variables/1`, {
      id: 1,
      name: "thevar"
    });
    const environment = new Environment(
      {
        _links: {
          "#manage-variables": {
            href: "/projects/ffzefzef3/environments/1/variables"
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    await environment.getVariable("1").then(variable => {
      assert.equal(variable.id, "1");
    });
  });

  it("Delete environment", async () => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1`,
      {},
      { method: "DELETE" }
    );
    const environment = new Environment(
      {
        _links: {
          "#manage-variables": {
            href: "/projects/ffzefzef3/environments/1/variables"
          },
          "#delete": {
            href: "/projects/ffzefzef3/environments/1"
          }
        },
        id: 1,
        status: "inactive"
      },
      `${api_url}/projects/ffzefzef3/environments/1`
    );

    await environment.delete();
  });

  it("Activate environment", async () => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1/activate`,
      {
        _embedded: {
          activities: [
            {
              id: "kwfj7emjcltpm",
              _links: {
                self: {
                  href: `${api_url}/projects/test_project/activities/kwfj7emjcltpm`,
                  meta: {
                    get: {
                      responses: {
                        default: {
                          schema: {
                            properties: {
                              created_at: {
                                type: "string",
                                format: "date-time"
                              },
                              updated_at: {
                                type: "string",
                                format: "date-time"
                              },
                              type: {
                                type: "string"
                              },
                              parameters: {
                                properties: {},
                                required: []
                              },
                              project: {
                                type: "string"
                              },
                              environments: {
                                items: {
                                  type: "string"
                                },
                                type: "array"
                              },
                              state: {
                                type: "string"
                              },
                              result: {
                                type: "string"
                              },
                              started_at: {
                                type: "string",
                                format: "date-time"
                              },
                              completed_at: {
                                type: "string",
                                format: "date-time"
                              },
                              completion_percent: {
                                type: "integer"
                              },
                              log: {
                                type: "string"
                              },
                              payload: {
                                properties: {},
                                required: []
                              }
                            },
                            required: [
                              "created_at",
                              "updated_at",
                              "type",
                              "parameters",
                              "project",
                              "environments",
                              "state",
                              "result",
                              "started_at",
                              "completed_at",
                              "completion_percent",
                              "log",
                              "payload"
                            ]
                          }
                        }
                      },
                      parameters: []
                    }
                  }
                }
              },
              created_at: "2017-11-09T14:55:11.100839+00:00",
              updated_at: "2017-11-09T14:55:11.100865+00:00",
              type: "environment.activate",
              parameters: {
                environment: "fggfdgdazdazda",
                user: "alice"
              },
              project: "test_project",
              environments: ["fggfdgdazdazda"],
              state: "pending",
              result: null,
              started_at: null,
              completed_at: null,
              completion_percent: 0,
              log: "",
              payload: {
                environment: {
                  id: "fggfdgdazdazda",
                  created_at: "2017-11-08T09:02:19.358340+00:00",
                  updated_at: "2017-11-09T14:55:10.964452+00:00",
                  name: "fggfdgdazdazda",
                  machine_name: "fggfdgdazdazda-lgddxiq",
                  title: "fggfdgdazdazda2",
                  parent: "azdazdazd",
                  clone_parent_on_create: true,
                  deployment_target: "local",
                  status: "active",
                  http_access: {
                    is_enabled: true,
                    addresses: [],
                    basic_auth: {}
                  },
                  enable_smtp: false,
                  restrict_robots: true,
                  project: "test_project",
                  is_main: false,
                  is_dirty: false,
                  has_code: true,
                  head_commit: "3a941b70a802c16f3f855680001a0713537f9ea2"
                },
                user: {
                  id: "alice",
                  created_at: "2013-04-18T15:19:04+00:00",
                  updated_at: "2013-04-18T15:19:04+00:00",
                  display_name: "Alice"
                }
              }
            }
          ]
        }
      },
      { method: "POST" }
    );
    const environment = new Environment(
      {
        _links: {
          self: {
            href: "/projects/ffzefzef3/environments/1"
          },
          "#manage-variables": {
            href: "/projects/ffzefzef3/environments/1/variables"
          },
          "#activate": {
            href: "/projects/ffzefzef3/environments/1/activate"
          }
        },
        id: 1,
        status: "inactive"
      },
      `${api_url}/projects/ffzefzef3/environments/1`
    );

    await environment.activate();
  });

  it("Deactivate environment", async () => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1/deactivate`,
      {
        _embedded: {
          activities: [
            {
              id: "kwfj7emjcltpm",
              _links: {
                self: {
                  href: `${api_url}/projects/test_project/activities/kwfj7emjcltpm`,
                  meta: {
                    get: {
                      responses: {
                        default: {
                          schema: {
                            properties: {
                              created_at: {
                                type: "string",
                                format: "date-time"
                              },
                              updated_at: {
                                type: "string",
                                format: "date-time"
                              },
                              type: {
                                type: "string"
                              },
                              parameters: {
                                properties: {},
                                required: []
                              },
                              project: {
                                type: "string"
                              },
                              environments: {
                                items: {
                                  type: "string"
                                },
                                type: "array"
                              },
                              state: {
                                type: "string"
                              },
                              result: {
                                type: "string"
                              },
                              started_at: {
                                type: "string",
                                format: "date-time"
                              },
                              completed_at: {
                                type: "string",
                                format: "date-time"
                              },
                              completion_percent: {
                                type: "integer"
                              },
                              log: {
                                type: "string"
                              },
                              payload: {
                                properties: {},
                                required: []
                              }
                            },
                            required: [
                              "created_at",
                              "updated_at",
                              "type",
                              "parameters",
                              "project",
                              "environments",
                              "state",
                              "result",
                              "started_at",
                              "completed_at",
                              "completion_percent",
                              "log",
                              "payload"
                            ]
                          }
                        }
                      },
                      parameters: []
                    }
                  }
                }
              },
              created_at: "2017-11-09T14:55:11.100839+00:00",
              updated_at: "2017-11-09T14:55:11.100865+00:00",
              type: "environment.activate",
              parameters: {
                environment: "fggfdgdazdazda",
                user: "alice"
              },
              project: "test_project",
              environments: ["fggfdgdazdazda"],
              state: "pending",
              result: null,
              started_at: null,
              completed_at: null,
              completion_percent: 0,
              log: "",
              payload: {
                environment: {
                  id: "fggfdgdazdazda",
                  created_at: "2017-11-08T09:02:19.358340+00:00",
                  updated_at: "2017-11-09T14:55:10.964452+00:00",
                  name: "fggfdgdazdazda",
                  machine_name: "fggfdgdazdazda-lgddxiq",
                  title: "fggfdgdazdazda2",
                  parent: "azdazdazd",
                  clone_parent_on_create: true,
                  deployment_target: "local",
                  status: "inactive",
                  http_access: {
                    is_enabled: true,
                    addresses: [],
                    basic_auth: {}
                  },
                  enable_smtp: false,
                  restrict_robots: true,
                  project: "test_project",
                  is_main: false,
                  is_dirty: false,
                  has_code: true,
                  head_commit: "3a941b70a802c16f3f855680001a0713537f9ea2"
                },
                user: {
                  id: "alice",
                  created_at: "2013-04-18T15:19:04+00:00",
                  updated_at: "2013-04-18T15:19:04+00:00",
                  display_name: "Alice"
                }
              }
            }
          ]
        }
      },
      { method: "POST" }
    );
    const environment = new Environment(
      {
        _links: {
          self: {
            href: "/projects/ffzefzef3/environments/1"
          },
          "#manage-variables": {
            href: "/projects/ffzefzef3/environments/1/variables"
          },
          "#deactivate": {
            href: "/projects/ffzefzef3/environments/1/deactivate"
          }
        },
        id: 1,
        status: "active"
      },
      `${api_url}/projects/ffzefzef3/environments/1`
    );

    await environment.deactivate();
  });

  it("Get metrics", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/metrics`, {
      results: {}
    });

    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    await environment.getMetrics("").then(metrics => {
      assert.isNotNull(metrics.results);
    });
  });

  it("Get ssh key with the ssh link", () => {
    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          },
          ssh: {
            href: "ssh://testproject-master-7rqtwti@git.local.c-g.io"
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    const sshUrl = environment.getSshUrl();

    assert.equal(sshUrl, "testproject-master-7rqtwti@git.local.c-g.io");
  });

  it("Get app ssh key with the ssh link", () => {
    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          },
          ssh: {
            href: "ssh://testproject-master-7rqtwti@git.local.c-g.io"
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    const sshUrl = environment.getSshUrl("php");

    assert.equal(sshUrl, "testproject-master-7rqtwti--php@git.local.c-g.io");
  });

  it("Get ssh key with the app ssh link", () => {
    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          },
          "pf:ssh:php": {
            href: "ssh://testproject-master-7rqtwti--php@git.local.c-g.io"
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    const sshUrl = environment.getSshUrl("php");

    assert.equal(sshUrl, "testproject-master-7rqtwti--php@git.local.c-g.io");
  });

  it("Get ssh key with the app ssh link in priority", () => {
    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          },
          "pf:ssh:php": {
            href: "ssh://testproject-master-7rqtwti--php@git.local.c-g.io"
          },
          ssh: {
            href: "ssh://testproject-master-7rqtwti@git.local.c-g.io"
          }
        },
        id: 1
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    const sshUrl = environment.getSshUrl("php");

    assert.equal(sshUrl, "testproject-master-7rqtwti--php@git.local.c-g.io");
  });

  it("Get ssh key with the app ssh link in priority", async () => {
    const environment = new Environment(
      {
        _links: {
          self: {
            href: `${api_url}/projects/ffzefzef3/environments`
          },
          "pf:ssh:php": {
            href: "ssh://testproject-master-7rqtwti--php@git.local.c-g.io"
          },
          ssh: {
            href: "ssh://testproject-master-7rqtwti@git.local.c-g.io"
          }
        },
        id: 1,
        head_commit: "shastring",
        project: "ffzefzef3"
      },
      `${api_url}/projects/ffzefzef3/environments`
    );

    fetchMock.mock(`${api_url}/projects/ffzefzef3/git/commits/shastring`, {
      id: "shastring",
      _links: {
        self: {
          href: `${api_url}/projects/ffzefzef3/git/commits/shastring`
        }
      },
      sha: "shastring",
      author: {
        date: "2020-05-13T10:45:01-04:00",
        name: "author name",
        email: "author@email.com"
      },
      committer: {
        date: "2020-05-13T10:45:01-04:00",
        name: "committer name",
        email: "author@email.com"
      },
      message: "the message\n",
      tree: "shatree",
      parents: ["shaparent"]
    });

    await environment.getHeadCommit().then(c => {
      assert.equal(c.sha, "shastring");
    });
  });
});
