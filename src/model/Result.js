
export default class Result {
  constructor(result) {
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
  getActivities(url, ResultClass) {
    if (!this.data._embedded.activities) {
      return [];
    }
    return this.data._embedded.activities.map(activity => new ResultClass(url, activity));
  }
}
