import type { RequestOptions } from "./api";
import request from "./api";
import type { JWTToken } from "./authentication";
import connector, { wipeToken } from "./authentication";
import type { ClientConfiguration } from "./config";
import { getConfig, setConfig } from "./config";
import entities from "./model";
import type Activity from "./model/Activity";
import type {
  CreateAccessParams,
  DeleteAccessParams,
  UpdateAccessParams
} from "./model/EnvironmentType";
import type Me from "./model/Me";
import type { APIObject } from "./model/Ressource";
import type { TicketQueryParams } from "./model/Ticket";

export const models = entities;

export const api = request;

export default class Client {
  authenticationPromise: Promise<JWTToken>;
  getAccountInfoPromise: Promise<Me> | undefined;

  constructor(authenticationConfig: ClientConfiguration) {
    setConfig(authenticationConfig);

    this.authenticationPromise = connector(authenticationConfig);
  }

  async getAccessToken() {
    return this.authenticationPromise;
  }

  getConfig() {
    return getConfig();
  }

  wipeToken() {
    wipeToken();
  }

  async reAuthenticate() {
    this.authenticationPromise = connector(getConfig(), true);

    return this.authenticationPromise;
  }

  /**
   * Get account information for the logged-in user.
   *
   * @param bool reset
   *
   * @return promise
   */
  async getAccountInfo(reset = false) {
    if (!this.getAccountInfoPromise || reset) {
      this.getAccountInfoPromise = entities.Me.get(reset);
    }

    return this.getAccountInfoPromise;
  }

  /**
   * Locate a project by ID.
   *
   * @param string id
   *   The project ID.
   *
   * @return string
   *   The project's API endpoint.
   */
  async locateProject(id: string) {
    return this.getProjects().then(async projects => {
      if (!projects) {
        return;
      }
      const project = projects.find(p => p.id === id);

      if (project?.endpoint) {
        return project.endpoint;
      }
      const { account_url } = getConfig();

      return request(`${account_url}/platform/projects/${id}`, "GET").then(
        result => result.endpoint || false
      );
    });
  }

  /**
   * Get the logged-in user's projects.
   *
   * @param bool reset
   *
   * @return Promise Project[]
   */
  async getProjects() {
    return this.getAccountInfo().then(me => {
      if (!me) {
        return false;
      }

      return me.projects.map(
        project => new entities.Project(project, project.endpoint)
      );
    });
  }

  /**
   * Get a single project by its ID.
   *
   * @param string id
   * @param string hostname
   * @param bool   https
   *
   * @return Project|false
   */
  async getProject(id: string) {
    return entities.Project.get({ id });
  }

  /**
   * Get the environments of project projectId
   *
   * @param string projectId
   *
   * @return Promise Environment[]
   */
  async getEnvironments(projectId: string) {
    return entities.Environment.query({ projectId });
  }

  /**
   * Get the environment environmentId of the projectId project
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Promise Environment
   */
  async getEnvironment(projectId: string, environmentId: string) {
    return entities.Environment.get({ projectId, id: environmentId });
  }

  /**
   * Get the activities of the environment environmentId of the project projectId
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Promise Activity[]
   */
  async getEnvironmentActivities(
    projectId: string,
    environmentId: string,
    type?: string,
    starts_at?: Date
  ) {
    const startsAt = starts_at?.toISOString();
    return entities.Activity.query({
      projectId,
      environmentId,
      type,
      starts_at: startsAt
    });
  }

  async getEnvironmentActivity(
    projectId: string,
    environmentId: string,
    activityId: string
  ) {
    return entities.Activity.get({
      projectId,
      environmentId,
      id: activityId
    });
  }

  /**
   * Get the certificates of project projectId
   *
   * @param string environmentId
   *
   * @return Promise Certificate[]
   */
  async getCertificates(projectId: string) {
    return entities.Certificate.query({ projectId });
  }

  /**
   * Add certificate to the project projectId
   * @param string projectId
   * @param string certificate
   * @param string key
   * @param array  chain
   */
  async addCertificate(
    projectId: string,
    certificate: string,
    key: string,
    chain: string[] = []
  ) {
    const { api_url } = getConfig();
    const certificateUrl = `${api_url}/projects/${projectId}/certificates`;
    const certificateObj = new entities.Certificate(
      { certificate, key, chain },
      certificateUrl
    );

    return certificateObj.save();
  }

  /**
   * Get the domains of the project projectId
   *
   * @param string projectId
   *
   * @return Promise Domain[]
   */
  async getDomains(projectId: string, limit: number) {
    return entities.Domain.query({ projectId, limit });
  }

  /**
   * Get the accesses of the environment environmentId of the project projectId
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Promise EnvironmentAccess[]
   */
  async getEnvironmentUsers(projectId: string, environmentId: string) {
    return entities.EnvironmentAccess.query({ projectId, environmentId });
  }

