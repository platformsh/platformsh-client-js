export default class Result {
    constructor(result: any, url: any, ressourceClass: any);
    _url: any;
    data: any;
    _ressourceClass: any;
    /**
     * Count the activities embedded in the result.
     *
     * @return int
     */
    countActivities(): any;
    /**
     * Get activities embedded in the result.
     *
     * A result could embed 0, 1, or many activities.
     *
     * @return Activity[]
     */
    getActivities(): any;
    /**
     * Get the entity embedded in the result.
     *
     * @throws \Exception If no entity was embedded.
     *
     * @return Resource
     *   An instance of Resource.
     */
    getEntity(): any;
}
