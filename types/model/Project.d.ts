export default class Project extends Ressource {
    static get(params: any, customUrl: any): any;
    constructor(project: any, url: any);
    _queryUrl: string;
    id: string;
    cluster: string;
    cluster_label: string;
    title: string;
    created_at: string;
    updated_at: string;
    name: string;
    owner: string;
    owner_info: {};
    plan: string;
    plan_uri: string;
    subscription: {};
    subscription_id: string;
    status: string;
    endpoint: string;
    repository: {};
    region: string;
    region_label: string;
    vendor: string;
    vendor_label: string;
    vendor_resources: string;
    vendor_website: string;
    default_domain: string;
    /**
     * Get the subscription ID for the project.
     *
     * @todo when APIs are unified, this can be a property
     *
     * @return int
     */
    getSubscriptionId(): any;
    /**
     * Get the Git URL for the project.
     *
     * @return string
     */
    getGitUrl(): any;
    /**
     * Get the users associated with a project.
     *
     * @return ProjectAccess[]
     */
    getUsers(): any;
    /**
     * Add a new user to a project.
     *
     * @param string user   The user's UUID or email address (see byUuid).
     * @param string role   One of ProjectAccess::$roles.
     * @param bool   byUuid Set true if user is a UUID, or false (default) if
     *                       user is an email address.
     *
     * Note that for legacy reasons, the default for byUuid is false for
     * Project::addUser(), but true for Environment::addUser().
     *
     * @return Result
     */
    addUser(user: any, role: any, byUuid?: boolean): any;
    /**
     * Get a single environment of the project.
     *
     * @param string id
     *
     * @return Environment|false
     */
    getEnvironment(id: any): any;
    /**
     * Get a list of environments for the project.
     *
     * @param int limit
     *
     * @return Environment[]
     */
    getEnvironments(limit: any): any;
    /**
     * Get a list of domains for the project.
     *
     * @param int limit
     *
     * @return Domain[]
     */
    getDomains(limit: any): any;
    /**
     * Get a single domain of the project.
     *
     * @param string name
     *
     * @return Domain|false
     */
    getDomain(name: any): any;
    /**
     * Add a domain to the project.
     *
     * @param string name
     * @param array  ssl
     *
     * @return Result
     */
    addDomain(name: any, ssl?: any[]): any;
    /**
     * Get a list of integrations for the project.
     *
     * @param int limit
     *
     * @return Integration[]
     */
    getIntegrations(limit: any): any;
    /**
     * Get a single integration of the project.
     *
     * @param string id
     *
     * @return Integration|false
     */
    getIntegration(id: any): any;
    /**
     * Add an integration to the project.
     *
     * @param string type
     * @param array data
     *
     * @return Result
     */
    addIntegration(type: any, data?: any[]): any;
    /**
     * Get a single project activity.
     *
     * @param string id
     *
     * @return Activity|false
     */
    getActivity(id: any): any;
    /**
     * Get a list of project activities.
     *
     * @param int limit
     *   Limit the number of activities to return.
     * @param string[] types
     *   Filter activities by type.
     * @param int startsAt
     *   A UNIX timestamp for the maximum created date of activities to return.
     *
     * @return Activity[]
     */
    getActivities(types: any, starts_at: any): any;
    /**
     * Returns whether the project is suspended.
     *
     * @return bool
     */
    isSuspended(): boolean;
    /**
     * Get a list of variables.
     *
     * @param int limit
     *
     * @return ProjectLevelVariable[]
     */
    getVariables(limit: any): any;
    /**
     * Set a variable.
     *
     * @param string name
     *   The name of the variable to set.
     * @param mixed  value
     *   The value of the variable to set.  If non-scalar it will be JSON-encoded automatically.
     * @param bool json
     *   True if this value is an encoded JSON value. false if it's a primitive.
     * @param bool visibleBuild
     *   True if this variable should be exposed during the build phase, false otherwise.
     * @param bool visibleRuntime
     *   True if this variable should be exposed during deploy and runtime, false otherwise.
     *
     * @return Result
     */
    setVariable(name: any, value: any, is_json?: boolean, is_sensitive?: boolean, visible_build?: boolean, visible_runtime?: boolean): any;
    /**
     * Get a single variable.
     *
     * @param string id
     *   The name of the variable to retrieve.
     * @return ProjectLevelVariable|false
     *   The variable requested, or False if it is not defined.
     */
    getVariable(name: any): any;
    /**
     * get certificates
     */
    getCertificates(): any;
    /**
     * add certificate
     * @param string certificate
     * @param string key
     * @param array  chain
     */
    addCertificate(certificate: any, key: any, chain?: any[]): any;
    /**
     * subscribe to project updates
     */
    subscribe(): any;
    /**
     * Load the theme of the project
     * That contain colors and logo urls
     */
    loadTheme(): Promise<any>;
}
import Ressource from "./Ressource";
