import isUrl from "is-url";

import Ressource, { APIObject } from "../Ressource";
import Account from "../Account";
import Project from "../Project";
import { getConfig } from "../../config";
import { authenticatedRequest } from "../../api";

import { autoImplementWithResources } from "../utils";
import { SubscriptionGetParams, SubscriptionType, SubscriptionEstimateQueryType } from "./types";

const paramDefaults = {};
const creatableField = [
  "project_region",
  "plan",
  "project_title",
  "storage",
  "environments",
  "options_url",
  "vendor",
  "options_custom",
  "default_branch"
];

const modifiableField = [
  "plan",
  "environments",
  "storage",
  "big_dev",
  "backups"
];

const url = "/v1/subscriptions/:id";
const STATUS_ACTIVE = "active";
const STATUS_REQUESTED = "requested";
const STATUS_PROVISIONING = "provisioning";

const availablePlans = ["development", "standard", "medium", "large"];
const availableRegions = ["eu.platform.sh", "us.platform.sh"];

export default class Subscription extends autoImplementWithResources()<SubscriptionType>() {
  big_dev: number;
  backups: string;
  organization: string;
  license_uri: string;
  organization_id: string;

  constructor(subscription: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl || `${api_url}${url}`,
      paramDefaults,
      subscription,
      subscription,
      creatableField,
      modifiableField
    );

    this._queryUrl = Ressource.getQueryUrl(customUrl || `${api_url}${url}`);
    this._required = ["project_region"];
    this.big_dev = subscription.big_dev;
    this.backups = subscription.backup;
    this.organization = subscription.organization;
    this.user_licenses = subscription.users_licences;
    this.license_uri = subscription.license_uri;
    this.organization_id = subscription.organization_id;
  }

  static get(params: SubscriptionGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Subscription>(
      customUrl || `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static query(params: Record<string, any>) {
    const { api_url } = getConfig();

    return super._query<Subscription>(
      this.getQueryUrl(`${api_url}${url}`),
      {},
      paramDefaults,
      params,
      data => (data as APIObject).subscriptions
    );
  }

  static getAvailablePlans() {
    return availablePlans;
  }

  static getAvailableRegions() {
    return availableRegions;
  }

  /**
   * Wait for the subscription's project to be provisioned.
   *
   * @param callable  onPoll   A function that will be called every time the
   *                            subscription is refreshed. It will be passed
   *                            one argument: the Subscription object.
   * @param int       interval The polling interval, in seconds.
   */
  wait(onPoll: (subscription: Subscription) => void, interval = 2) {
    const millisecInterval = interval * 1000;

    return new Promise(resolve => {
      const interval: NodeJS.Timeout = setInterval(() => {
        if (!this.isPending()) {
          resolve(this);
          return clearInterval(interval);
        }
        this.refresh().then(() => {
          if (onPoll) {
            onPoll(this);
          }
        });
      }, millisecInterval);
    });
  }

  /**
   * @inheritdoc
   */
  checkProperty(property: string, value: number | { uri: string }) {
    const errors: Record<string, string> = {};

    if (property === "storage" && typeof value === "number" && value < 1024) {
      errors[property] = "Surltorage must be at least 1024 MiB";
    } else if (property === "activation_callback" && typeof value != "number") {
      if (!value?.uri) {
        errors[property] = "A 'uri' key is required in the activation callback";
      } else if (!isUrl(value.uri)) {
        errors[property] = "Invalid URI in activation callback";
      }
    }

    return errors;
  }

  /**
   * Check whether the subscription is pending (requested or provisioning).
   *
   * @return bool
   */
  isPending() {
    const status = this.getStatus();

    return status === STATUS_PROVISIONING || status === STATUS_REQUESTED;
  }
  /**
   * Find whether the subscription is active.
   *
   * @return bool
   */
  isActive() {
    return this.getStatus() === STATUS_ACTIVE;
  }
  /**
   * Get the subscription status.
   *
   * This could be one of Subscription::STATUS_ACTIVE,
   * Subscription::STATUS_REQUESTED, Subscription::STATUS_PROVISIONING,
   * Subscription::STATUS_SUSPENDED, or Subscription::STATUS_DELETED.
   *
   * @return string
   */
  getStatus() {
    return this.status;
  }
  /**
   * Get the account for the project's owner.
   *
   * @return Account|false
   */
  getOwner() {
    const id = this.owner;
    const url = this.makeAbsoluteUrl("/api/users", this.getLink("project"));

    return Account.get({ id }, url);
  }

  /**
   * Get the project associated with this subscription.
   *
   * @return Project|false
   */
  getProject() {
    if (!this.hasLink("project") && !this.isActive()) {
      throw new Error("Inactive subscriptions do not have projects.");
    }
    const url = this.getLink("project");
    if(this.project_id) {
      return Project.get({ id: this.project_id }, url);
    }
  }

  /**   
   * Get estimate associated with this subscription.
   * @param query the query parameter for this subscription estimate
   * @return Project|false 
   */
  getEstimate(query?: SubscriptionEstimateQueryType) {
    const params = {
      plan: query?.plan || this.plan,
      storage: query?.storage || this.storage,
      environments: query?.environments || this.environments,
      user_licenses: query?.user_licenses || this.user_licenses,
      big_dev: this.big_dev || undefined,
      backups: this.backups || undefined,
      format: query?.format,
      ...query
    };

    return authenticatedRequest(
      `${this._queryUrl}/${this.id}/estimate`,
      "GET",
      params
    );
  }

  /**
   * @inheritdoc
   */
  wrap(data: { subscriptions?: Array<Subscription> }) {
    return Ressource.wrap(data?.subscriptions ? data.subscriptions : []);
  }

  /**
   * @inheritdoc
   */
  operationAvailable(op: string) {
    if (op === "edit") {
      return true;
    }
    return super.operationAvailable(op);
  }

  /**
   * @inheritdoc
   */
  getLink(rel: string, absolute = true) {
    if (rel === "#edit" || rel === "#delete") {
      return this.getUri(absolute);
    }

    return super.getLink(rel, absolute);
  }

  /**
   * @inheritdoc
   */
  copy(data: APIObject = {}) {
    super.copy((data.subscriptions && data.subscriptions[0]) || data)
  }
}
