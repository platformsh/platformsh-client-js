import request, { setToken } from './api';
import model from './model';
import connector from './authentication/connector';
import { getConfig, setConfig } from './config';

export default class Client {
  constructor(authenticationConfig = {}) {
    const { api_token, access_token, ...config } = authenticationConfig;

    setConfig(config);
    if(access_token) {
      setToken(access_token);
      this.authenticationPromise = Promise.resolve();
    } else {
      this.authenticationPromise = connector(api_token).then(new_access_token => {
        setToken(new_access_token);
      });
    }
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
      if (!this.accountInfo || reset) {
        const { api_url } = getConfig();

        return request(`${api_url}/platform/me`, 'GET').then(me => {
          this.accountInfo = me;
          return me;
        });
      }

      return new Promise(resolve => resolve(this.accountInfo));
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
    return this.authenticationPromise.then(() => {
      const { api_url } = getConfig();

      return request(`${api_url}/projects/${id}`, 'GET').then(result => {
        return result.endpoint || false;
      });
    });
  }

  /**
  * Get a single project at a known location.
  *
  * @param string id       The project ID.
  * @param string hostname The hostname of the Platform.sh regional API,
  *                         e.g. 'eu.platform.sh' or 'us.platform.sh'.
  * @param bool   https    Whether to use HTTPS (default: true).
  *
  * @internal It's now better to use getProject(). This method will be made
  *           private in a future release.
  *
  * @return Project|false
  */
  getProjectDirect(id, hostname, https = true) {
    const scheme = https ? 'https' : 'http';
    const projectUrl = `${scheme}://${hostname}/api/projects`;

    return model.Project.get({}, `${projectUrl}/${id}`);
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

      return me.projects.map(project => new model.Project(project, project.enpoint));
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
  getProject(id, hostname, https = true) {
    // Search for a project in the user's project list.
    return this.getProjects().then(projects => {
      const project = projects.find(project => project.id === id);

      if(project) {
        return project;
      }

      if (hostname) {
        return this.getProjectDirect(id, hostname, https);
      }

      // Use the project locator.
      return this.locateProject(id).then(endpoint => {
        if (endpoint) {
          return model.Project.get({}, endpoint);
        }

        return false;
      });
    });
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
      return model.SshKey.wrap(me.ssh_keys);
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
      return model.SshKey.get(id);
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

    return new model.SshKey(values).save();
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

    return new model.Subscription(values).save();
  }

  /**
  * Get a subscription by its ID.
  *
  * @param string|int id
  *
  * @return Subscription|false
  */
  getSubscription(id) {
    return model.Subscription.get(id);
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
    const { api_url } = getConfig();

    return request(`${api_url}/estimate`, 'GET', query);
  }
}
