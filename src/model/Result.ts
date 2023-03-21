import { APIObject, RessourceChildClass } from "./Ressource";

export default class Result {
  private _url: string | undefined;
  data: APIObject;
  detail: any;
  private _ressourceClass: RessourceChildClass<any> | undefined;

  constructor(
    result: APIObject,
    url?: string,
    ressourceClass?: RessourceChildClass<any>
  ) {
    this._url = url;
    this.data = result;
    this._ressourceClass = ressourceClass;
  }

  /**
   * Count the activities embedded in the result.
   *
   * @return int
   */
  countActivities() {
    if (!this.data._embedded?.activities) {
      return 0;
    }
    return this.data._embedded?.activities?.length;
  }

  /**
   * Get activities embedded in the result.
   *
   * A result could embed 0, 1, or many activities.
   *
   * @return Activity[]
   */
  getActivities() {
    if (!this.data._embedded?.activities) {
      return [];
    }
    // Workaround the cycle dependency with webpack Ressource->Result->Activity->Ressouce...
    const Activity = require("./Activity").default;

    return this.data._embedded.activities.map(
      activity => new Activity(activity, this._url)
    );
  }

  /**
   * Get the entity embedded in the result or an Instance
   * of this calling Resource if no entity exist in the result
   * @throws \Exception If Resource result or Constructor does not exist
   *
   * @return Resource
   *   An instance of Resource.
   */
  getEntity() {
    const data = this.data["_embedded"]?.["entity"] || this.data;

    if (!data || !this._ressourceClass) {
      throw new Error("No entity found in result");
    }

    return new this._ressourceClass(data, this._url);
  }
}