  /**
   * Get the route configuration.
   *
   *
   * @return Route
   */
  async getRoutes(projectId: string, environmentId: string) {
    return entities.Route.query({ projectId, environmentId });
  }

  /**
   * Get the accesses of the project projectId
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Promise EnvironmentAccess[]
   */
  async getProjectUsers(projectId: string) {
    return entities.ProjectAccess.query({ projectId });
  }

  /**
   * Get a list of variables.
   *
   * @param string projectId
   * @param int limit
   *
   * @return ProjectLevelVariable[]
   */
  async getProjectVariables(projectId: string, limit?: number) {
    return entities.ProjectLevelVariable.query({ projectId, limit });
  }

  /**
   * Get a list of variables.
   *
   * @param string projectId
   * @param int limit
   *
   * @return ProjectLevelVariable[]
   */
  async getEnvironmentVariables(
    projectId: string,
    environmentId: string,
    limit?: number
  ) {
    return entities.Variable.query({ projectId, environmentId, limit });
  }

  /**
   * Get the metrics of the environment environmentId of the project projectId
   *
   * @param string projectId
   * @param string environmentId
   * @param string q
   *
   * @return Promise Metrics[]
   */
  async getEnvironmentMetrics(
    projectId: string,
    environmentId: string,
    q: string
  ) {
    return entities.Metrics.get({ projectId, environmentId, q });
  }

  /**
   * Get backups of environment {environmentId} of project {projectId}
   *
   * @param projectId
   * @param environmentId
   *
   * @return Promise EnvironmentBackup[]
   */
  async getEnvironmentBackups(projectId: string, environmentId: string) {
    return entities.EnvironmentBackup.query({ projectId, environmentId });
  }

  /**
   * Get domains of environment {environmentId} of project {projectId}
   *
   * @param projectId
   * @param environmentId
   *
   * @return Promise EnvironmentDomains[]
   */
  async getEnvironmentDomains(projectId: string, environmentId: string) {
    return entities.EnvironmentDomain.query({ projectId, environmentId });
  }

  /**
   * Get the integrations of project projectId
   *
   * @param string projectId
   * @param environmentId
   *
   * @return Promise Integration[]
   */
  async getIntegrations(projectId: string) {
    return entities.Integration.query({ projectId });
  }

  /**
   * Get the integration integrationId of the projectId project
   *
   * @param string projectId
   * @param string integrationId
   *
   * @return Promise Integration
   */
  async getIntegration(projectId: string, integrationId: string) {
    return entities.Integration.get({ projectId, id: integrationId });
  }

  /**
   * Get the activities of the integration integrationId of the project projectId
   *
   * @param string projectId
   * @param string integrationId
   *
   * @return Promise Activity[]
   */
  async getIntegrationActivities(
    projectId: string,
    integrationId: string,
    type: string,
    starts_at?: Date
  ) {
    const { api_url } = getConfig();
    const startsAt = starts_at?.toISOString();
    const url = `${api_url}/projects/${projectId}/integrations/${integrationId}/activities`;
    return entities.Activity.query(
      {
        type,
        starts_at: startsAt
      },
      url
    );
  }

  /**
   * Get the logged-in user's SSH keys.
   *
   * @param bool reset
   *
   * @return SshKey[]
   */
  async getSshKeys() {
    return this.getAccountInfo().then(me => entities.SshKey.wrap(me.ssh_keys));
  }

  /**
   * Get a single SSH key by its ID.
   *
   * @param string|int id
   *
   * @return SshKey|false
   */
  async getSshKey(id: string) {
    return entities.SshKey.get({ id });
  }

  /**
   * Add an SSH public key to the logged-in user's account.
   *
   * @param string value The SSH key value.
   * @param string title A title for the key (optional).
   *
   * @return Result
   */
  async addSshKey(value: string, title: string) {
    const values = this.cleanRequest({ value, title });

    return new entities.SshKey(values).save();
  }

  /**
   * Filter a request array to remove null values.
   *
   * @param object request
   *
   * @return object
   */
  cleanRequest(req: Record<string, any>) {
    const cleanedReq: Record<string, any> = {};
    const keys = Object.keys(req).filter(
      key => req[key] !== null && typeof req[key] !== "undefined"
    );

    for (const key of keys) {
      cleanedReq[key] = req[key];
    }

    return cleanedReq;
  }

