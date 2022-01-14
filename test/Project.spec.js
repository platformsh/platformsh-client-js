/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { setAuthenticationPromise } from "../src/api";
import Project from "../src/model/Project";

describe("Project", () => {
  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get users associated with a project", done => {
    fetchMock.mock("https://test.com/api/projects/ffzefzef3/access", [
      { id: 1, role: "r1" },
      { id: 2, role: "r2" }
    ]);
    const project = new Project(
      {
        _links: {
          access: {
            href: "/api/projects/ffzefzef3/access"
          }
        }
      },
      "https://test.com/api/projects/ffzefzef3"
    );

    project.getUsers().then(projectAccess => {
      assert.equal(projectAccess.length, 2);
      assert.equal(projectAccess[0].role, "r1");
      assert.equal(projectAccess[0].constructor.name, "ProjectAccess");
      done();
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

  it("Add user in a project", done => {
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
      "POST"
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

    project.addUser("test@test.com", "admin").then(result => {
      assert.equal(result.constructor.name, "Result");
      assert.equal(
        result.getActivities("https://test.com/api/projects/ffzefzef3")[0]
          .constructor.name,
        "Activity"
      );
      done();
    });
  });

  it("Add user in a project with bad role", done => {
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
      "POST"
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
      done();
    });
  });

  it("Add user in a project with bad email and role", done => {
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
      "POST"
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
      done();
    });
  });

  it("Get environment", done => {
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

    project.getEnvironment(1).then(environment => {
      assert.equal(environment.constructor.name, "Environment");
      done();
    });
  });

  it("Get environments", done => {
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

    project.getEnvironments(2).then(environments => {
      assert.equal(environments[0].id, 1);
      assert.equal(environments[0].constructor.name, "Environment");
      done();
    });
  });

  it("Get environments without _links", done => {
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

    project.getEnvironments().then(environments => {
      assert.equal(environments[0].id, 1);
      assert.equal(environments[0].constructor.name, "Environment");
      done();
    });
  });

  it("Get domains", done => {
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

    project.getDomains(2).then(domains => {
      assert.equal(domains[0].id, 1);
      assert.equal(domains[0].constructor.name, "Domain");
      done();
    });
  });

  it("Get domain", done => {
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

    project.getDomain("domainName").then(domain => {
      assert.equal(domain.name, "domainName");
      assert.equal(domain.constructor.name, "Domain");
      done();
    });
  });

  it("Add domain", done => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/domains",
      {},
      "POST"
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

    project.addDomain("domainName").then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Get integrations", done => {
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

    project.getIntegrations(2).then(integrations => {
      assert.equal(integrations.length, 1);
      assert.equal(integrations[0].constructor.name, "Integration");
      done();
    });
  });

  it("Get integration", done => {
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

    project.getIntegration(1).then(integration => {
      assert.equal(integration.constructor.name, "Integration");
      assert.equal(integration.id, 1);
      done();
    });
  });

  it("Add integration", done => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/integrations",
      {},
      "POST"
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

    project.addIntegration("bitbucket").then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Add integration with bad type", done => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/integrations",
      {},
      "POST"
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
      done();
    });
  });

  it("Get activity", done => {
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

    project.getActivity(1).then(activity => {
      assert.equal(activity.constructor.name, "Activity");
      assert.equal(activity.id, 1);
      done();
    });
  });

  it("Get activities", done => {
    const queryString =
      "?type=theType&starts_at=2017-03-21T09%3A06%3A30.550116%2B00%3A00";

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

    project
      .getActivities("theType", "2017-03-21T09:06:30.550116+00:00")
      .then(activities => {
        assert.equal(activities[0].constructor.name, "Activity");
        assert.equal(activities[0].id, 1);
        done();
      });
  });

  it("Be suspended", () => {
    let project = new Project(
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
          suspended: true
        }
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

  it("Get variables", done => {
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

    project.getVariables(1).then(activities => {
      assert.equal(activities[0].constructor.name, "ProjectLevelVariable");
      assert.equal(activities[0].id, 1);
      done();
    });
  });

  it("Get variable", done => {
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

    project.getVariable("theVariableName").then(activitie => {
      assert.equal(activitie.constructor.name, "ProjectLevelVariable");
      assert.equal(activitie.id, 1);
      done();
    });
  });

  it("Set existing variable", done => {
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
      "PATCH"
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

    project.setVariable("variableName").then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Get certificates", done => {
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

    project.getCertificates().then(certificates => {
      assert.equal(certificates.length, 1);
      assert.equal(certificates[0].constructor.name, "Certificate");
      done();
    });
  });

  it("Add certificate", done => {
    fetchMock.mock(
      "https://test.com/api/projects/ffzefzef3/certificates",
      {},
      "POST"
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

    project.addCertificate("certif", "key", "chain").then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
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

  it("Load the theme", done => {
    fetchMock.mock(
      "https://test.com/vendor.json",
      {
        color: "#FFFFF"
      },
      "GET"
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

    project.loadTheme().then(theme => {
      assert.equal(theme.color, "#FFFFF");
      assert.equal(theme.logo, "https://test.com/images/logo.svg");
      assert.equal(theme.smallLogo, "https://test.com/images/logo-ui.svg");
      assert.equal(theme.emailLogo, "https://test.com/images/logo-email.png");
      done();
    });
  });

  it("Get Capabilities", done => {
    const capabilities = {
      id: "capabilities",
      _links: {
        self: {
          href:
            "https://test.com/api/projects/ffzefzef3/capabilities/capabilities"
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

    project.getCapabilities().then(({ source_operation }) => {
      assert.equal(source_operation.enabled, true);
      done();
    });
  });
});
