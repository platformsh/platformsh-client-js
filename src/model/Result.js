export default class Result {
  constructor(result, url) {
    this._url = url;
    this.data = result;
  }

  /**
  * Count the activities embedded in the result.
  *
  * @return int
  */
  countActivities() {
    if (!this.data._embedded.activities) {
      return 0;
    }
    return this.data._embedded.activities.length;
  }

  /**
  * Get activities embedded in the result.
  *
  * A result could embed 0, 1, or many activities.
  *
  * @return Activity[]
  */
  getActivities() {
    if (!this.data._embedded.activities) {
      return [];
    }
    // Workaround the cycle dependency with webpack Ressource->Result->Activity->Ressouce...
    const Activity = require('./Activity');

    return this.data._embedded.activities.map(activity => new Activity(activity, this._url));
  }
}