  /**
   * Create a new Platform.sh subscription.
   *
   * @param string region  The region. See Subscription::$availableRegions.
   * @param string plan    The plan. See Subscription::$availablePlans.
   * @param string title   The project title.
   * @param string defaultBranch The default branch.
   * @param int    storage The storage of each environment, in MiB.
   * @param int    environments The number of available environments.
   * @param array  activationCallback An activation callback for the subscription.
   *
   * @return Subscription
   */
  async createSubscription(config: APIObject) {
    const {
      region,
      plan = "development",
      title,
      defaultBranch,
      storage,
      environments,
      optionsUrl,
      vendor,
      optionsCustom
    } = config;
    const values = this.cleanRequest({
      project_region: region,
      plan,
      project_title: title,
      default_branch: defaultBranch,
      storage,
      environments,
      options_url: optionsUrl,
      vendor,
      options_custom: optionsCustom
    });

    return new entities.Subscription(values).save();
  }

  /**
   * Create a new Platform.sh subscription.
   *
   * @param string region  The region. See Subscription::$availableRegions.
   * @param string plan    The plan. See Subscription::$availablePlans.
   * @param string title   The project title.
   * @param string defaultBranch The default branch.
   * @param int    storage The storage of each environment, in MiB.
   * @param int    environments The number of available environments.
   * @param array  activationCallback An activation callback for the subscription.
   *
   * @return Subscription
   */
  async createOrganizationSubscription(config: APIObject) {
    const {
      organizationId,
      region,
      plan = "development",
      title,
      defaultBranch,
      storage,
      environments,
      optionsUrl,
      vendor,
      optionsCustom
    } = config;
    const values = this.cleanRequest({
      project_region: region,
      plan,
      project_title: title,
      default_branch: defaultBranch,
      storage,
      environments,
      options_url: optionsUrl,
      vendor,
      options_custom: optionsCustom,
      organizationId
    });

    return new entities.OrganizationSubscription(values).save();
  }

  /**
   * Get a subscription by its ID.
   *
   * @param string|int id
   *
   * @return Subscription|false
   */
  async getSubscription(id: string) {
    return entities.Subscription.get({ id });
  }

  /**
   * Get subscriptions.
   *
   * @param array filters
   *
   * @return Subscriptions[]
   */
  async getSubscriptions(filter: object, all?: boolean) {
    return entities.Subscription.query({ filter, all: all && 1 });
  }

  /**
   * Get organization subscriptions.
   *
   * @param string organizationId
   * @param array filters
   *
   * @return OrganizationSubscriptions[]
   */
  async getOrganizationSubscriptions(
    organizationId: string,
    params?: Record<string, any>
  ) {
    return entities.OrganizationSubscription.query({
      ...params,
      organizationId
    });
  }

  /**
   * Get organization subscription.
   *
   * @param string organizationId
   * @param string subscriptionId
   *
   * @return OrganizationSubscription
   */
  async getOrganizationSubscription(organizationId: string, id: string) {
    return entities.OrganizationSubscription.get({ organizationId, id });
  }

  /**
   * Get organization subscription can create, which determines if a
   * new subscription can be created under an organization.
   *
   * @param string organizationId
   */
  async getOrganizationSubscriptionCanCreate(organizationId: string) {
    return entities.OrganizationSubscription.getCanCreate({ organizationId });
  }

  /**
   * Get organization members.
   *
   * @param string organizationId
   * @param array filters
   *
   * @return CursoredResult
   */
  async getOrganizationMembers(
    organizationId: string,
    filter?: object,
    sort?: string
  ) {
    return entities.OrganizationMember.query({ organizationId, filter, sort });
  }

  /**
   * Get an organization member.
   *
   * @param string organizationId
   * @param string id
   *
   * @return OrganizationMember
   */
  async getOrganizationMember(organizationId: string, id: string) {
    return entities.OrganizationMember.get({ organizationId, id });
  }

  /**
   * Initalize the environment for a new subscription
   *
   * @param string projectId
   * @param object options
   * @param string environmentId
   */
  async initializeEnvironment(
    projectId: string,
    options: RequestOptions,
    environmentId = "master"
  ) {
    const { api_url } = getConfig();

    return request(
      `${api_url}/projects/${projectId}/environments/${environmentId}/initialize`,
      "POST",
      options
    );
  }

  /**
   * Estimate the cost of a subscription.
   *
   * @param string plan         The plan (see Subscription::$availablePlans).
   * @param int    storage      The allowed storage per environment (in MiB).
   * @param int    environments The number of environments.
   * @param int    users        The number of users.
   *
   * @return array An array containing at least 'total' (a formatted price).
   */
  async getSubscriptionEstimate(params: {
    plan: string;
    storage: number;
    environments: number;
    user_licenses: number;
    big_dev?: string;
    format?: string;
    country_code?: string;
  }) {
    const { api_url } = getConfig();

    return request(`${api_url}/v1/subscriptions/estimate`, "GET", params);
  }

