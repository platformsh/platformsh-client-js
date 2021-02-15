/* global beforeEach, afterEach*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import Client from "../src";
import Invitation from "../src/model/Invitation";

const _fetch = (url, data, ...params) =>
  fetchMock.mock(url, JSON.stringify(data), ...params);

describe("Client", () => {
  let client;
  const { authentication_url, api_url, account_url } = getConfig();

  beforeEach(function() {
    fetchMock.mock(`${authentication_url}/oauth2/token`, {
      access_token: "test"
    });
    client = new Client();
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get current Account", done => {
    fetchMock.mock(`${api_url}/me`, {
      id: 1,
      display_name: "test",
      projects: [
        {
          id: "ffzefzef",
          name: "greatProject",
          endpoint: "http://test.com/projects/ffzefzef"
        }
      ]
    });
    client.getAccountInfo().then(me => {
      assert.equal(me.display_name, "test");
      done();
    });
  });

  it("Get project", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3`, {
      id: "ffzefzef1",
      title: "greatProject",
      endpoint: "http://test.com/projects/ffzefzef1"
    });
    client.getProject("ffzefzef3").then(project => {
      assert.equal(project.title, "greatProject");
      assert.equal(project.constructor.name, "Project");
      done();
    });
  });

  it("Get environments", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments`, [
      {
        id: 1,
        name: "bestEnv"
      }
    ]);
    client.getEnvironments("ffzefzef3").then(environments => {
      assert.equal(environments.length, 1);
      assert.equal(environments[0].id, 1);
      assert.equal(environments[0].name, "bestEnv");
      assert.equal(environments[0].constructor.name, "Environment");
      done();
    });
  });

  it("Get environment", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1`, {
      id: 1,
      name: "bestEnv"
    });
    client.getEnvironment("ffzefzef3", "1").then(environment => {
      assert.equal(environment.id, 1);
      assert.equal(environment.name, "bestEnv");
      assert.equal(environment.constructor.name, "Environment");
      done();
    });
  });

  it("Get activities", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1/activities`, [
      {
        id: 1,
        completion_percent: 50
      }
    ]);
    client.getEnvironmentActivities("ffzefzef3", "1").then(activities => {
      assert.equal(activities.length, 1);
      assert.equal(activities[0].id, 1);
      assert.equal(activities[0].completion_percent, 50);
      assert.equal(activities[0].constructor.name, "Activity");
      done();
    });
  });

  it("Get certificates", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/certificates`, [
      {
        id: 1,
        key: "test"
      }
    ]);
    client.getCertificates("ffzefzef3").then(certificates => {
      assert.equal(certificates.length, 1);
      assert.equal(certificates[0].id, 1);
      assert.equal(certificates[0].key, "test");
      assert.equal(certificates[0].constructor.name, "Certificate");
      done();
    });
  });

  it("Add certificates", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/certificates`, {}, "POST");

    client
      .addCertificate("ffzefzef3", "certif", "key", "chain")
      .then(result => {
        assert.equal(result.constructor.name, "Result");
        done();
      });
  });

  it("Get domains", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/domains?limit=2`, [
      { id: 1 }
    ]);

    client.getDomains("ffzefzef3", 2).then(domains => {
      assert.equal(domains[0].id, 1);
      assert.equal(domains[0].constructor.name, "Domain");
      done();
    });
  });

  it("Get environment users", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1/access`, [
      { id: 1 }
    ]);

    client.getEnvironmentUsers("ffzefzef3", "1").then(users => {
      assert.equal(users[0].id, 1);
      assert.equal(users[0].constructor.name, "EnvironmentAccess");
      done();
    });
  });

  it("Get project users", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/access`, [{ id: 1 }]);

    client.getProjectUsers("ffzefzef3").then(users => {
      assert.equal(users[0].id, 1);
      assert.equal(users[0].constructor.name, "ProjectAccess");
      done();
    });
  });

  it("Get variables", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/variables?limit=1`, [
      {
        id: 1,
        name: "theVariableName"
      }
    ]);

    client.getProjectVariables("ffzefzef3", 1).then(activities => {
      assert.equal(activities[0].constructor.name, "ProjectLevelVariable");
      assert.equal(activities[0].id, 1);
      done();
    });
  });

  it("Get environment variables", done => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1/variables?limit=1`,
      [
        {
          id: 1,
          name: "theVariableName"
        }
      ]
    );

    client.getEnvironmentVariables("ffzefzef3", "1", 1).then(activities => {
      assert.equal(activities[0].constructor.name, "Variable");
      assert.equal(activities[0].id, 1);
      done();
    });
  });

  it("Get routes", done => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3/environments/1/routes`, [
      {
        id: 1,
        project: "ffzefzef3"
      }
    ]);

    client.getRoutes("ffzefzef3", 1).then(routes => {
      assert.equal(routes[0].constructor.name, "Route");
      assert.equal(routes[0].project, "ffzefzef3");
      done();
    });
  });

  it("Get environment metrics", done => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1/metrics?q=test`,
      { results: 1 }
    );

    client.getEnvironmentMetrics("ffzefzef3", "1", "test").then(metrics => {
      assert.equal(metrics.results, 1);
      assert.equal(metrics.constructor.name, "Metrics");
      done();
    });
  });

  it("Get ssh keys", done => {
    fetchMock.mock(`${api_url}/me`, {
      id: 1,
      name: "test",
      ssh_keys: [
        {
          changed: "2017-03-13T17:38:49+01:00"
        }
      ]
    });
    client.getSshKeys().then(sshkeys => {
      assert.equal(sshkeys.length, 1);
      assert.equal(sshkeys[0].constructor.name, "SshKey");
      done();
    });
  });

  it("Get ssh key", done => {
    fetchMock.mock(`${api_url}/ssh_keys/theId`, {
      changed: "2017-03-13T17:38:49+01:00"
    });
    client.getSshKey({ id: "theId" }).then(sshkey => {
      assert.equal(sshkey.changed, "2017-03-13T17:38:49+01:00");
      assert.equal(sshkey.constructor.name, "SshKey");
      done();
    });
  });

  it("Add a bad ssh key", done => {
    fetchMock.mock(
      `${api_url}/ssh_keys`,
      {
        changed: "2017-03-13T17:38:49+01:00"
      },
      { method: "POST" }
    );
    client.addSshKey("valueofsshkey", "titleofsshkey").catch(err => {
      assert.equal(err.value, "The SSH key is invalid");
      done();
    });
  });

  it("Add a ssh key", done => {
    fetchMock.mock(
      `${api_url}/ssh_keys`,
      {
        changed: "2017-03-13T17:38:49+01:00"
      },
      { method: "POST" }
    );
    const validSshKey =
      "ssh-rsa MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMsT3DdVcyLyrr4nOH2gCd3xvXNAZEDxnHQDFzFRel9tVPnWWkz176NK0tYw2SY6SUOAe/2552BuY1s5PV/HiVwxhpompzZ/xxYHLf+mvN/aCnONKUqPsioYhoD2FtTG4WKIBsNv9S5ZCk8YwvJy6kiABq//W9NnSfP58DXTw8wQIDAQAB"; // eslint-disable-line max-len

    client.addSshKey(validSshKey, "titleofsshkey").then(result => {
      assert.equal(result.constructor.name, "SshKey");
      done();
    });
  });

  it("Clean request", () => {
    const cleanedReq = client.cleanRequest({
      test: "ok",
      testNullValue: null
    });

    assert.equal(cleanedReq.testNullValue, undefined);
    assert.equal(cleanedReq.test, "ok");
  });

  it("Create subscription", done => {
    fetchMock.mock(
      `${api_url}/subscriptions`,
      {
        project_region: "region"
      },
      { method: "POST" }
    );
    const activationCallback = { uri: "http://www.google.fr" };

    client
      .createSubscription({
        region: "region",
        plan: "development",
        title: "title",
        storage: "storage",
        environments: "environments",
        activationCallback
      })
      .then(result => {
        assert.equal(result.constructor.name, "Result");
        done();
      });
  });

  it("Get subscription", done => {
    fetchMock.mock(`${api_url}/subscriptions/1`, {
      project_region: "region"
    });
    client.getSubscription("1").then(subscription => {
      assert.equal(subscription.project_region, "region");
      assert.equal(subscription.constructor.name, "Subscription");
      done();
    });
  });

  it("Get subscriptions", done => {
    fetchMock.mock(`${api_url}/subscriptions`, {
      subscriptions: [
        {
          project_region: "region"
        }
      ]
    });
    client.getSubscriptions().then(subscriptions => {
      assert.equal(subscriptions.length, 1);
      assert.equal(subscriptions[0].project_region, "region");
      assert.equal(subscriptions[0].constructor.name, "Subscription");
      done();
    });
  });

  it("Get subscriptions with filters", done => {
    fetchMock.mock(
      `${api_url}/subscriptions?filter[project_title][value]=Demo&filter[project_title][operator]=Contains`, //eslint-disable-line
      {
        subscriptions: [
          {
            project_region: "region"
          }
        ]
      }
    );
    client
      .getSubscriptions([
        { project_title: { value: "Demo", operator: "Contains" } }
      ])
      .then(subscriptions => {
        assert.equal(subscriptions.length, 1);
        assert.equal(subscriptions[0].project_region, "region");
        assert.equal(subscriptions[0].constructor.name, "Subscription");
        done();
      });
  });

  it("Get subscription estimate", done => {
    fetchMock.mock(
      `${api_url}/subscriptions/estimate?plan=plan&storage=storage&environments=environments&user_licenses=users`,
      {
        key: "value"
      }
    );
    client
      .getSubscriptionEstimate("plan", "storage", "environments", "users")
      .then(estimate => {
        assert.equal(estimate.key, "value");
        done();
      });
  });

  it("Get current deployment informations", done => {
    fetchMock.mock(
      `${api_url}/projects/ffzefzef3/environments/1/deployments/current`,
      {
        webapps: {
          php: {}
        }
      }
    );
    client.getCurrentDeployment("ffzefzef3", "1").then(deployment => {
      assert.equal(deployment.constructor.name, "Deployment");
      done();
    });
  });

  it("Get organizations", done => {
    fetchMock.mock(`${api_url}/organizations`, [
      {
        id: "1",
        name: "org1",
        label: "the organization",
        owner: "10"
      }
    ]);
    client.getOrganizations().then(organizations => {
      assert.equal(organizations[0].id, "1");
      assert.equal(organizations[0].name, "org1");
      assert.equal(organizations[0].label, "the organization");
      assert.equal(organizations[0].constructor.name, "Organization");
      done();
    });
  });

  it("Get organization", done => {
    fetchMock.mock(`${api_url}/organizations/1`, {
      id: "1",
      name: "org1",
      label: "the organization",
      owner: "10"
    });
    client.getOrganization("1").then(organization => {
      assert.equal(organization.id, "1");
      assert.equal(organization.name, "org1");
      assert.equal(organization.label, "the organization");
      assert.equal(organization.constructor.name, "Organization");
      done();
    });
  });

  it("Get teams", done => {
    fetchMock.mock(`${api_url}/me`, {
      teams: [
        {
          id: "1",
          name: "team1",
          parent: "2"
        }
      ]
    });
    client.getTeams().then(teams => {
      assert.equal(teams[0].id, "1");
      assert.equal(teams[0].name, "team1");
      assert.equal(teams[0].parent, "2");
      assert.equal(teams[0].constructor.name, "Team");
      done();
    });
  });

  it("Get team", done => {
    fetchMock.mock(`${api_url}/teams/1`, {
      id: "1",
      name: "team1",
      parent: "2"
    });
    client.getTeam("1").then(team => {
      assert.equal(team.id, "1");
      assert.equal(team.name, "team1");
      assert.equal(team.parent, "2");
      assert.equal(team.constructor.name, "Team");
      done();
    });
  });

  it("Create team", done => {
    fetchMock.mock(`${api_url}/teams`, {}, "POST");
    client.createTeam({ name: "team1" }).then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Create organization", done => {
    fetchMock.mock(`${api_url}/organizations`, {}, "POST");
    client.createOrganization({ name: "organization1" }).then(result => {
      assert.equal(result.constructor.name, "Result");
      done();
    });
  });

  it("Get regions", done => {
    fetchMock.mock(`${account_url}/regions`, [
      {
        available: true,
        endpoint: "https://staging.plat.farm/api",
        id: "us.platform.sh",
        label: "PEPSi Staging",
        private: false,
        provider: "AWS",
        zone: "Europe"
      }
    ]);
    client.getRegions().then(regions => {
      assert.equal(regions[0].id, "us.platform.sh");
      assert.equal(regions[0].endpoint, "https://staging.plat.farm/api");
      assert.equal(regions[0].available, true);
      assert.equal(regions[0].label, "PEPSi Staging");
      assert.equal(regions[0].zone, "Europe");
      assert.equal(regions[0].constructor.name, "Region");
      done();
    });
  });

  it("Get account", done => {
    fetchMock.mock(`${account_url}/users/test`, {
      id: "test",
      display_name: "testdn"
    });
    client.getAccount("test").then(user => {
      assert.equal(user.id, "test");
      assert.equal(user.constructor.name, "Account");
      done();
    });
  });

  it("Get orders", done => {
    fetchMock.mock(`${api_url}/orders?filter[owner]=1`, {
      commerce_order: [
        {
          id: "803635",
          status: "recurring_open",
          owner: "126517",
          address: {
            country: "FR",
            administrative_area: "",
            sub_administrative_area: null,
            locality: "Montpellier",
            dependent_locality: "",
            postal_code: "34000",
            thoroughfare: "256 rue de Thor",
            premise: "",
            sub_premise: null,
            organisation_name: null,
            name_line: "Yann Autissier",
            first_name: "Yann",
            last_name: "Autissier",
            data: null
          },
          vat_number: null,
          billing_period_start: "1525125600",
          billing_period_end: "1527803999",
          total: 4.23,
          components: {
            base_price: {
              display_title: "Subtotal",
              amount: 13.53,
              currency: "EUR"
            },
            "vat|fr_standard|20_2014": {
              display_title: "20% VAT",
              amount: 0.7,
              currency: "EUR"
            },
            voucher: {
              display_title: "Voucher",
              amount: -10,
              currency: "EUR"
            }
          },
          currency: "EUR",
          invoice_url: null
        }
      ],
      count: 57593,
      _links: {
        self: {
          title: "Self",
          href: "http://accounts.psh.local/orders"
        }
      }
    });
    client.getOrders("1").then(orders => {
      assert.equal(orders.length, 1);
      assert.equal(orders[0].constructor.name, "Order");
      done();
    });
  });

  it("Get order", done => {
    fetchMock.mock(
      `${api_url}/orders/1`,
      JSON.stringify({
        id: "31619",
        status: "invoiced",
        owner: "29164",
        address: {
          country: "US",
          administrative_area: "TX",
          sub_administrative_area: null,
          locality: "Belton",
          dependent_locality: "",
          postal_code: "76513",
          thoroughfare: "15 E. Wichita Ln.",
          premise: "",
          sub_premise: null,
          organisation_name: null,
          name_line: "Nicholas Vahalik",
          first_name: "Nicholas",
          last_name: "Vahalik",
          data: null
        },
        vat_number: null,
        billing_period_start: "1448924400",
        billing_period_end: "1451602799",
        total: 10,
        components: {
          base_price: {
            display_title: "Subtotal",
            amount: 10,
            currency: "USD"
          }
        },
        currency: "USD",
        invoice_url: "http://accounts.psh.local/invoices/11959/pdf",
        line_items: [
          {
            project: "Schulman Theatres",
            product: "Development",
            start: "1448924400",
            end: "1451602799",
            quantity: "1.00",
            unit_price: 10,
            total_price: 10,
            components: {
              base_price: {
                display_title: "Subtotal",
                amount: 10,
                currency: "USD"
              }
            }
          }
        ]
      })
    );

    client.getOrder("1").then(order => {
      assert.equal(order.id, "31619");
      assert.equal(order.constructor.name, "Order");
      done();
    });
  });

  describe("Two Factor Authentication", () => {
    it("Get TFA", async () => {
      _fetch(`${api_url}/users/1/totp`, {
        account_name: "//issuer.url.com:user@name.com",
        issuer: "https://issuer.url.com",
        qr_code: "data:image/png;base64,iVBORw0I=",
        secret: "XYZ"
      });

      const response = await client.getTFA("1");
      assert.equal(response.secret, "XYZ");
    });

    it("Enroll TFA", async () => {
      _fetch(`${api_url}/users/1/totp`, ["123"], "POST");

      const response = await client.enrollTFA("1", "XYZ", "000000");
      const params = fetchMock.lastOptions().body;
      assert.deepEqual(response, ["123"]);
      assert.deepEqual(JSON.parse(params), {
        secret: "XYZ",
        passcode: "000000"
      });
    });

    it("Disable TFA", async () => {
      _fetch(`${api_url}/users/1/totp`, null, "DELETE");

      try {
        await client.disableTFA("1");
        assert.ok(true);
      } catch (e) {
        assert.fail();
      }
    });

    it("Reset recovery codes", async () => {
      _fetch(`${api_url}/users/1/codes`, ["22222"], "POST");

      const response = await client.resetRecoveryCodes("1");
      assert.deepEqual(response, ["22222"]);
    });
  });
  it("Get connected accounts", done => {
    const connectedAccounts = [
      { provider: "github", subject: "1" },
      { provider: "bitbucket", subject: "2" },
      { provider: "google", subject: "1" }
    ];

    fetchMock.mock(`${api_url}/users/1/connections`, connectedAccounts);

    client.getConnectedAccounts("1").then(connectedAccount => {
      assert.equal(connectedAccount.length, 3);
      assert.equal(connectedAccount[1].provider, "bitbucket");
      assert.equal(connectedAccount[1].subject, "2");
      assert.equal(connectedAccount[0].constructor.name, "ConnectedAccount");
      done();
    });
  });

  describe("Profile pictures", () => {
    it("Delete", async () => {
      _fetch(`${api_url}/profile/1/picture`, null, "DELETE");

      try {
        await client.deleteProfilePicture("1");
        assert.ok(true);
      } catch (e) {
        assert.fail();
      }
    });

    it("Update", async () => {
      _fetch(`${api_url}/profile/1/picture`, { url: "xyz" }, "POST");

      const response = await client.updateProfilePicture(1, {});

      assert.deepEqual(response, { url: "xyz" });
    });
  });

  describe("Integrations", () => {
    it("Get integrations", done => {
      fetchMock.mock(
        "https://api.platform.sh/api/projects/ffzefzef3/integrations",
        [{ id: 1 }, { id: 2 }]
      );

      client.getIntegrations("ffzefzef3").then(integrations => {
        assert.equal(integrations[0].id, 1);
        assert.equal(integrations[0].constructor.name, "Integration");
        done();
      });
    });

    it("Get integration", done => {
      fetchMock.mock(
        "https://api.platform.sh/api/projects/ffzefzef3/integrations/qwerty",
        { id: "qwerty" }
      );

      client.getIntegration("ffzefzef3", "qwerty").then(integration => {
        assert.equal(integration.id, "qwerty");
        assert.equal(integration.constructor.name, "Integration");
        done();
      });
    });
  });

  describe("Invitations", done => {
    it("Get invitations", async () => {
      const invitationsMock = [
        { state: "pending", id: "1" },
        { state: "pending", id: "2" },
        { state: "pending", id: "3" }
      ];

      fetchMock.mock(
        `${api_url}/projects/project_id/invitations`,
        invitationsMock
      );

      const invitations = await client.getInvitations("project_id");

      assert.equal(invitations.length, 3);
      assert.equal(invitations[1].id, "2");
      assert.equal(invitations[1].state, "pending");
      assert.equal(invitations[0].constructor.name, "Invitation");
    });

    it("Create invitation", async () => {
      fetchMock.mock(
        `${api_url}/projects/project_id/invitations`,
        {
          id: "invitation-id"
        },
        "POST"
      );

      const res = await client.createInvitation(
        "test@psh.com",
        "project_id",
        "view",
        []
      );

      const invitation = new Invitation(res.data);

      assert.equal(invitation.id, "invitation-id");
      assert.equal(invitation.constructor.name, "Invitation");
    });
  });
});
