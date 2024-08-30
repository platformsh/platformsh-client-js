import fetchMock from "fetch-mock";
import { assert, afterEach, beforeAll, describe, it } from "vitest";

import { setAuthenticationPromise } from "../src/api";
import type { JWTToken } from "../src/authentication";
import Project from "../src/model/Project";

describe("Project", () => {
  beforeAll(() => {
    setAuthenticationPromise(
      Promise.resolve("testToken" as unknown as JWTToken)
    );
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get users associated with a project", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/access", [
      { id: 1, role: "r1" },
      { id: 2, role: "r2" }
    ]);
    const project = new Project(
      {
        _links: {
          "#access": {
            href: "/api/projects/ffzefzef3/access"
          }
        }
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getUsers().then(projectAccess => {
      assert.equal(projectAccess.length, 2);
      assert.equal(projectAccess[0].role, "r1");
      assert.equal(projectAccess[0].constructor.name, "ProjectAccess");
    });
  });

  it("Get git url", () => {
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );
    const gitUrl = project.getGitUrl();

    assert.equal(gitUrl, "ffzefzef3@git.test.com:ffzefzef3.git");
  });

  it("Add user in a project", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/access",
      {
        _embedded: {
          activities: [
            {
              completion_percent: 0
            }
          ]
        }
      },
      { method: "POST" }
    );

    const project = new Project(
      {
        _links: {
          access: {
            href: "/api/projects/ffzefzef3/access"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.addUser("test@test.com", "admin").then(async result => {
      assert.equal(result.constructor.name, "Result");
      assert.equal(
        (await result.getActivities())[0].constructor.name,
        "Activity"
      );
    });
  });

  it("Add user in a project with bad role", () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/access",
      {
        _embedded: {
          activities: [
            {
              completion_percent: 0
            }
          ]
        }
      },
      { method: "POST" }
    );

    const project = new Project(
      {
        _links: {
          access: {
            href: "/api/projects/ffzefzef3/access"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    project.addUser("test@test.com", "role").catch(err => {
      assert.equal(err.role, "Invalid role: 'role'");
    });
  });

  it("Add user in a project with bad email and role", () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/access",
      {
        _embedded: {
          activities: [
            {
              completion_percent: 0
            }
          ]
        }
      },
      { method: "POST" }
    );

    const project = new Project(
      {
        _links: {
          access: {
            href: "/api/projects/ffzefzef3/access"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    project.addUser("test@test", "role").catch(err => {
      assert.equal(err.email, "Invalid email address: 'test@test'");
      assert.equal(err.role, "Invalid role: 'role'");
    });
  });

  it("Get environment", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/environments/1", {
      id: 1
    });
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getEnvironment("1").then(environment => {
      assert.equal(environment.constructor.name, "Environment");
    });
  });

  it("Get environments", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/environments?limit=2",
      [{ id: 1 }]
    );
    const project = new Project(
      {
        _links: {
          environments: {
            href: "/api/projects/ffzefzef3/environments"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getEnvironments(2).then(environments => {
      assert.equal(environments[0].id, "1");
      assert.equal(environments[0].constructor.name, "Environment");
    });
  });

  it("Get environments without _links", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/environments", [
      { id: 1 }
    ]);
    const project = new Project(
      {
        endpoint: "https://test.com/api/projects/ffzefzef3",
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getEnvironments().then(environments => {
      assert.equal(environments[0].id, "1");
      assert.equal(environments[0].constructor.name, "Environment");
    });
  });

  it("Get domains", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/domains?limit=2", [
      { id: 1 }
    ]);
    const project = new Project(
      {
        _links: {
          domains: {
            href: "/api/projects/ffzefzef3/domains"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getDomains(2).then(domains => {
      assert.equal(domains[0].id, "1");
      assert.equal(domains[0].constructor.name, "Domain");
    });
  });

  it("Get domain", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/domains/domainName",
      {
        id: 1,
        name: "domainName"
      }
    );
    const project = new Project(
      {
        _links: {
          domains: {
            href: "/api/projects/ffzefzef3/domains"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getDomain("domainName").then(domain => {
      assert.equal(domain.name, "domainName");
      assert.equal(domain.constructor.name, "Domain");
    });
  });

  it("Add domain", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/domains",
      {},
      { method: "POST" }
    );
    const project = new Project(
      {
        _links: {
          domains: {
            href: "/api/projects/ffzefzef3/domains"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.addDomain("domainName").then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Get integrations", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/integrations?limit=2",
      [{}]
    );
    const project = new Project(
      {
        _links: {
          integrations: {
            href: "/api/projects/ffzefzef3/integrations"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getIntegrations(2).then(integrations => {
      assert.equal(integrations.length, 1);
      assert.equal(integrations[0].constructor.name, "Integration");
    });
  });

  it("Get integration", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/integrations/1", {
      id: 1
    });
    const project = new Project(
      {
        _links: {
          integrations: {
            href: "/api/projects/ffzefzef3/integrations"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getIntegration("1").then(integration => {
      assert.equal(integration.constructor.name, "Integration");
      assert.equal(integration.id, "1");
    });
  });

  it("Add integration", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/integrations",
      {},
      { method: "POST" }
    );
    const project = new Project(
      {
        _links: {
          integrations: {
            href: "/api/projects/ffzefzef3/integrations"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.addIntegration("bitbucket").then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Add integration with bad type", () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/integrations",
      {},
      { method: "POST" }
    );
    const project = new Project(
      {
        _links: {
          integrations: {
            href: "/api/projects/ffzefzef3/integrations"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    project.addIntegration("test").catch(err => {
      assert.equal(err.type, "Invalid type: 'test'");
    });
  });

  it("Get activity", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/activities/1", {
      id: 1
    });
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getActivity("1").then(activity => {
      assert.equal(activity.constructor.name, "Activity");
      assert.equal(activity.id, "1");
    });
  });

  it("Get activities", async () => {
    const queryString = "?type=theType&starts_at=2017-03-21T09%3A06%3A30.550Z";

    fetchMock.mock(
      `https://test.com/api/projects/ffzefzef3/activities${queryString}`,
      [
        {
          id: 1
        }
      ]
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project
      .getActivities(["theType"], new Date("2017-03-21T09:06:30.550116+00:00"))
      .then(activities => {
        assert.equal(activities[0].constructor.name, "Activity");
        assert.equal(activities[0].id, "1");
      });
  });

  it("Be suspended", () => {
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title",
        status: "suspended"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    assert.equal(project.isSuspended(), true);
  });

  it("Not be suspended", () => {
    let project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title",
        status: "ok"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    assert.equal(project.isSuspended(), false);

    project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title",
        subscription: {
          suspended: false
        }
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    assert.equal(project.isSuspended(), false);
  });

  it("Get variables", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/variables?limit=1",
      [
        {
          id: 1,
          name: "theVariableName"
        }
      ]
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getVariables(1).then(activities => {
      assert.equal(activities[0].constructor.name, "ProjectLevelVariable");
      assert.equal(activities[0].id, "1");
    });
  });

  it("Get variable", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/variables/theVariableName",
      {
        id: 1,
        name: "theVariableName"
      }
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getVariable("theVariableName").then(activitie => {
      assert.equal(activitie.constructor.name, "ProjectLevelVariable");
      assert.equal(activitie.id, "1");
    });
  });

  it("Set existing variable", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/variables/variableName",
      {
        _links: {
          "#edit": {
            href: "/api/projects/ffzefzef3/variables/variableName"
          }
        },
        id: 1,
        name: "variableName"
      }
    );
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/variables",
      [
        {
          _links: {
            "#edit": {
              href: "/api/projects/ffzefzef3/variables/variableName"
            }
          },
          id: 1,
          name: "variableName"
        }
      ],
      { method: "PATCH" }
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.setVariable("variableName", "").then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Get certificates", async () => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/certificates", [
      {}
    ]);
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getCertificates().then(certificates => {
      assert.equal(certificates.length, 1);
      assert.equal(certificates[0].constructor.name, "Certificate");
    });
  });

  it("Add certificate", async () => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/certificates",
      {},
      { method: "POST" }
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.addCertificate("certif", "key", ["chain"]).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Update the project locally", () => {
    const project = new Project(
      {
        _links: {
          domains: {
            href: "/api/projects/ffzefzef3/domains"
          }
        },
        id: "ffzefzef3",
        title: "project title"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    const updatedProject = project.updateLocal({ title: "test" });

    assert.equal(updatedProject.title, "test");
    assert.equal(updatedProject.id, "ffzefzef3");
    assert.equal(updatedProject.constructor.name, "Project");
  });

  it("Load the theme", async () => {
    fetchMock.mock(
      "https://test.com/vendor.json",
      {
        color: "#FFFFF"
      },
      { method: "GET" }
    );
    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          }
        },
        id: "ffzefzef3",
        title: "project title",
        vendor_resources: "https://test.com"
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.loadTheme().then(theme => {
      assert.equal(theme.color, "#FFFFF");
      assert.equal(theme.logo, "https://test.com/images/logo.svg");
      assert.equal(theme.smallLogo, "https://test.com/images/logo-ui.svg");
      assert.equal(theme.emailLogo, "https://test.com/images/logo-email.png");
    });
  });

  it("Get Capabilities", async () => {
    const capabilities = {
      id: "capabilities",
      _links: {
        self: {
          href: "https://test.com/api/projects/ffzefzef3/capabilities/capabilities"
        },
        "#edit": {
          href: "/api/projects/qtnfkpa5ehbxi/capabilities"
        }
      },
      source_operation: {
        enabled: true
      }
    };
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/capabilities",
      capabilities
    );

    const project = new Project(
      {
        _links: {
          self: {
            href: "/api/projects/ffzefzef3"
          },
          "#capabilitiess": {
            href: "/api/projects/ffzefzef3/capabilities"
          }
        }
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    await project.getCapabilities().then(({ source_operation }) => {
      assert.equal(source_operation.enabled, true);
    });
  });
});