  /**
   * Estimate the cost of a subscription for an organization.
   *
   * @param string plan         The plan (see Subscription::$availablePlans).
   * @param int    storage      The allowed storage per environment (in MiB).
   * @param int    environments The number of environments.
   * @param int    users        The number of users.
   * @param string backups      The available backup sellables
   *
   * @return array An array containing at least 'total' (a formatted price).
   */
  async getOrganizationSubscriptionEstimate(
    organizationId: string,
    params: {
      organizationId: string;
      plan: string;
      storage: number;
      environments: number;
      user_licenses: number;
      big_dev?: string;
      backups?: string;
      format?: string;
      country_code?: string;
    }
  ) {
    const { api_url } = getConfig();

    return request(
      `${api_url}/organizations/${organizationId}/subscriptions/estimate`,
      "GET",
      params
    );
  }

  /**
   * Get current deployment informations
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Deployment
   */
  async getCurrentDeployment(
    projectId: string,
    environmentId: string,
    params?: object
  ) {
    return entities.Deployment.get({ projectId, environmentId, ...params });
  }

  /**
   * Get next deployment information
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Deployment
   */
  async getNextDeployment(
    projectId: string,
    environmentId: string,
    params: object
  ) {
    return entities.Deployment.getNext({ projectId, environmentId, ...params });
  }

  /**
   * Get both next and current deployment information
   *
   * @param string projectId
   * @param string environmentId
   *
   * @return Deployments array
   */
  async getDeployments(projectId: string, environmentId: string) {
    return entities.Deployment.getDeployments({
      projectId,
      environmentId
    });
  }

  /**
   * Run runtime operation on deployment
   *
   * @param string projectId
   * @param string environmentId
   * @param string deploymentId
   * @param string operation
   * @param string service
   *
   * @return Activity
   */
  async runRuntimeOperationDeployment(params: {
    projectId: string;
    deploymentId: string;
    environmentId: string;
    service: string;
    operation: string;
  }) {
    return entities.Deployment.run(params);
  }

  /**
   * Get organizations of the logged user
   *
   *
   * @return Organization[]
   */
  async getOrganizations(params?: object) {
    return entities.Organization.query(params);
  }

  /**
   * Get organization
   *
   * @param string id
   *
   * @return Organization
   */
  async getOrganization(id: string) {
    return entities.Organization.get({ id });
  }

  /**
   * Create organization
   *
   * @param object organization
   *
   * @return Organization
   */
  async createOrganization(organization: APIObject) {
    const newOrganization = new entities.Organization(organization);

    return newOrganization.save();
  }

  /**
   * Create team
   *
   * @param object team
   *
   * @return Team
   */
  async createTeam(team: APIObject) {
    const newTeam = new entities.Team(team);

    return newTeam.save();
  }

  /**
   * Get teams of the logged user
   *
   *
   * @return Team[]
   */
  async getTeams() {
    return this.getAccountInfo().then(me => {
      if (!me) {
        return;
      }

      return me.teams.map(team => new entities.Team(team));
    });
  }

  /**
   * Get team
   *
   * @param string id
   *
   * @return Team
   */
  async getTeam(id: string) {
    return entities.Team.get({ id });
  }

  /**
   * Get regions
   *
   *
   * @return Region[]
   */
  async getRegions() {
    return entities.Region.query({});
  }

  /**
   * Get organization regions
   *
   *
   * @return CursoredResult
   */
  async getOrganizationRegions(organizationId: string, params?: object) {
    return entities.OrganizationRegion.query({ organizationId, ...params });
  }

  /**
   * Get account
   *
   *
   * @return Account
   */
  async getAccount(id: string) {
    return entities.Account.get({ id });
  }

  /**
   * Get address
   *
   *
   * @return Address
   */
  async getAddress(id: string) {
    return entities.Address.get({ id });
  }

  /**
   * Get organization address
   *
   *
   * @return Address
   */
  async getOrganizationAddress(organizationId: string) {
    return entities.OrganizationAddress.query({ organizationId });
  }

  /**
   * Get orders
   *
   *
   * @return Account
   */
  async getOrders(owner: string) {
    return entities.Order.query({ filter: { owner } });
  }

  /**
   * Get order
   *
   *
   * @return Account
   */
  async getOrder(id: string) {
    return entities.Order.get({ id });
  }

  /**
   * Get organization orders
   *
   *
   * @return Account
   */
  async getOrganizationOrders(organizationId: string, filter: object) {
    return entities.OrganizationOrder.query({
      organizationId,
      filter
    });
  }

  /**
   * Get organization order
   */
  async getOrganizationOrder(
    organizationId: string,
    id: string,
    includeDetails?: boolean,
    asof?: string
  ) {
    return entities.OrganizationOrder.get({
      organizationId,
      id,
      includeDetails,
      asof
    });
  }

