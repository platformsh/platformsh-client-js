export default class Environment extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(environment: any, url: any);
    id: string;
    status: string;
    head_commit: string;
    name: string;
    parent: string;
    machine_name: string;
    restrict_robots: boolean;
    title: string;
    created_at: string;
    updated_at: string;
    last_active_at: string;
    last_backup_at: string;
    project: string;
    is_dirty: boolean;
    enable_smtp: boolean;
    has_code: boolean;
    deployment_target: string;
    http_access: {};
    is_main: any[];
    /**
     * Get the SSH URL for the environment.
     *
     * @param string app An application name.
     *
     * @throws EnvironmentStateException
     *
     * @return string
     */
    getSshUrl(app?: string): string;
    constructLegacySshUrl(app?: string): string;
    convertSshUrl(url: any, username_suffix?: string): string;
    getSshUrls(): {};
    /**
     * Branch (create a new environment).
     *
     * @param string title The title of the new environment.
     * @param string id    The ID of the new environment. This will be the Git
     *                      branch name. Leave blank to generate automatically
     *                      from the title.
     *
     * @return Activity
     */
    branch(title: any, id?: any): any;
    /**
     * @param string proposed
     *
     * @return string
     */
    sanitizeId(proposed: any): any;
    /**
     * @return bool
     */
    isActive(): boolean;
    /**
     * Activate the environment.
     *
     * @throws EnvironmentStateException
     *
     * @return Activity
     */
    activate(): any;
    /**
     * Deactivate the environment.
     *
     * @throws EnvironmentStateException
     *
     * @return Activity
     */
    deactivate(): any;
    /**
     * Merge an environment into its parent.
     *
     * @throws OperationUnavailableException
     *
     * @return Activity
     */
    merge(): any;
    /**
     * Synchronize an environment with its parent.
     *
     * @param bool code
     * @param bool data
     *
     * @throws \InvalidArgumentException
     *
     * @return Activity
     */
    synchronize(data: any, code: any): any;
    /**
     * Create a backup of the environment.
     *
     * @return Activity
     */
    backup(): any;
    /**
     * Redeploy the current environment
     *
     * @return Activity
     */
    redeploy(): any;
    /**
     * Get a single environment activity.
     *
     * @param string id
     *
     * @return Activity|false
     */
    getActivity(id: any): any;
    /**
     * Get a list of environment activities.
     *
     * @param int    limit
     *   Limit the number of activities to return.
     * @param string type
     *   Filter activities by type.
     * @param int    startsAt
     *   A UNIX timestamp for the maximum created date of activities to return.
     *
     * @return Activity[]
     */
    getActivities(type: any, starts_at: any): any;
    /**
     * Get a list of variables.
     *
     * @param int limit
     *
     * @return Variable[]
     */
    getVariables(limit: any): any;
    /**
     * Set a variable
     *
     * @param string name
     * @param mixed  value
     * @param bool   json
     *
     * @return Result
     */
    setVariable(name: any, value: any, is_json?: boolean, is_enabled?: boolean, is_inheritable?: boolean, is_sensitive?: boolean): any;
    /**
     * Get a single variable.
     *
     * @param string id
     *
     * @return Variable|false
     */
    getVariable(id: any): any;
    /**
     * Set the environment's route configuration.
     *
     * @param object route
     *
     * @return Route
     */
    setRoute(values?: {}): any;
    /**
     * Get the route configuration.
     *
     *
     * @return Route
     */
    getRoute(id: any): any;
    /**
     * Get the environment's routes configuration.
     *
     *
     * @return Route[]
     */
    getRoutes(): any;
    /**
     * Get the resolved URLs for the environment's routes.
     *
     * @return string[]
     */
    getRouteUrls(): any;
    /**
     * Initialize the environment from an external repository.
     *
     * This can only work when the repository is empty.
     *
     * @param string profile
     *   The name of the profile. This is shown in the resulting activity log.
     * @param string repository
     *   A repository URL, optionally followed by an '@' sign and a branch name,
     *   e.g. 'git://github.com/platformsh/platformsh-examples.git@drupal/7.x'.
     *   The default branch is 'master'.
     *
     * @return Activity
     */
    initialize(profile: any, repository: any): any;
    /**
     * Get a user's access to this environment.
     *
     * @param string uuid
     *
     * @return EnvironmentAccess|false
     */
    getUser(id: any): any;
    /**
     * Get the users with access to this environment.
     *
     * @return EnvironmentAccess[]
     */
    getUsers(): any;
    /**
     * Add a new user to the environment.
     *
     * @param string user   The user's UUID or email address (see byUuid).
     * @param string role   One of EnvironmentAccess::roles.
     * @param bool   byUuid Set true (default) if user is a UUID, or false if
     *                       user is an email address.
     *
     * Note that for legacy reasons, the default for byUuid is false for
     * Project::addUser(), but true for Environment::addUser().
     *
     * @return Result
     */
    addUser(user: any, role: any, byUuid?: boolean): any;
    /**
     * Remove a user's access to this environment.
     *
     * @param string uuid
     *
     * @return EnvironmentAccess|false
     */
    removeUser(id: any): any;
    /**
     * Get environment metrics.
     *
     * @param string query
     *   InfluxDB query
     *
     * @return Metrics
     */
    getMetrics(query: any): any;
    /**
     * Get head commit.
     *
     * @param string project id
     * @param string head commit sha
     *
     * @return Commit
     */
    getHeadCommit(): any;
}
import Ressource from "./Ressource";
