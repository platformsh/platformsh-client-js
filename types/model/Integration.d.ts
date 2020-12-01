export default class Integration extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(integration: any, url: any);
    _required: string[];
    id: string;
    type: string;
    /**
     * Get a single integration activity.
     *
     * @param string id
     *
     * @return Activity|false
     */
    getActivity(id: any): any;
    /**
     * Get a list of integration activities.
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
     * Trigger the integration's web hook.
     *
     * Normally the external service should do this in response to events, but
     * it may be useful to trigger the hook manually in certain cases.
     */
    triggerHook(): any;
}
import Ressource from "./Ressource";