  /**
   * Get vouchers
   *
   *
   * @return Voucher
   */
  async getVouchers(uuid: string) {
    return entities.Voucher.get({ uuid });
  }

  /**
   * Get organization vouchers
   *
   *
   * @return Voucher
   */
  async getOrganizationVouchers(organizationId: string) {
    return entities.OrganizationVoucher.get({ organizationId });
  }

  /**
   * Add a new voucher to an organization.
   *
   * @param string organizationId.
   * @param string code The code.
   *
   * @return Result
   */
  async addOrganizationVoucher(organizationId: string, code: string) {
    const { api_url } = getConfig();
    const values = this.cleanRequest({ code });

    return new entities.OrganizationVoucher(
      {
        organizationId,
        ...values
      },
      `${api_url}/organizations/${organizationId}/vouchers/apply`
    ).save();
  }

  /**
   * Get organization discounts
   *
   *
   * @return Discount
   */
  async getOrganizationDiscounts(organizationId: string) {
    return entities.OrganizationDiscount.get({ organizationId });
  }

  /**
   * Get a users cardonfile
   *
   * @return Promise
   */
  async getCardOnFile() {
    const { api_url } = getConfig();
    const card = request(`${api_url}/platform/cardonfile`, "GET");
    return card;
  }

  /**
   * Get payment source.
   *
   * @param string owner The UUID of the owner.
   *
   * @return Promise
   */
  async getPaymentSource(owner?: string) {
    return entities.PaymentSource.get({ owner });
  }

  /**
   * Get organization payment source.
   *
   * @param string organization id.
   *
   * @return Promise
   */
  async getOrganizationPaymentSource(
    organizationId: string,
    include_nonchargeable?: 1 | 0
  ) {
    return entities.OrganizationPaymentSource.get({
      organizationId,
      include_nonchargeable: include_nonchargeable ?? 0
    });
  }

  /**
   * Add a new payement source to user's account.
   *
   * @param string type The type of the payment source: credit-card /
   * stripe_sepa_debit.
   * @param string token The token returns by Stripe.
   * @param string email The email linked to the payment source.
   *
   * @return Result
   */
  async addPaymentSource(type: string, token: string, email: string) {
    const values = this.cleanRequest({ type, token, email });

    return new entities.PaymentSource(values).save();
  }

  /**
   * Add a new payement source to an organization.
   *
   * @param string type The type of the payment source: credit-card /
   * stripe_sepa_debit.
   * @param string token The token returns by Stripe.
   * @param string email The email linked to the payment source.
   *
   * @return Result
   */
  async addOrganizationPaymentSource(
    organizationId: string,
    type: string,
    token: string,
    email: string,
    chargeable?: boolean
  ) {
    const values = this.cleanRequest({
      type,
      token,
      email,
      chargeable: chargeable ?? true
    });

    return new entities.OrganizationPaymentSource({
      organizationId,
      ...values
    }).save();
  }

  /**
   * Delete payment source for the owner.
   *
   * @param {string} uuid The UUID of the owner of the payment source.
   *
   * @return {Promise} It resolves if the payment source is deleted,
   * rejects otherwise
   */
  async deletePaymentSource(uuid: string) {
    return entities.PaymentSource.delete(uuid);
  }

  /**
   * Delete payment source for the organization.
   *
   * @param {string} uuid The UUID of the owner of the payment source.
   *
   * @return {Promise} It resolves if the payment source is deleted,
   * rejects otherwise
   */
  async deleteOrganizationPaymentSource() {
    return entities.OrganizationPaymentSource.delete();
  }

  /**
   * Get payment source allowed.
   *
   * @return Promise
   */
  async getPaymentSourcesAllowed() {
    return entities.PaymentSource.getAllowed();
  }

  /**
   * Get payment source allowed for an organization.
   *
   * @return Promise
   */
  async getOrganizationPaymentSourcesAllowed(organizationId: string) {
    return entities.OrganizationPaymentSource.getAllowed(organizationId);
  }

  /**
   * Create a Setup Intent
   *
   * @return Promise: { client_secret, public_key }
   */
  async createPaymentSourceIntent() {
    return entities.PaymentSource.intent();
  }

  /**
   * Create a Setup Intent for an organization
   *
   * @return Promise: { client_secret, public_key }
   */
  async createOrganizationPaymentSourceIntent(organizationId: string) {
    return entities.OrganizationPaymentSource.intent(organizationId);
  }

  /**
   * Get a users profile.
   *
   * @param {string} id - UUID of the user.
   * @return Promise
   */
  async getUserProfile(id: string) {
    return entities.AccountsProfile.get({ id });
  }

  /**
   * Get the organization  profile.
   *
   * @param {string} organizationId - id of the organization.
   * @return Promise
   */
  async getOrganizationProfile(organizationId: string) {
    return entities.OrganizationProfile.get({ organizationId });
  }

