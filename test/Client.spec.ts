import fetchMock from "fetch-mock";
import { assert, afterEach, beforeEach, describe, it, expect } from "vitest";

import Client from "../src";
import { getConfig } from "../src/config";
import Invitation from "../src/model/Invitation";

const _fetch = (url: string, data: unknown, params?: fetchMock.MockOptions) =>
  fetchMock.mock(url, JSON.stringify(data), params);

describe("Client", () => {
  let client: Client;
  const { authentication_url, api_url } = getConfig();

  beforeEach(() => {
    fetchMock.mock(`${authentication_url}/oauth2/token`, {
      access_token: "test"
    });
    client = new Client({
      api_token: "test",
      api_url,
      authorization: ""
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("Get current Account", async () => {
    fetchMock.mock(`${api_url}/platform/me`, {
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
    await client.getAccountInfo().then(me => {
      assert.equal(me.display_name, "test");
    });
  });

  it("Get project", async () => {
    fetchMock.mock(`${api_url}/projects/ffzefzef3`, {
      id: "ffzefzef1",
      title: "greatProject",
      endpoint: "http://test.com/api/projects/ffzefzef1"
    });
    await client.getProject("ffzefzef3").then(project => {
      assert.equal(project.title, "greatProject");
      assert.equal(project.constructor.name, "Project");
    });
  });

  it("Get environments", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments",
      [
        {
          id: 1,
          name: "bestEnv"
        }
      ]
    );
    await client.getEnvironments("ffzefzef3").then(environments => {
      assert.equal(environments.length, 1);
      assert.equal(environments[0].id, "1");
      assert.equal(environments[0].name, "bestEnv");
      assert.equal(environments[0].constructor.name, "Environment");
    });
  });

  it("Get environment", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1",
      {
        id: 1,
        name: "bestEnv"
      }
    );
    await client.getEnvironment("ffzefzef3", "1").then(environment => {
      assert.equal(environment.id, "1");
      assert.equal(environment.name, "bestEnv");
      assert.equal(environment.constructor.name, "Environment");
    });
  });

  it("Get activities", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/activities",
      [
        {
          id: 1,
          completion_percent: 50
        }
      ]
    );
    await client.getEnvironmentActivities("ffzefzef3", "1").then(activities => {
      assert.equal(activities.length, 1);
      assert.equal(activities[0].id, "1");
      assert.equal(activities[0].completion_percent, 50);
      assert.equal(activities[0].constructor.name, "Activity");
    });
  });

  it("Get certificates", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/certificates",
      [
        {
          id: 1,
          key: "test"
        }
      ]
    );
    await client.getCertificates("ffzefzef3").then(certificates => {
      assert.equal(certificates.length, 1);
      assert.equal(certificates[0].id, "1");
      assert.equal(certificates[0].key, "test");
      assert.equal(certificates[0].constructor.name, "Certificate");
    });
  });

  it("Add certificates", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/certificates",
      {},
      { method: "POST" }
    );

    await client
      .addCertificate("ffzefzef3", "certif", "key", ["chain"])
      .then(result => {
        assert.equal(result.constructor.name, "Result");
      });
  });

  it("Get domains", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/domains?limit=2",
      [{ id: 1 }]
    );

    await client.getDomains("ffzefzef3", 2).then(domains => {
      assert.equal(domains[0].id, "1");
      assert.equal(domains[0].constructor.name, "Domain");
    });
  });

  it("Get environment users", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/access",
      [{ id: 1 }]
    );

    await client.getEnvironmentUsers("ffzefzef3", "1").then(users => {
      assert.equal(users[0].id, "1");
      assert.equal(users[0].constructor.name, "EnvironmentAccess");
    });
  });

  it("Get project users", async () => {
    fetchMock.mock("https://api.platform.sh/api/projects/ffzefzef3/access", [
      { id: 1 }
    ]);

    await client.getProjectUsers("ffzefzef3").then(users => {
      assert.equal(users[0].id, "1");
      assert.equal(users[0].constructor.name, "ProjectAccess");
    });
  });

  it("Get variables", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/variables?limit=1",
      [
        {
          id: 1,
          name: "theVariableName"
        }
      ]
    );

    await client.getProjectVariables("ffzefzef3", 1).then(activities => {
      assert.equal(activities[0].constructor.name, "ProjectLevelVariable");
      assert.equal(activities[0].id, "1");
    });
  });

  it("Get environment variables", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/variables?limit=1",
      [
        {
          id: 1,
          name: "theVariableName"
        }
      ]
    );

    await client
      .getEnvironmentVariables("ffzefzef3", "1", 1)
      .then(activities => {
        assert.equal(activities[0].constructor.name, "Variable");
        assert.equal(activities[0].id, "1");
      });
  });

  it("Get routes", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/routes",
      [
        {
          id: 1,
          project: "ffzefzef3"
        }
      ]
    );

    await client.getRoutes("ffzefzef3", "1").then(routes => {
      assert.equal(routes[0].constructor.name, "Route");
      assert.equal(routes[0].project, "ffzefzef3");
    });
  });

  it("Get environment metrics", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/metrics?q=test",
      { results: 1 }
    );

    await client
      .getEnvironmentMetrics("ffzefzef3", "1", "test")
      .then(metrics => {
        assert.equal(metrics.results, 1);
        assert.equal(metrics.constructor.name, "Metrics");
      });
  });

  it("Get ssh keys", async () => {
    fetchMock.mock(`${api_url}/platform/me`, {
      id: 1,
      name: "test",
      ssh_keys: [
        {
          changed: "2017-03-13T17:38:49+01:00"
        }
      ]
    });
    await client.getSshKeys().then(sshkeys => {
      assert.equal(sshkeys.length, 1);
      assert.equal(sshkeys[0].constructor.name, "SshKey");
    });
  });

  it("Get ssh key", async () => {
    fetchMock.mock(`${api_url}/v1/ssh_keys/theId`, {
      changed: "2017-03-13T17:38:49+01:00"
    });
    await client.getSshKey("theId").then(sshkey => {
      assert.equal(sshkey.changed, "2017-03-13T17:38:49+01:00");
      assert.equal(sshkey.constructor.name, "SshKey");
    });
  });

  it("Add a bad ssh key", async () => {
    fetchMock.mock(
      `${api_url}/v1/ssh_keys`,
      {
        changed: "2017-03-13T17:38:49+01:00"
      },
      { method: "POST" }
    );

    await expect(async () => {
      await client.addSshKey("valueofsshkey", "titleofsshkey");
    }).rejects.toThrowErrorMatchingInlineSnapshot(`
      {
        "value": "The SSH key is invalid",
      }
    `);
  });

  it("Add a ssh key", async () => {
    fetchMock.mock(
      `${api_url}/v1/ssh_keys`,
      {
        changed: "2017-03-13T17:38:49+01:00"
      },
      { method: "POST" }
    );
    const validSshKey =
      "ssh-rsa MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMsT3DdVcyLyrr4nOH2gCd3xvXNAZEDxnHQDFzFRel9tVPnWWkz176NK0tYw2SY6SUOAe/2552BuY1s5PV/HiVwxhpompzZ/xxYHLf+mvN/aCnONKUqPsioYhoD2FtTG4WKIBsNv9S5ZCk8YwvJy6kiABq//W9NnSfP58DXTw8wQIDAQAB";

    await client.addSshKey(validSshKey, "titleofsshkey").then(result => {
      assert.equal(result.constructor.name, "SshKey");
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

  it("Create subscription", async () => {
    fetchMock.mock(
      `${api_url}/v1/subscriptions`,
      {
        project_region: "region"
      },
      { method: "POST" }
    );
    const activationCallback = { uri: "http://www.google.fr" };

    await client
      .createSubscription({
        region: "region",
        plan: "development",
        title: "title",
        defaultBranch: "production",
        storage: "storage",
        environments: "environments",
        activationCallback
      })
      .then(result => {
        assert.equal(result.constructor.name, "Result");
      });
  });

  it("Get subscription", async () => {
    fetchMock.mock(`${api_url}/v1/subscriptions/1`, {
      project_region: "region"
    });
    await client.getSubscription("1").then(subscription => {
      assert.equal(subscription.project_region, "region");
      assert.equal(subscription.constructor.name, "Subscription");
    });
  });

  it("Get organization subscription", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions/1`, {
      project_region: "region"
    });
    await client
      .getOrganizationSubscription("aliceOrg", "1")
      .then(subscription => {
        assert.equal(subscription.project_region, "region");
        assert.equal(subscription.constructor.name, "OrganizationSubscription");
      });
  });

  it("Get subscriptions", async () => {
    fetchMock.mock(`${api_url}/v1/subscriptions`, {
      subscriptions: [
        {
          project_region: "region"
        }
      ]
    });
    await client.getSubscriptions([]).then(subscriptions => {
      assert.equal(subscriptions.length, 1);
      assert.equal(subscriptions[0].project_region, "region");
      assert.equal(subscriptions[0].constructor.name, "Subscription");
    });
  });

  it("Get organization subscriptions", async () => {
    fetchMock.mock(`${api_url}/organizations/aliceOrg/subscriptions`, {
      items: [
        {
          project_region: "region"
        }
      ]
    });
    await client
      .getOrganizationSubscriptions("aliceOrg")
      .then(subscriptions => {
        assert.equal(subscriptions.items.length, 1);
        assert.equal(subscriptions.items[0].project_region, "region");
        assert.equal(
          subscriptions.items[0].constructor.name,
          "OrganizationSubscription"
        );
      });
  });

  it("Get subscriptions with filters", async () => {
    fetchMock.mock(
      `${api_url}/v1/subscriptions?filter[project_title][value]=Demo&filter[project_title][operator]=Contains`,
      {
        subscriptions: [
          {
            project_region: "region"
          }
        ]
      }
    );
    await client
      .getSubscriptions([
        { project_title: { value: "Demo", operator: "Contains" } }
      ])
      .then(subscriptions => {
        assert.equal(subscriptions.length, 1);
        assert.equal(subscriptions[0].project_region, "region");
        assert.equal(subscriptions[0].constructor.name, "Subscription");
      });
  });

  it("Get subscription estimate", async () => {
    const params = {
      plan: "plan",
      storage: 1,
      environments: 1,
      user_licenses: 1,
      backups: "backups"
    };
    fetchMock.mock(
      `${api_url}/v1/subscriptions/estimate?plan=plan&storage=1&environments=1&user_licenses=1&backups=backups`,
      {
        key: "value"
      }
    );
    await client.getSubscriptionEstimate(params).then(estimate => {
      assert.equal(estimate.key, "value");
    });
  });

  it("Get current deployment informations", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/deployments/current",
      {
        webapps: {
          php: {}
        }
      }
    );
    await client.getCurrentDeployment("ffzefzef3", "1").then(deployment => {
      assert.equal(deployment.constructor.name, "Deployment");
    });
  });

  it("Get organization subscription estimate", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceorg/subscriptions/estimate?plan=plan&storage=1&environments=1&user_licenses=1&backups=backups&organizationId=`,
      {
        key: "value"
      }
    );
    await client
      .getOrganizationSubscriptionEstimate("aliceorg", {
        plan: "plan",
        storage: 1,
        environments: 1,
        user_licenses: 1,
        backups: "backups",
        organizationId: ""
      })

      .then(estimate => {
        assert.equal(estimate.key, "value");
      });
  });

  it("Get current deployment informations", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/projects/ffzefzef3/environments/1/deployments/current",
      {
        webapps: {
          php: {}
        }
      }
    );
    await client.getCurrentDeployment("ffzefzef3", "1").then(deployment => {
      assert.equal(deployment.constructor.name, "Deployment");
    });
  });

  it("Get organizations", async () => {
    fetchMock.mock("https://api.platform.sh/api/organizations", {
      items: [
        {
          id: "1",
          name: "org1",
          label: "the organization",
          owner: "10"
        }
      ]
    });
    await client.getOrganizations().then(organizations => {
      assert.equal(organizations[0].id, "1");
      assert.equal(organizations[0].name, "org1");
      assert.equal(organizations[0].label, "the organization");
      assert.equal(organizations[0].constructor.name, "Organization");
    });
  });

  it("Get organizations with user id", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/users/aliceId/organizations?sort=label",
      {
        items: [
          {
            id: "1",
            name: "org1",
            label: "the organization",
            owner: "10"
          }
        ]
      }
    );
    await client.getOrganizations({ userId: "aliceId" }).then(organizations => {
      assert.equal(organizations[0].id, "1");
      assert.equal(organizations[0].name, "org1");
      assert.equal(organizations[0].label, "the organization");
      assert.equal(organizations[0].constructor.name, "Organization");
    });
  });

  it("Get organization", async () => {
    fetchMock.mock("https://api.platform.sh/api/organizations/1", {
      id: "1",
      name: "org1",
      label: "the organization",
      owner: "10"
    });
    await client.getOrganization("1").then(organization => {
      assert.equal(organization.id, "1");
      assert.equal(organization.name, "org1");
      assert.equal(organization.label, "the organization");
      assert.equal(organization.constructor.name, "Organization");
    });
  });

  it("Get teams", async () => {
    fetchMock.mock("https://api.platform.sh/api/platform/me", {
      teams: [
        {
          id: "1",
          name: "team1",
          parent: "2"
        }
      ]
    });
    await client.getTeams().then(teams => {
      assert.equal(teams?.[0].id, "1");
      assert.equal(teams?.[0].name, "team1");
      assert.equal(teams?.[0].parent, "2");
      assert.equal(teams?.[0].constructor.name, "Team");
    });
  });

  it("Get team", async () => {
    fetchMock.mock("https://api.platform.sh/api/platform/teams/1", {
      id: "1",
      name: "team1",
      parent: "2"
    });
    await client.getTeam("1").then(team => {
      assert.equal(team.id, "1");
      assert.equal(team.name, "team1");
      assert.equal(team.parent, "2");
      assert.equal(team.constructor.name, "Team");
    });
  });

  it("Create team", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/platform/teams",
      {},
      { method: "POST" }
    );
    await client.createTeam({ name: "team1" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Create organization", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations",
      {},
      { method: "POST" }
    );
    await client.createOrganization({ name: "organization1" }).then(result => {
      assert.equal(result.constructor.name, "Result");
    });
  });

  it("Get regions", async () => {
    fetchMock.mock("https://accounts.platform.sh/api/platform/regions", {
      regions: [
        {
          available: true,
          endpoint: "https://staging.plat.farm/api",
          id: "us.platform.sh",
          label: "PEPSi Staging",
          private: false,
          provider: "AWS",
          zone: "Europe"
        }
      ]
    });
    await client.getRegions().then(regions => {
      assert.equal(regions[0].id, "us.platform.sh");
      assert.equal(regions[0].endpoint, "https://staging.plat.farm/api");
      assert.equal(regions[0].available, true);
      assert.equal(regions[0].label, "PEPSi Staging");
      assert.equal(regions[0].zone, "Europe");
      assert.equal(regions[0].constructor.name, "Region");
    });
  });

  it("Get organization regions", async () => {
    fetchMock.mock(
      "https://api.platform.sh/api/organizations/aliceorgid/regions",
      {
        items: [
          {
            available: true,
            endpoint: "https://staging.plat.farm/api",
            id: "us.platform.sh",
            label: "PEPSi Staging",
            private: false,
            provider: "AWS",
            zone: "Europe"
          }
        ]
      }
    );
    await client.getOrganizationRegions("aliceorgid").then(result => {
      assert.equal(result.items[0].id, "us.platform.sh");
      assert.equal(result.items[0].endpoint, "https://staging.plat.farm/api");
      assert.equal(result.items[0].available, true);
      assert.equal(result.items[0].label, "PEPSi Staging");
      assert.equal(result.items[0].zone, "Europe");
      assert.equal(result.items[0].constructor.name, "OrganizationRegion");
    });
  });

  it("Get account", async () => {
    fetchMock.mock("https://accounts.platform.sh/api/platform/users/test", {
      id: "test",
      display_name: "testdn"
    });
    await client.getAccount("test").then(user => {
      assert.equal(user.id, "test");
      assert.equal(user.constructor.name, "Account");
    });
  });

  it("Get orders", async () => {
    fetchMock.mock(`${api_url}/v1/orders?filter[owner]=1`, {
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
          href: "http://accounts.psh.local/api/platform/orders"
        }
      }
    });
    await client.getOrders("1").then(orders => {
      assert.equal(orders.length, 1);
      assert.equal(orders[0].constructor.name, "Order");
    });
  });

  it("Get organization orders", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceorgid/orders?filter[owner]=1`,
      {
        items: [
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
            href: "http://accounts.psh.local/api/platform/orders"
          }
        }
      }
    );
    await client
      .getOrganizationOrders("aliceorgid", { owner: "1" })
      .then(orders => {
        assert.equal(orders.length, 1);
        assert.equal(orders[0].constructor.name, "OrganizationOrder");
      });
  });

  it("Get order", async () => {
    fetchMock.mock(
      `${api_url}/v1/orders/1`,
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

    await client.getOrder("1").then(order => {
      assert.equal(order.id, "31619");
      assert.equal(order.constructor.name, "Order");
    });
  });

  it("Get organization order", async () => {
    fetchMock.mock(
      `${api_url}/organizations/aliceorgid/orders/1`,
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

    await client.getOrganizationOrder("aliceorgid", "1").then(order => {
      assert.equal(order.id, "31619");
      assert.equal(order.constructor.name, "OrganizationOrder");
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
      _fetch(`${api_url}/users/1/totp`, ["123"], { method: "POST" });

      const response = await client.enrollTFA("1", "XYZ", "000000");
      const params = fetchMock.lastOptions()?.body as string;
      assert.deepEqual(response, ["123"]);
      assert.deepEqual(JSON.parse(params), {
        secret: "XYZ",
        passcode: "000000"
      });
    });

    it("Disable TFA", async () => {
      _fetch(`${api_url}/users/1/totp`, null, { method: "DELETE" });

      try {
        await client.disableTFA("1");
        assert.ok(true);
      } catch (e) {
        assert.fail();
      }
    });

    it("Reset recovery codes", async () => {
      _fetch(`${api_url}/users/1/codes`, ["22222"], { method: "POST" });

      const response = await client.resetRecoveryCodes("1");
      assert.deepEqual(response, ["22222"]);
    });
  });
  it("Get connected accounts", async () => {
    const connectedAccounts = [
      { provider: "github", subject: "1" },
      { provider: "bitbucket", subject: "2" },
      { provider: "google", subject: "1" }
    ];

    fetchMock.mock(`${api_url}/users/1/connections`, connectedAccounts);

    await client.getConnectedAccounts("1").then(connectedAccount => {
      assert.equal(connectedAccount.length, 3);
      assert.equal(connectedAccount[1].provider, "bitbucket");
      assert.equal(connectedAccount[1].subject, "2");
      assert.equal(connectedAccount[0].constructor.name, "ConnectedAccount");
    });
  });

  describe("Profile pictures", () => {
    it("Delete", async () => {
      _fetch(`${api_url}/v1/profile/1/picture`, null, { method: "DELETE" });

      try {
        await client.deleteProfilePicture("1");
        assert.ok(true);
      } catch (e) {
        assert.fail();
      }
    });

    it("Update", async () => {
      _fetch(
        `${api_url}/v1/profile/1/picture`,
        { url: "xyz" },
        { method: "POST" }
      );

      const response = await client.updateProfilePicture("1", {} as FormData);

      assert.deepEqual(response, { url: "xyz" });
    });
  });

  describe("Integrations", () => {
    it("Get integrations", async () => {
      fetchMock.mock(
        "https://api.platform.sh/api/projects/ffzefzef3/integrations",
        [{ id: 1 }, { id: 2 }]
      );

      await client.getIntegrations("ffzefzef3").then(integrations => {
        assert.equal(integrations[0].id, "1");
        assert.equal(integrations[0].constructor.name, "Integration");
      });
    });

    it("Get integration", async () => {
      fetchMock.mock(
        "https://api.platform.sh/api/projects/ffzefzef3/integrations/qwerty",
        { id: "qwerty" }
      );

      await client.getIntegration("ffzefzef3", "qwerty").then(integration => {
        assert.equal(integration.id, "qwerty");
        assert.equal(integration.constructor.name, "Integration");
      });
    });
  });

  describe("Invitations", () => {
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
        { method: "POST" }
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

  describe("Environment types", () => {
    it("Get environment types", async () => {
      const environmentTypesMock = [
        {
          id: "development",
          _links: {
            self: {
              href: "http://admin.local.c-g.io/api/projects/test_project/environment-types/development"
            },
            "#edit": {
              href: "https://test.com/api/projects/test_project/environment-types/development"
            },
            "#access": {
              href: "https://test.com/api/projects/test_project/environment-types/development/access"
            }
          },
          attributes: {}
        },
        {
          id: "production",
          _links: {
            self: {
              href: "http://admin.local.c-g.io/api/projects/test_project/environment-types/production"
            },
            "#edit": {
              href: "https://test.com/api/projects/test_project/environment-types/production"
            },
            "#access": {
              href: "https://test.com/api/projects/test_project/environment-types/production/access"
            }
          },
          attributes: {}
        },
        {
          id: "staging",
          _links: {
            self: {
              href: "http://admin.local.c-g.io/api/projects/test_project/environment-types/staging"
            },
            "#edit": {
              href: "https://test.com/api/projects/test_project/environment-types/staging"
            },
            "#access": {
              href: "https://test.com/api/projects/test_project/environment-types/staging/access"
            }
          },
          attributes: {}
        }
      ];

      fetchMock.mock(
        `${api_url}/projects/project_id/environment-types`,
        environmentTypesMock
      );

      fetchMock.mock(
        "https://test.com/api/projects/test_project/environment-types/staging/access",
        [
          {
            id: "alice",
            user: "alice",
            role: "admin"
          }
        ]
      );
      fetchMock.mock(
        "https://test.com/api/projects/test_project/environment-types/production/access",
        [
          {
            id: "alice",
            user: "alice",
            role: "admin"
          }
        ]
      );
      fetchMock.mock(
        "https://test.com/api/projects/test_project/environment-types/development/access",
        [
          {
            id: "alice",
            user: "alice",
            role: "admin"
          }
        ]
      );

      const environmentTypes =
        await client.getProjectEnvironmentTypesWithAccesses("project_id");

      assert.equal(environmentTypes.length, 3);
      assert.equal(environmentTypes[0].id, "development");
      assert.equal(environmentTypes[0].accesses[0].id, "alice");
      assert.equal(environmentTypes[0].constructor.name, "EnvironmentType");
      assert.equal(
        environmentTypes[0].accesses[0].constructor.name,
        "ProjectAccess"
      );
    });
  });
  describe("Organization members", () => {
    it("Get organization members", async () => {
      fetchMock.mock(`${api_url}/organizations/aliceOrg/members`, {
        items: [
          {
            id: "alice"
          }
        ]
      });
      await client.getOrganizationMembers("aliceOrg").then(members => {
        assert.equal(members.items[0].id, "alice");
        assert.equal(members.items[0].constructor.name, "OrganizationMember");
      });
    });

    it("Get an organization member", async () => {
      fetchMock.mock(`${api_url}/organizations/aliceOrg/members/1`, {
        id: "alice"
      });
      await client.getOrganizationMember("aliceOrg", "1").then(member => {
        assert.equal(member.id, "alice");
        assert.equal(member.constructor.name, "OrganizationMember");
      });
    });
  });
  describe("Organization payment", () => {
    it("Create payment intent", async () => {
      fetchMock.mock(
        `${api_url}/organizations/aliceOrgId/payment-source/intent`,
        {
          id: "alice"
        },
        { method: "POST" }
      );
      await client
        .createOrganizationPaymentSourceIntent("aliceOrgId")
        .then(intent => {
          assert.equal(intent.id, "alice");
          // assert.equal(intent.constructor.name, "OrganizationPaymentSource");
        });
    });
  });
  describe("Comments", () => {
    it("Create comments", async () => {
      fetchMock.mock(
        `${api_url}/v1/comments`,
        {
          id: "alice"
        },
        { method: "POST" }
      );
      await client
        .sendComment({
          ticket_id: "test"
        })
        .then(result => {
          assert.equal(result.constructor.name, "Result");
        });
    });
  });
  describe("Organization vouchers", () => {
    it("Get organization vouchers", async () => {
      fetchMock.mock(`${api_url}/organizations/aliceOrg/vouchers`, {
        vouchers: [
          {
            code: "voucher-1"
          }
        ]
      });
      await client.getOrganizationVouchers("aliceOrg").then(vouchers => {
        assert.equal(vouchers.vouchers[0].code, "voucher-1");
        assert.equal(vouchers.constructor.name, "OrganizationVoucher");
      });
    });

    it("Get an organization member", async () => {
      fetchMock.mock(`${api_url}/organizations/aliceOrg/members/1`, {
        id: "alice"
      });
      await client.getOrganizationMember("aliceOrg", "1").then(member => {
        assert.equal(member.id, "alice");
        assert.equal(member.constructor.name, "OrganizationMember");
      });
    });
  });
});
