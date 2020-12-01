export default class Subscription extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    static getAvailablePlans(): string[];
    static getAvailableRegions(): string[];
    constructor(subscription: any);
    _queryUrl: string;
    _required: string[];
    id: string;
    status: string;
    owner: string;
    plan: string;
    environments: number;
    storage: number;
    user_licenses: number;
    project_id: string;
    project_title: string;
    project_region: string;
    project_region_label: string;
    project_ui: string;
    vendor: string;
    STATUS_FAILED: string;
    STATUS_SUSPENDED: string;
    STATUS_DELETED: string;
    owner_info: {};
    /**
     * Wait for the subscription's project to be provisioned.
     *
     * @param callable  onPoll   A function that will be called every time the
     *                            subscription is refreshed. It will be passed
     *                            one argument: the Subscription object.
     * @param int       interval The polling interval, in seconds.
     */
    wait(onPoll: any, interval?: number): any;
    /**
     * Check whether the subscription is pending (requested or provisioning).
     *
     * @return bool
     */
    isPending(): boolean;
    /**
     * Find whether the subscription is active.
     *
     * @return bool
     */
    isActive(): boolean;
    /**
     * Get the subscription status.
     *
     * This could be one of Subscription::STATUS_ACTIVE,
     * Subscription::STATUS_REQUESTED, Subscription::STATUS_PROVISIONING,
     * Subscription::STATUS_SUSPENDED, or Subscription::STATUS_DELETED.
     *
     * @return string
     */
    getStatus(): string;
    /**
     * Get the account for the project's owner.
     *
     * @return Account|false
     */
    getOwner(): any;
    /**
     * Get the project associated with this subscription.
     *
     * @return Project|false
     */
    getProject(): any;
    /**
     * Get estimate associated with this subscription.
     *
     * @return Project|false
     */
    getEstimate(): any;
    /**
     * @inheritdoc
     */
    wrap(data: any): any;
}
import Ressource from "./Ressource";