  /**
   * Get a streaming log
   *
   * @param {obj} activity - Activity for the log.
   * @return Promise
   */
  async getStreamingLog(activity: Activity, max_items = 0) {
    const accessToken = await this.getAccessToken();
    const logUrl = `${activity.getLink(
      "log"
    )}?max_items=${max_items}&max_delay=1000`;

    return fetch(logUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`
      }
    });
  }

  /**
   * Update a user's profile.
   *
   * @param {string} id - UUID of the user.
   * @param {obj} data - fields to update on the profile
   *
   * @return Promise
   */
  async updateUserProfile(id: string, data: APIObject) {
    const { api_url } = getConfig();
    const updatedProfile = await request(
      `${api_url}/platform/profiles/${id}`,
      "PATCH",
      data
    );

    return new entities.AccountsProfile(updatedProfile);
  }

  /**
   * Update a organization profile.
   *
   * @param {string} id - id of the organization.
   * @param {obj} data - fields to update on the profile
   *
   * @return Promise
   */
  async updateOrganizationProfile(id: string, data: APIObject) {
    const { api_url } = getConfig();
    const updatedProfile = await request(
      `${api_url}/organizations/${id}/profile`,
      "PATCH",
      data
    );

    return new entities.OrganizationProfile(updatedProfile);
  }

  /**
   * Get a item from the registry.
   *
   * @return Promise
   */
  async getSetupRegistry() {
    const { api_url } = getConfig();
    return request(`${api_url}/platform/setup/registry`, "POST").then(
      (data: Record<string, APIObject>) =>
        typeof data === "undefined"
          ? undefined
          : Object.entries(data).reduce<Record<string, any>>(
              (items, [key, value]) => {
                items[key] = new entities.SetupRegistry(value);
                return items;
              },
              {}
            )
    );
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  async getSetupRegistryItem(name: string) {
    return entities.SetupRegistry.get({ name });
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  async getSetupConfig(settings: object) {
    return entities.SetupConfig.get(settings);
  }

  /**
   * Get a user from Auth API.
   *
   * @param { string } id - UUID of the user.
   * @return Promise
   */
  async getUser(id: string) {
    return entities.AuthUser.get({ id });
  }

  /**
   * Get the UUID for a user based on their username
   *
   * @param {string} string - username of the user.
   *
   * @return string
   */
  async getUserIdFromUsername(username: string) {
    const { api_url } = getConfig();

    const user = await request(
      `${api_url}/v1/profiles?filter[username]=${username}`
    );

    return new entities.AccountsProfile(user.profiles[0]);
  }

  /**
   * Get the activities of the project projectId
   *
   * @param string projectId
   * @param string types
   * @param string starts_at
   *
   * @return Promise Activity[]
   */
  async getProjectActivities(
    projectId: string,
    types?: string[],
    starts_at?: number
  ) {
    const params = { type: types, starts_at, projectId };

    const { api_url } = getConfig();

    return entities.Activity.query(
      params,
      `${api_url}/projects/:projectId/activities`
    );
  }

  /**
   * Get a project's activity
   *
   * @param string projectId
   * @param string activityId
   *
   * @return Promise Activity
   */
  async getProjectActivity(projectId: string, activityId: string) {
    const params = { id: activityId, projectId };
    const { api_url } = getConfig();

    return entities.Activity.get(
      params,
      `${api_url}/projects/:projectId/activities`
    );
  }

  /**
   * Returns the information required to start the TFA enrollment process.
   *
   * @param {string} userId User identifier
   *
   * @returns {Promise<{qr_code, secret, issuer, account_name}>} Promise that
   * returns the information required to enroll the user if resolves
   */
  async getTFA(userId: string) {
    return entities.TwoFactorAuthentication.get(userId);
  }

  /**
   * Enables TFA for the user.
   *
   * @param {string} userId User identifier
   * @param {string} secret User's secret returned by getTFA
   * @param {string} passcode Code generated by the user's TFA provider
   *
   * @returns {Promise<[string]>} Promise that returns a list of recovery codes
   * if resolves
   */
  async enrollTFA(userId: string, secret: string, passcode: string) {
    return entities.TwoFactorAuthentication.enroll(userId, secret, passcode);
  }

  /**
   * Disables TFA for the user.
   *
   * @param {string} userId User identifier
   *
   * @return {Promise} It resolves if the user is succesfully unenrolled,
   * rejects otherwise
   */
  async disableTFA(userId: string) {
    return entities.TwoFactorAuthentication.delete(userId);
  }

  /**
   * Generates a new set of recovery codes.
   *
   * @param {string} userId User identifie
   *
   * @returns {Promise<[string]>} Promise that returns a list of recovery codes
   * if resolves
   */
  async resetRecoveryCodes(userId: string) {
    return entities.TwoFactorAuthentication.reset(userId);
  }

  /*
   * Get connected accounts for a user
   *
   * @param {string} id - id of the user.
   *
   * @return Promise ConnectedAccounts[]
   */
  async getConnectedAccounts(userId: string) {
    return entities.ConnectedAccount.query(userId);
  }

  /**
   * Get a list of Zendesk tickets based on the settings.
   *
   * @param {object} settings - Filters and settings.
   * @return Promise<TicketResponse>
   */
  async getTickets(settings: TicketQueryParams) {
    return entities.Ticket.query(settings).then(({ data }) => data);
  }

  /**
   * Update the status of a ticket.
   *
   * @param {string|number} ticketId Ticket to be updated
   * @param {string} status New status to be applied
   *
   * @return Promise<Ticket>
   */
  async updateTicketStatus(ticketId: string, status: string) {
    return entities.Ticket.patch(ticketId, { status }).then(ticket => ticket);
  }

  /**
   * Get a list of available priorities for the subscription ID.
   *
   * @param {string|number} subscription_id
   * @param {string} category
   *
   * @return Promise<Priority[]>
   */
  async getTicketPriorities(subscription_id: string, category: string) {
    const priorities = await entities.TicketPriority.get({
      subscription_id,
      category
    });
    return priorities.map(priority => new entities.TicketPriority(priority));
  }

  /**
   * Return a list of available categories for a ticket
   *
   * @return Promise<Category[]>
   */
  async getTicketCategories() {
    const categories = await entities.TicketCategory.get();
    return categories.map(priority => new entities.TicketCategory(priority));
  }

  /**
   * Get the ticket attachments.
   *
   * @param {number|string} ticketId
   *
   * @return Promise<Attachment[]>
   */
  async getTicketAttachments(ticketId: string) {
    const response = await entities.Ticket.getAttachments(ticketId);
    const { attachments } = response;
    return Object.entries(attachments || {}).map(([filename, attachment]) => ({
      filename,
      url: attachment.uri,
      contentType: attachment.content_type
    }));
  }

  /**
   * Get all the attachments related to a ticket, even the ones included in the comments
   *
   * @param {number|string} ticketId
   *
   * @return Promise<Attachment[]>
   */
  async getAllTicketAttachments(ticketId: string) {
    const response = await entities.Ticket.getAllAttachments(ticketId);
    return response.map(attachment => ({
      filename: attachment.filename,
      url: attachment.uri,
      contentType: attachment.content_type
    }));
  }

  /**
   * Open a Zendesk ticket
   *
   * @param {object} ticket
   *
   * @return Promise<Ticket>
   */
  async openTicket(ticket: APIObject) {
    const response = await entities.Ticket.open(ticket);
    return response;
  }

  /**
   * Load comments for a ticket, excluding the initial comment.
   *
   * @param {string} ticketId
   * @return Promise<Comment[]>
   */
  async loadComments(ticketId: string, params: Record<string, any>) {
    const { data } = await entities.Comment.query(ticketId, params);
    const page = params.page || 1;
    const PAGE_SIZE = 50;
    const pages = Math.ceil(data.count / PAGE_SIZE);
    const isPreviousToLastPage = page === pages - 1;
    const isLastPage = page === pages;

    if (isPreviousToLastPage && data.count % PAGE_SIZE === 1) {
      delete data._links?.next;
    }

    data.count -= 1;

    if (isLastPage) {
      data.comments = data.comments.slice(0, -1);
    }

    return {
      ...data,
      comments: data.comments.map(comment => ({
        ...comment,
        attachments: Object.values(comment.attachments || {}).map(
          attachment => ({
            filename: attachment.file_name,
            url: attachment.uri,
            contentType: attachment.content_type
          })
        )
      }))
    };
  }

  /**
   * Send a new comment.
   *
   * @param {Object} comment
   *
   * @return Promise<Comment>
   */
  async sendComment(comment: APIObject) {
    return new entities.Comment(comment).save();
  }

  /**
   * Updates the user profile picture
   *
   * @param {string} userId User identifier
   * @param {FormData} FormData object containign picture File object to be
   * uploaded.
   *
   * @returns {Promise<{url: string}>} Promise that returns the url to the new
   * profile picture
   */
  async updateProfilePicture(userId: string, picture: FormData) {
    return entities.AccountsProfile.updateProfilePicture(userId, picture);
  }

  /**
   * Deletes the user profile picture.
   *
   * @param {string} userId User identifier
   *
   * @returns {Promise} Resolves if the picture was deleted.
   */
  async deleteProfilePicture(userId: string) {
    return entities.AccountsProfile.deleteProfilePicture(userId);
  }

  /**
   * Create an invitation
   * @deprecated Use createInvitationWithEnvironmentType() instead
   *
   * @param {string} email
   * @param {string} projectId
   * @param {string} role project role
   * @param {array} Environments Array of environment object id/role
   *
   * @returns {Promise} Promise that return a Result.
   */
  async createInvitation(
    email: string,
    projectId: string,
    role: string,
    environments: { id: string; role: string }[],
    force = false
  ) {
    const invitation = new entities.Invitation({
      email,
      projectId,
      environments,
      role,
      force
    });

    return invitation.save();
  }

  /**
   * Create an organization invitation
   *
   * @param {string} email
   * @param {string} organizationId
   * @param {array} permissions
   * @param {bool} force
   *
   * @returns {Promise} Promise that return a Result.
   */
  async createOrganizationInvitation(
    email: string,
    organizationId: string,
    permissions: string[],
    force = false
  ) {
    const invitation = new entities.OrganizationInvitation({
      email,
      organizationId,
      permissions,
      force
    });

    return invitation.save();
  }

  /**
   * Get organization invitations list
   *
   * @param {string} organizationId
   * @param {string} queryParams
   *
   * @returns {Promise} Promise that return an organization inivitations list.
   */
  async getOrganizationInvitations(
    organizationId: string,
    queryParams?: string
  ) {
    return entities.OrganizationInvitation.getList(organizationId, queryParams);
  }

  /**
   * Create an invitation with environment types
   *
   * @param {string} email
   * @param {string} projectId
   * @param {string} role project role
   * @param {array} Permissions Array of environment types object id/role
   *
   * @returns {Promise} Promise that return a Result.
   */
  async createInvitationWithEnvironmentTypes(
    email: string,
    projectId: string,
    role: string,
    permissions: {
      type: "production" | "development" | "staging";
      role: "viewer" | "contributor" | "admin";
    }[],
    force = false
  ) {
    const invitation = new entities.Invitation({
      email,
      projectId,
      permissions,
      role,
      force
    });

    return invitation.save();
  }

  /**
   * Get project invitations list
   *
   * @param {string} projectId
   * @param {string} id
   *
   * @returns {Promise} Promise that return an inivitations list.
   */
  async getInvitations(projectId: string) {
    return entities.Invitation.query(projectId);
  }

  /**
   * Get project environment types
   *
   * @param {string} projectId
   *
   * @returns {Promise} Promise that return an environment types list.
   */
  async getProjectEnvironmentTypes(projectId: string) {
    return entities.EnvironmentType.query({ projectId });
  }

  /**
   * Get project environment type
   *
   * @param {string} projectId
   * @param {string} id
   *
   * @returns {Promise} Promise that return an environment types list.
   */
  async getProjectEnvironmentType(projectId: string, id: string) {
    return entities.EnvironmentType.get({ projectId, id });
  }

  /**
   * Get project environment types accesses
   *
   * @param {string} projectId
   *
   * @returns {Promise} Promise that return an environment types accesses list.
   */
  async getProjectEnvironmentTypesWithAccesses(projectId: string) {
    const environmentTypes = await this.getProjectEnvironmentTypes(projectId);
    for (const environmentType of environmentTypes) {
      // eslint-disable-next-line no-await-in-loop
      await environmentType.getAccesses();
    }

    return environmentTypes;
  }

  async updateEnvironmentTypeAccess(params: UpdateAccessParams) {
    return entities.EnvironmentType.updateAccess(params);
  }

  async deleteEnvironmentTypeAccess(params: DeleteAccessParams) {
    return entities.EnvironmentType.deleteAccess(params);
  }

  async createEnvironmentTypeAccess(params: CreateAccessParams) {
    return entities.EnvironmentType.createAccess(params);
  }

  /**
   * Get current deployment topology
   *
   * @param {string} projectId
   * @param {string} environmentId
   * @param {object} params
   *
   * @returns {Promise} Promise that return an access object.
   */
  async getTopology(
    projectId: string,
    environmentId: string,
    params?: Record<string, any>
  ) {
    return entities.Topology.get({
      projectId,
      environmentId,
      ...params
    });
  }

  async getDunningActions(organizationId: string) {
    const { api_url } = getConfig();

    return request(
      `${api_url}/organizations/${organizationId}/dunning-actions`
    ) as Promise<{
      items: {
        date: string;
        days_until: number;
        id: string;
        order_id: string;
        type: "charge" | "suspend" | "revoke";
        uid: string;
      }[];
      _links: { self: { href: string } };
    }>;
  }

  async setVerificationMethodAsPaymentMethod(organizationId: string) {
    return entities.OrganizationPaymentSource.setVerificationMethodAsPaymentMethod(
      organizationId
    );
  }
}
