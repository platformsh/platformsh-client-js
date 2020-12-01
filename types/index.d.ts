export const models: {
    Account: typeof import("./model/Account").default;
    Address: typeof import("./model/Address").default;
    Project: typeof import("./model/Project").default;
    SshKey: typeof import("./model/SshKey").default;
    Subscription: typeof import("./model/Subscription").default;
    Activity: typeof import("./model/Activity").default;
    Environment: typeof import("./model/Environment").default;
    Certificate: typeof import("./model/Certificate").default;
    Comment: typeof import("./model/Comment").default;
    Domain: typeof import("./model/Domain").default;
    EnvironmentAccess: typeof import("./model/EnvironmentAccess").default;
    Metrics: typeof import("./model/Metrics").default;
    ProjectAccess: typeof import("./model/ProjectAccess").default;
    ProjectLevelVariable: typeof import("./model/ProjectLevelVariable").default;
    Route: typeof import("./model/Route").default;
    Variable: typeof import("./model/Variable").default;
    Deployment: typeof import("./model/Deployment").default;
    Organization: typeof Organization;
    Team: typeof import("./model/Team").default;
    Region: typeof import("./model/Region").default;
    Order: typeof import("./model/Order").default;
    Me: typeof import("./model/Me").default;
    AccountsProfile: typeof import("./model/AccountsProfile").default;
    SetupRegistry: typeof import("./model/SetupRegistry").default;
    SetupConfig: typeof import("./model/SetupConfig").default;
    AuthUser: typeof import("./model/AuthUser").default;
    Integration: typeof import("./model/Integration").default;
    ApiToken: typeof import("./model/ApiToken").default;
    Commit: typeof import("./model/git/Commit").default;
    Tree: typeof import("./model/git/Tree").default;
    Blob: typeof import("./model/git/Blob").default;
    TwoFactorAuthentication: typeof import("./model/TwoFactorAuthentication").default;
    ConnectedAccount: typeof import("./model/ConnectedAccount").default;
    PaymentSource: typeof import("./model/PaymentSource").default;
    Ticket: typeof import("./model/Ticket").default;
    TicketPriority: typeof import("./model/TicketPriority").default;
    Voucher: typeof import("./model/Voucher").default;
    Invitation: typeof import("./model/Invitation").default;
};
export const api: (url: any, method: any, data: any, additionalHeaders?: {}) => any;
export default class Client {
    constructor(authenticationConfig?: {});
    authenticationPromise: any;
    getAccessToken(): any;
    getConfig(): {
        provider: string;
        client_id: string;
        account_url: string;
        api_url: string;
        authentication_url: string;
        scope: any[];
        authorization: string;
        logout_url: string;
    };
    wipeToken(): void;
    reAuthenticate(): any;
    /**
     * Get account information for the logged-in user.
     *
     * @param bool reset
     *
     * @return promise
     */
    getAccountInfo(reset?: boolean): any;
    getAccountInfoPromise: any;
    /**
     * Locate a project by ID.
     *
     * @param string id
     *   The project ID.
     *
     * @return string
     *   The project's API endpoint.
     */
    locateProject(id: any): any;
    /**
     * Get the logged-in user's projects.
     *
     * @param bool reset
     *
     * @return Promise Project[]
     */
    getProjects(): any;
    /**
     * Get a single project by its ID.
     *
     * @param string id
     * @param string hostname
     * @param bool   https
     *
     * @return Project|false
     */
    getProject(id: any): any;
    /**
     * Get the environments of project projectId
     *
     * @param string projectId
     *
     * @return Promise Environment[]
     */
    getEnvironments(projectId: any): any;
    /**
     * Get the environment environmentId of the projectId project
     *
     * @param string projectId
     * @param string environmentId
     *
     * @return Promise Environment
     */
    getEnvironment(projectId: any, environmentId: any): any;
    /**
     * Get the activities of the environment environmentId of the project projectId
     *
     * @param string projectId
     * @param string environmentId
     *
     * @return Promise Activity[]
     */
    getEnvironmentActivities(projectId: any, environmentId: any, type: any, starts_at: any): any;
    /**
     * Get the certificates of project projectId
     *
     * @param string environmentId
     *
     * @return Promise Certificate[]
     */
    getCertificates(projectId: any): any;
    /**
     * Add certificate to the project projectId
     * @param string projectId
     * @param string certificate
     * @param string key
     * @param array  chain
     */
    addCertificate(projectId: any, certificate: any, key: any, chain?: any[]): any;
    /**
     * Get the domains of the project projectId
     *
     * @param string projectId
     *
     * @return Promise Domain[]
     */
    getDomains(projectId: any, limit: any): any;
    /**
     * Get the accesses of the environment environmentId of the project projectId
     *
     * @param string projectId
     * @param string environmentId
     *
     * @return Promise EnvironmentAccess[]
     */
    getEnvironmentUsers(projectId: any, environmentId: any): any;
    /**
     * Get the route configuration.
     *
     *
     * @return Route
     */
    getRoutes(projectId: any, environmentId: any): any;
    /**
     * Get the accesses of the project projectId
     *
     * @param string projectId
     * @param string environmentId
     *
     * @return Promise EnvironmentAccess[]
     */
    getProjectUsers(projectId: any): any;
    /**
     * Get a list of variables.
     *
     * @param string projectId
     * @param int limit
     *
     * @return ProjectLevelVariable[]
     */
    getProjectVariables(projectId: any, limit: any): any;
    /**
     * Get a list of variables.
     *
     * @param string projectId
     * @param int limit
     *
     * @return ProjectLevelVariable[]
     */
    getEnvironmentVariables(projectId: any, environmentId: any, limit: any): any;
    /**
     * Get the metrics of the environment environmentId of the project projectId
     *
     * @param string projectId
     * @param string environmentId
     * @param string q
     *
     * @return Promise Metrics[]
     */
    getEnvironmentMetrics(projectId: any, environmentId: any, q: any): any;
    /**
     * Get the integrations of project projectId
     *
     * @param string projectId
     *
     * @return Promise Integration[]
     */
    getIntegrations(projectId: any): any;
    /**
     * Get the integration integrationId of the projectId project
     *
     * @param string projectId
     * @param string integrationId
     *
     * @return Promise Integration
     */
    getIntegration(projectId: any, integrationId: any): any;
    /**
     * Get the activities of the integration integrationId of the project projectId
     *
     * @param string projectId
     * @param string integrationId
     *
     * @return Promise Activity[]
     */
    getIntegrationActivities(projectId: any, integrationId: any, type: any, starts_at: any): any;
    /**
     * Get the logged-in user's SSH keys.
     *
     * @param bool reset
     *
     * @return SshKey[]
     */
    getSshKeys(): any;
    /**
     * Get a single SSH key by its ID.
     *
     * @param string|int id
     *
     * @return SshKey|false
     */
    getSshKey(id: any): any;
    /**
     * Add an SSH public key to the logged-in user's account.
     *
     * @param string value The SSH key value.
     * @param string title A title for the key (optional).
     *
     * @return Result
     */
    addSshKey(value: any, title: any): Promise<import("./model/SshKey").default>;
    /**
     * Filter a request array to remove null values.
     *
     * @param array request
     *
     * @return array
     */
    cleanRequest(req: any): {};
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
    createSubscription(config: any): any;
    /**
     * Get a subscription by its ID.
     *
     * @param string|int id
     *
     * @return Subscription|false
     */
    getSubscription(id: any): any;
    /**
     * Get a subscriptions.
     *
     * @param array filters
     *
     * @return Subscriptions[]
     */
    getSubscriptions(filter: any, all: any): any;
    /**
     * Initalize the environment for a new subscription
     *
     * @param string projectId
     * @param object options
     * @param string environmentId
     */
    initializeEnvironment(projectId: any, options: any, environmentId?: string): any;
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
    getSubscriptionEstimate(plan: any, storage: any, environments: any, user_licenses: any, format?: any, country_code?: any): any;
    /**
     * Get current deployment informations
     *
     * @param string projectId
     * @param string environmentId
     *
     * @return Deployment
     */
    getCurrentDeployment(projectId: any, environmentId: any, params: any): any;
    /**
     * Get organizations of the logged user
     *
     *
     * @return Organization[]
     */
    getOrganizations(): any;
    /**
     * Get organization
     *
     * @param string id
     *
     * @return Organization
     */
    getOrganization(id: any): any;
    /**
     * Create organization
     *
     * @param object organization
     *
     * @return Organization
     */
    createOrganization(organization: any): any;
    /**
     * Create team
     *
     * @param object team
     *
     * @return Team
     */
    createTeam(team: any): any;
    /**
     * Get teams of the logged user
     *
     *
     * @return Team[]
     */
    getTeams(): any;
    /**
     * Get team
     *
     * @param string id
     *
     * @return Team
     */
    getTeam(id: any): any;
    /**
     * Get regions
     *
     *
     * @return Region[]
     */
    getRegions(): any;
    /**
     * Get account
     *
     *
     * @return Account
     */
    getAccount(id: any): any;
    /**
     * Get address
     *
     *
     * @return Address
     */
    getAddress(id: any): any;
    /**
     * Update address
     *
     *
     * @return Address
     */
    saveAddress(address: any): any;
    /**
     * Get orders
     *
     *
     * @return Account
     */
    getOrders(owner: any): any;
    /**
     * Get order
     *
     *
     * @return Account
     */
    getOrder(id: any): any;
    /**
     * Get vouchers
     *
     *
     * @return Voucher
     */
    getVouchers(uuid: any): any;
    /**
     * Get a users cardonfile
     *
     * @return Promise
     */
    getCardOnFile(): any;
    /**
     * Get payment source.
     *
     * @param string owner The UUID of the owner.
     *
     * @return Promise
     */
    getPaymentSource(owner: any): any;
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
    addPaymentSource(type: any, token: any, email: any): any;
    /**
     * Delete payment source for the owner.
     *
     * @param {string} uuid The UUID of the owner of the payment source.
     *
     * @return {Promise} It resolves if the payment source is deleted,
     * rejects otherwise
     */
    deletePaymentSource(uuid: string): Promise<any>;
    /**
     * Get payment source allowed.
     *
     * @return Promise
     */
    getPaymentSourcesAllowed(): any;
    /**
     * Create a Setupt Intent
     *
     * @return Promise: { client_secret, public_key }
     */
    createPaymentSourceIntent(): any;
    /**
     * Get a users profile.
     *
     * @param {string} id - UUID of the user.
     * @return Promise
     */
    getUserProfile(id: string): any;
    /**
     * Get a streaming log
     *
     * @param {obj} activity - Activity for the log.
     * @return Promise
     */
    getStreamingLog(activity: any, max_items?: number): Promise<Response>;
    /**
     * Update a user's profile.
     *
     * @param {string} id - UUID of the user.
     * @param {obj} data - fields to update on the profile
     *
     * @return Promise
     */
    updateUserProfile(id: string, data: any): Promise<import("./model/AccountsProfile").default>;
    /**
     * Get a item from the registry.
     *
     * @return Promise
     */
    getSetupRegistry(): any;
    /**
     * Get a item from the registry.
     *
     * @return Promise
     */
    getSetupRegistry(): any;
    /**
     * Get a item from the registry.
     *
     * @param {string} name - name of the registry item.
     * @return Promise
     */
    getSetupRegistryItem(name: string): any;
    /**
     * Get a item from the registry.
     *
     * @param {string} name - name of the registry item.
     * @return Promise
     */
    getSetupRegistryItem(name: string): any;
    /**
     * Get a item from the registry.
     *
     * @param {string} name - name of the registry item.
     * @return Promise
     */
    getSetupConfig(settings: any): any;
    /**
     * Get a item from the registry.
     *
     * @param {string} name - name of the registry item.
     * @return Promise
     */
    getSetupConfig(settings: any): any;
    /**
     * Get a user from Auth API.
     *
     * @param { string } id - UUID of the user.
     * @return Promise
     */
    getUser(id: string): any;
    /**
     * Get the UUID for a user based on their username
     *
     * @param {string} string - username of the user.
     *
     * @return string
     */
    getUserIdFromUsername(username: any): Promise<import("./model/AccountsProfile").default>;
    /**
     * Get the activities of the project projectId
     *
     * @param string projectId
     * @param string types
     * @param string starts_at
     *
     * @return Promise Activity[]
     */
    getProjectActivities(projectId: any, types: any, starts_at: any): any;
    /**
     * Returns the information required to start the TFA enrollment process.
     *
     * @param {string} userId User identifier
     *
     * @returns {Promise<{qr_code, secret, issuer, account_name}>} Promise that
     * returns the information required to enroll the user if resolves
     */
    getTFA(userId: string): Promise<{
        qr_code;
        secret;
        issuer;
        account_name;
    }>;
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
    enrollTFA(userId: string, secret: string, passcode: string): Promise<[string]>;
    /**
     * Disables TFA for the user.
     *
     * @param {string} userId User identifier
     *
     * @return {Promise} It resolves if the user is succesfully unenrolled,
     * rejects otherwise
     */
    disableTFA(userId: string): Promise<any>;
    /**
     * Generates a new set of recovery codes.
     *
     * @param {string} userId User identifie
     *
     * @returns {Promise<[string]>} Promise that returns a list of recovery codes
     * if resolves
     */
    resetRecoveryCodes(userId: string): Promise<[string]>;
    getConnectedAccounts(userId: any): any;
    /**
     * Get a list of Zendesk tickets based on the settings.
     *
     * @param {object} settings - Filters and settings.
     * @return Promise<Ticket[]>
     */
    getTickets(settings: object): Promise<any>;
    /**
     * Update the status of a ticket.
     *
     * @param {string|number} ticketId Ticket to be updated
     * @param {string} status New status to be applied
     *
     * @return Promise<Ticket>
     */
    updateTicketStatus(ticketId: string | number, status: string): any;
    /**
     * Get a list of available priorities for the subscription ID.
     *
     * @param {string|number} subscription_id
     *
     * @return Promise<Priority[]>
     */
    getTicketPriorities(subscription_id: string | number): Promise<any>;
    /**
     * Get the ticket attachments.
     *
     * @param {number|string} ticketId
     *
     * @return Promise<Attachment[]>
     */
    getTicketAttachments(ticketId: number | string): Promise<any>;
    /**
     * Get all the attachments related to a ticket, even the ones included in the comments
     *
     * @param {number|string} ticketId
     *
     * @return Promise<Attachment[]>
     */
    getAllTicketAttachments(ticketId: number | string): Promise<any>;
    /**
     * Open a Zendesk ticket
     *
     * @param {object} ticket
     *
     * @return Promise<Ticket>
     */
    openTicket(ticket: object): Promise<any>;
    /**
     * Load comments for a ticket, excluding the initial comment.
     *
     * @param {string} ticketId
     * @return Promise<Comment[]>
     */
    loadComments(ticketId: string, params: any): Promise<any>;
    /**
     * Send a new comment.
     *
     * @param {Object} comment
     *
     * @return Promise<Comment>
     */
    sendComment(comment: any): Promise<any>;
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
    updateProfilePicture(userId: string, picture: any): Promise<{
        url: string;
    }>;
    /**
     * Deletes the user profile picture.
     *
     * @param {string} userId User identifier
     *
     * @returns {Promise} Resolves if the picture was deleted.
     */
    deleteProfilePicture(userId: string): Promise<any>;
    /**
     * Create an invitation
     *
     * @param {string} email
     * @param {string} projectId
     * @param {string} role project role
     * @param {array} Environments Array of environment object id/role
     *
     * @returns {Promise} Promise that return a Result.
     */
    createInvitation(email: string, projectId: string, role: string, environments: any, force?: boolean): Promise<any>;
    /**
     * Get project invitations list
     *
     * @param {string} projectId
     * @param {string} id
     *
     * @returns {Promise} Promise that return an inivitations list.
     */
    getInvitations(projectId: string): Promise<any>;
}
import Organization from "./model/Organization";
