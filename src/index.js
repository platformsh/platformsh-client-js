import request from "./api";
import connector, { wipeToken } from "./authentication";
import { getConfig, setConfig } from "./config";
import entities from "./model";
import Organization from "./model/Organization";

export const models = entities;

export const api = request;

export default class Client {
  constructor(authenticationConfig = {}) {
    setConfig(authenticationConfig);

    this.authenticationPromise = connector(authenticationConfig);
  }

  getAccessToken() {
    return this.authenticationPromise;
  }

  getConfig() {
    return getConfig();
  }

  wipeToken() {
    wipeToken();
  }

  reAuthenticate() {
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
  getAccountInfo(reset = false) {
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
  locateProject(id) {
    return this.getProjects().then(projects => {
      const project = projects.find(project => project.id === id);

      if (project && project.endpoint) {
        return project.endpoint;
      }
      const { account_url } = getConfig();

      return request(`${account_url}/platform/projects/${id}`, "GET").then(
        result => {
          return result.endpoint || false;
        }
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
  getProjects() {
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
  getProject(id) {
    return entities.Project.get({ id });
  }

  /**
   * Get the environments of project projectId
   *
   * @param string projectId
   *
   * @return Promise Environment[]
   */
  getEnvironments(projectId) {
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
  getEnvironment(projectId, environmentId) {
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
  getEnvironmentActivities(projectId, environmentId, type, starts_at) {
    return entities.Activity.query({
      projectId,
      environmentId,
      type,
      starts_at
    });
  }

  getEnvironmentActivity(projectId, environmentId, activityId) {
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
  getCertificates(projectId) {
    return entities.Certificate.query({ projectId });
  }

  /**
   * Add certificate to the project projectId
   * @param string projectId
   * @param string certificate
   * @param string key
   * @param array  chain
   */
  addCertificate(projectId, certificate, key, chain = []) {
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
  getDomains(projectId, limit) {
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
  getEnvironmentUsers(projectId, environmentId) {
    return entities.EnvironmentAccess.query({ projectId, environmentId });
  }

  /**
   * Get the route configuration.
   *
   *
   * @return Route
   */
  getRoutes(projectId, environmentId) {
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
  getProjectUsers(projectId) {
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
  getProjectVariables(projectId, limit) {
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
  getEnvironmentVariables(projectId, environmentId, limit) {
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
  getEnvironmentMetrics(projectId, environmentId, q) {
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
  getEnvironmentBackups(projectId, environmentId) {
    return entities.EnvironmentBackup.query({ projectId, environmentId });
  }

  /**
   * Get the integrations of project projectId
   *
   * @param string projectId
   * @param environmentId
   *
   * @return Promise Integration[]
   */
  getIntegrations(projectId) {
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
  getIntegration(projectId, integrationId) {
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
  getIntegrationActivities(projectId, integrationId, type, starts_at) {
    const { api_url } = getConfig();

    const url = `${api_url}/projects/${projectId}/integrations/${integrationId}/activities`;
    return entities.Activity.query(
      {
        type,
        starts_at
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
  getSshKeys() {
    return this.getAccountInfo().then(me => {
      return entities.SshKey.wrap(me.ssh_keys);
    });
  }

  /**
   * Get a single SSH key by its ID.
   *
   * @param string|int id
   *
   * @return SshKey|false
   */
  getSshKey(id) {
    return entities.SshKey.get(id);
  }

  /**
   * Add an SSH public key to the logged-in user's account.
   *
   * @param string value The SSH key value.
   * @param string title A title for the key (optional).
   *
   * @return Result
   */
  addSshKey(value, title) {
    const values = this.cleanRequest({ value, title });

    return new entities.SshKey(values).save();
  }

  /**
   * Filter a request array to remove null values.
   *
   * @param array request
   *
   * @return array
   */
  cleanRequest(req) {
    let cleanedReq = {};
    const keys = Object.keys(req).filter(
      key => req[key] !== null && typeof req[key] !== "undefined"
    );

    for (let i = 0; i < keys.length; i++) {
      cleanedReq[keys[i]] = req[keys[i]];
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
  createSubscription(config) {
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
  createOrganizationSubscription(config) {
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
  getSubscription(id) {
    return entities.Subscription.get({ id });
  }

  /**
   * Get subscriptions.
   *
   * @param array filters
   *
   * @return Subscriptions[]
   */
  getSubscriptions(filter, all) {
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
  getOrganizationSubscriptions(organizationId, params) {
    return entities.OrganizationSubscription.query({
      organizationId,
      ...params
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
  getOrganizationSubscription(organizationId, id) {
    return entities.OrganizationSubscription.get({ organizationId, id });
  }

  /**
   * Get organization members.
   *
   * @param string organizationId
   * @param array filters
   *
   * @return CursoredResult
   */
  getOrganizationMembers(organizationId, filter) {
    return entities.OrganizationMember.query({ organizationId, filter });
  }

  /**
   * Get an organization member.
   *
   * @param string organizationId
   * @param string id
   *
   * @return OrganizationMember
   */
  getOrganizationMember(organizationId, id) {
    return entities.OrganizationMember.get({ organizationId, id });
  }

  /**
   * Initalize the environment for a new subscription
   *
   * @param string projectId
   * @param object options
   * @param string environmentId
   */
  initializeEnvironment(projectId, options, environmentId = "master") {
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
  getSubscriptionEstimate(
    plan,
    storage,
    environments,
    user_licenses,
    big_dev,
    format = null,
    country_code = null
  ) {
    const query = {
      plan,
      storage,
      environments,
      user_licenses,
      big_dev
    };
    if (format) query.format = format;
    if (country_code) query.country_code = country_code;
    const { api_url } = getConfig();

    return request(`${api_url}/v1/subscriptions/estimate`, "GET", query);
  }

  /**
   * Estimate the cost of a subscription for an organization.
   *
   * @param string plan         The plan (see Subscription::$availablePlans).
   * @param int    storage      The allowed storage per environment (in MiB).
   * @param int    environments The number of environments.
   * @param int    users        The number of users.
   *
   * @return array An array containing at least 'total' (a formatted price).
   */
  getOrganizationSubscriptionEstimate(
    organizationId,
    plan,
    storage,
    environments,
    user_licenses,
    big_dev,
    format = null,
    country_code = null,
    agency_site
  ) {
    const query = {
      plan,
      storage,
      environments,
      user_licenses,
      big_dev,
      agency_site
    };
    if (format) query.format = format;
    if (country_code) query.country_code = country_code;
    const { api_url } = getConfig();

    return request(
      `${api_url}/organizations/${organizationId}/subscriptions/estimate`,
      "GET",
      query
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
  getCurrentDeployment(projectId, environmentId, params) {
    return entities.Deployment.get({ projectId, environmentId, ...params });
  }

  /**
   * Get organizations of the logged user
   *
   *
   * @return Organization[]
   */
  getOrganizations(params) {
    return entities.Organization.query(params);
  }

  /**
   * Get organization
   *
   * @param string id
   *
   * @return Organization
   */
  getOrganization(id) {
    return entities.Organization.get({ id });
  }

  /**
   * Create organization
   *
   * @param object organization
   *
   * @return Organization
   */
  createOrganization(organization) {
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
  createTeam(team) {
    const newTeam = new entities.Team(team);

    return newTeam.save();
  }

  /**
   * Get teams of the logged user
   *
   *
   * @return Team[]
   */
  getTeams() {
    return this.getAccountInfo().then(me => {
      if (!me) {
        return false;
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
  getTeam(id) {
    return entities.Team.get({ id });
  }

  /**
   * Get regions
   *
   *
   * @return Region[]
   */
  getRegions() {
    return entities.Region.query();
  }

  /**
   * Get organization regions
   *
   *
   * @return CursoredResult
   */
  getOrganizationRegions(organizationId, params) {
    return entities.OrganizationRegion.query({ organizationId, ...params });
  }

  /**
   * Get account
   *
   *
   * @return Account
   */
  getAccount(id) {
    return entities.Account.get({ id });
  }

  /**
   * Get address
   *
   *
   * @return Address
   */
  getAddress(id) {
    return entities.Address.get({ id });
  }

  /**
   * Get organization address
   *
   *
   * @return Address
   */
  getOrganizationAddress(organizationId) {
    return entities.OrganizationAddress.get({ organizationId });
  }

  /**
   * Update address
   *
   *
   * @return Address
   */
  saveAddress(address) {
    return entities.Address.update({ address });
  }

  /**
   * Update organization address
   *
   *
   * @return Address
   */
  saveOrganizationAddress(address) {
    return entities.OrganizationAddress.update({ address });
  }

  /**
   * Get orders
   *
   *
   * @return Account
   */
  getOrders(owner) {
    return entities.Order.query({ filter: { owner } });
  }

  /**
   * Get order
   *
   *
   * @return Account
   */
  getOrder(id) {
    return entities.Order.get({ id });
  }

  /**
   * Get organization orders
   *
   *
   * @return Account
   */
  getOrganizationOrders(organizationId, filter) {
    return entities.OrganizationOrder.query({
      organizationId,
      filter
    });
  }

  /**
   * Get organization order
   *
   *
   * @return Account
   */
  getOrganizationOrder(organizationId, id) {
    return entities.OrganizationOrder.get({ organizationId, id });
  }

  /**
   * Get vouchers
   *
   *
   * @return Voucher
   */
  getVouchers(uuid) {
    return entities.Voucher.get({ uuid });
  }

  /**
   * Get organization vouchers
   *
   *
   * @return Voucher
   */
  getOrganizationVouchers(organizationId) {
    return entities.OrganizationVoucher.get({ organizationId });
  }

  /**
   * Get a users cardonfile
   *
   * @return Promise
   */
  getCardOnFile() {
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
  getPaymentSource(owner) {
    return entities.PaymentSource.get(owner);
  }

  /**
   * Get organization payment source.
   *
   * @param string organization id.
   *
   * @return Promise
   */
  getOrganizationPaymentSource(organizationId) {
    return entities.OrganizationPaymentSource.get({ organizationId });
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
  addPaymentSource(type, token, email) {
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
  addOrganizationPaymentSource(organizationId, type, token, email) {
    const values = this.cleanRequest({ type, token, email });

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
  deletePaymentSource(uuid) {
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
  deleteOrganizationPaymentSource(uuid) {
    return entities.OrganizationPaymentSource.delete(uuid);
  }

  /**
   * Get payment source allowed.
   *
   * @return Promise
   */
  getPaymentSourcesAllowed() {
    return entities.PaymentSource.getAllowed();
  }

  /**
   * Get payment source allowed for an organization.
   *
   * @return Promise
   */
  getOrganizationPaymentSourcesAllowed(organizationId) {
    return entities.OrganizationPaymentSource.getAllowed(organizationId);
  }

  /**
   * Create a Setup Intent
   *
   * @return Promise: { client_secret, public_key }
   */
  createPaymentSourceIntent() {
    return entities.PaymentSource.intent();
  }

  /**
   * Create a Setup Intent for an organization
   *
   * @return Promise: { client_secret, public_key }
   */
  createOrganizationPaymentSourceIntent(organizationId) {
    return entities.OrganizationPaymentSource.intent(organizationId);
  }

  /**
   * Get a users profile.
   *
   * @param {string} id - UUID of the user.
   * @return Promise
   */
  getUserProfile(id) {
    return entities.AccountsProfile.get({ id });
  }

  /**
   * Get the organization  profile.
   *
   * @param {string} organizationId - id of the organization.
   * @return Promise
   */
  getOrganizationProfile(organizationId) {
    return entities.OrganizationProfile.get({ organizationId });
  }

  /**
   * Get a streaming log
   *
   * @param {obj} activity - Activity for the log.
   * @return Promise
   */
  async getStreamingLog(activity, max_items = 0) {
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
  async updateUserProfile(id, data) {
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
  async updateOrganizationProfile(id, data) {
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
  getSetupRegistry() {
    const { api_url } = getConfig();
    return request(`${api_url}/platform/setup/registry`, "POST").then(data => {
      return typeof data === "undefined"
        ? undefined
        : Object.entries(data).reduce((items, [key, value]) => {
            items[key] = new entities.SetupRegistry(value);
            return items;
          }, {});
    });
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  getSetupRegistryItem(name) {
    return entities.SetupRegistry.get({ name });
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  getSetupConfig(settings) {
    return entities.SetupConfig.get(settings);
  }

  /**
   * Get a item from the registry.
   *
   * @return Promise
   */
  getSetupRegistry() {
    const { api_url } = getConfig();
    return request(`${api_url}/platform/setup/registry`, "POST").then(data => {
      return typeof data === "undefined"
        ? undefined
        : Object.entries(data).reduce((items, [key, value]) => {
            items[key] = new entities.SetupRegistry(value);
            return items;
          }, {});
    });
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  getSetupRegistryItem(name) {
    return entities.SetupRegistry.get({ name });
  }

  /**
   * Get a item from the registry.
   *
   * @param {string} name - name of the registry item.
   * @return Promise
   */
  getSetupConfig(settings) {
    return entities.SetupConfig.get(settings);
  }

  /**
   * Get a user from Auth API.
   *
   * @param { string } id - UUID of the user.
   * @return Promise
   */
  getUser(id) {
    return entities.AuthUser.get({ id });
  }

  /**
   * Get the UUID for a user based on their username
   *
   * @param {string} string - username of the user.
   *
   * @return string
   */
  async getUserIdFromUsername(username) {
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
  getProjectActivities(projectId, types, starts_at) {
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
  getProjectActivity(projectId, activityId) {
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
  getTFA(userId) {
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
  enrollTFA(userId, secret, passcode) {
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
  disableTFA(userId) {
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
  resetRecoveryCodes(userId) {
    return entities.TwoFactorAuthentication.reset(userId);
  }

  /*
   * Get connected accounts for a user
   *
   * @param {string} id - id of the user.
   *
   * @return Promise ConnectedAccounts[]
   */
  getConnectedAccounts(userId) {
    return entities.ConnectedAccount.query(userId);
  }

  /**
   * Get a list of Zendesk tickets based on the settings.
   *
   * @param {object} settings - Filters and settings.
   * @return Promise<Ticket[]>
   */
  async getTickets(settings) {
    return entities.Ticket.query(settings).then(tickets => {
      return tickets.data;
    });
  }

  /**
   * Update the status of a ticket.
   *
   * @param {string|number} ticketId Ticket to be updated
   * @param {string} status New status to be applied
   *
   * @return Promise<Ticket>
   */
  updateTicketStatus(ticketId, status) {
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
  async getTicketPriorities(subscription_id, category) {
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
  async getTicketAttachments(ticketId) {
    const response = await entities.Ticket.getAttachments(ticketId);
    const attachments = response.data.attachments;
    return Object.entries(attachments || {}).map(([filename, attachment]) => ({
      filename: filename,
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
  async getAllTicketAttachments(ticketId) {
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
  async openTicket(ticket) {
    const response = await entities.Ticket.open(ticket);
    return response;
  }

  /**
   * Load comments for a ticket, excluding the initial comment.
   *
   * @param {string} ticketId
   * @return Promise<Comment[]>
   */
  async loadComments(ticketId, params) {
    const { data } = await entities.Comment.query(ticketId, params);
    const page = params.page || 1;
    const PAGE_SIZE = 50;
    const pages = Math.ceil(data.count / PAGE_SIZE);
    const isPreviousToLastPage = page === pages - 1;
    const isLastPage = page === pages;

    if (isPreviousToLastPage && data.count % PAGE_SIZE === 1) {
      delete data._links.next;
    }

    data.count = data.count - 1;

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
  async sendComment(comment) {
    return entities.Comment.send(comment);
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
  updateProfilePicture(userId, picture) {
    return entities.AccountsProfile.updateProfilePicture(userId, picture);
  }

  /**
   * Deletes the user profile picture.
   *
   * @param {string} userId User identifier
   *
   * @returns {Promise} Resolves if the picture was deleted.
   */
  deleteProfilePicture(userId) {
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
  async createInvitation(email, projectId, role, environments, force = false) {
    const invitation = new entities.Invitation({
      email,
      projectId,
      environments,
      role,
      force
    });

    return await invitation.save();
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
    email,
    organizationId,
    permissions,
    force = false
  ) {
    const invitation = new entities.OrganizationInvitation({
      email,
      organizationId,
      permissions,
      force
    });

    return await invitation.save();
  }

  /**
   * Get organization invitations list
   *
   * @param {string} organizationId
   *
   * @returns {Promise} Promise that return an organization inivitations list.
   */
  getOrganizationInvitations(organizationId) {
    return entities.OrganizationInvitation.query(organizationId);
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
    email,
    projectId,
    role,
    permissions,
    force = false
  ) {
    const invitation = new entities.Invitation({
      email,
      projectId,
      permissions,
      role,
      force
    });

    return await invitation.save();
  }
  /**
   * Get project invitations list
   *
   * @param {string} projectId
   * @param {string} id
   *
   * @returns {Promise} Promise that return an inivitations list.
   */
  getInvitations(projectId) {
    return entities.Invitation.query(projectId);
  }
  /**
   * Get project environment types
   *
   * @param {string} projectId
   *
   * @returns {Promise} Promise that return an environment types list.
   */
  getProjectEnvironmentTypes(projectId) {
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
  getProjectEnvironmentType(projectId, id) {
    return entities.EnvironmentType.get({ projectId, id });
  }
  /**
   * Get project environment types accesses
   *
   * @param {string} projectId
   *
   * @returns {Promise} Promise that return an environment types accesses list.
   */
  async getProjectEnvironmentTypesWithAccesses(projectId) {
    const environmentTypes = await this.getProjectEnvironmentTypes(projectId);
    const accesses = [];
    for (let i = 0; i < environmentTypes.length; i++) {
      const environmentType = environmentTypes[i];
      await environmentType.getAccesses();
    }

    return environmentTypes;
  }
  /**
   * Update project environment types accesses
   *
   * @param {string} projectId
   * @param {string} environmentTypeId
   * @param {ProjectAccess} access
   *
   * @returns {Promise} Promise that return an access object.
   */
  async updateEnvironmentTypeAccess(projectId, environmentTypeId, access) {
    return entities.EnvironmentType.updateAccess(
      projectId,
      environmentTypeId,
      access
    );
  }
  /**
   * Delete project environment types accesses
   *
   * @param {string} projectId
   * @param {string} environmentTypeId
   * @param {ProjectAccess} access
   *
   * @returns {Promise} Promise that return a Result.
   */
  async deleteEnvironmentTypeAccess(projectId, environmentTypeId, access) {
    return entities.EnvironmentType.deleteAccess(
      projectId,
      environmentTypeId,
      access
    );
  }
  /**
   * create project environment types accesses
   *
   * @param {string} projectId
   * @param {string} environmentTypeId
   *
   * @returns {Promise} Promise that return an access object.
   */
  async createEnvironmentTypeAccess(projectId, environmentTypeId, access) {
    return entities.EnvironmentType.createAccess(
      projectId,
      environmentTypeId,
      access
    );
  }
}
