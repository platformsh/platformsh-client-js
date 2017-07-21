import request, { setToken } from './api';
import connector from './authentication/connector';
import { getConfig, setConfig } from './config';
import entities from './model';

export const models = entities;

export const api = request;

export default class Client {
  constructor(authenticationConfig = {}) {
    const { api_token, access_token, ...config } = authenticationConfig;

    setConfig(config);
    if(access_token) {
      setToken(access_token);
      this.authenticationPromise = Promise.resolve(access_token);
    } else {
      this.authenticationPromise = connector(api_token).then(new_access_token => {
        setToken(new_access_token);
        return new_access_token;
      });
    }
  }

  getAccessToken() {
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
    return this.authenticationPromise.then(() => {
      if (!this.getAccountInfoPromise || reset) {
        const { api_url } = getConfig();

        this.getAccountInfoPromise = request(`${api_url}/platform/me`, 'GET');
      }

      return this.getAccountInfoPromise;
    });
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

      if(project && project.endpoint) {
        return project.endpoint;
      }
      const { account_url } = getConfig();

      return request(`${account_url}/projects/${id}`, 'GET').then(result => {
        return result.endpoint || false;
      });
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
      if(!me) {
        return false;
      }

      return me.projects.map(project => new entities.Project(project, project.endpoint));
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
    return entities.Activity.query({ projectId, environmentId, type, starts_at });
  }

  /**
  * Get the activities of the environment environmentId of the project projectId
  *
  * @param string projectId
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
    const certificateObj = new entities.Certificate({ certificate, key, chain}, certificateUrl);

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
    return this.authenticationPromise.then(() => {
      return entities.SshKey.get(id);
    });
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
    const keys = Object.keys(req).filter(key => req[key] !== null);

    for(let i = 0;i < keys.length;i++) {
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
  * @param int    storage The storage of each environment, in MiB.
  * @param int    environments The number of available environments.
  * @param array  activationCallback An activation callback for the subscription.
  *
  * @return Subscription
  */
  createSubscription(region, plan = 'development', title, storage, environments, activationCallback) {
    const values = this.cleanRequest({
      project_region: region,
      plan,
      project_title: title,
      storage,
      environments,
      activation_callback: activationCallback
    });

    return new entities.Subscription(values).save();
  }

  /**
  * Get a subscription by its ID.
  *
  * @param string|int id
  *
  * @return Subscription|false
  */
  getSubscription(id) {
    return entities.Subscription.get(id);
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
  getSubscriptionEstimate(plan, storage, environments, users) {
    const query = {
      plan,
      storage,
      environments,
      user_licenses: users
    };
    const { account_url } = getConfig();

    return request(`${account_url}/estimate`, 'GET', query);
  }

  /**
  * Get current deployment informations
  *
  * @param string projectId
  * @param string environmentId
  *
  * @return Deployment
  */
  getCurrentDeployment(projectId, environmentId) {
    return entities.Deployment.get({ projectId, environmentId });
  }

  /**
  * Get organizations of the logged user
  *
  *
  * @return Organization[]
  */
  getOrganizations() {
    return this.getAccountInfo().then(me => {
      if(!me) {
        return false;
      }

      return me.organizations.map(organization => new entities.Organization(organization));
    });
  }

  /**
  * Get organization
  *
  * @param string id
  *
  * @return Organization
  */
  getOrganization(id) {
    return entities.Organization.get({id});
  }

  /**
  * Get teams of the logged user
  *
  *
  * @return Team[]
  */
  getTeams() {
    return this.getAccountInfo().then(me => {
      if(!me) {
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
}
