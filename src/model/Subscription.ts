import isUrl from "is-url";

import Ressource, { APIObject } from "./Ressource";
import Account from "./Account";
import Project from "./Project";
import { getConfig } from "../config";
import { authenticatedRequest } from "../api";

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

const modifiableField = ["plan", "environments", "storage", "big_dev"];

const url = "/v1/subscriptions/:id";
const STATUS_ACTIVE = "active";
const STATUS_REQUESTED = "requested";
const STATUS_PROVISIONING = "provisioning";

const availablePlans = ["development", "standard", "medium", "large"];
const availableRegions = ["eu.platform.sh", "us.platform.sh"];

export enum SubscriptionStatusEnum {
  STATUS_FAILED = "provisioning Failure",
  STATUS_SUSPENDED = "suspended",
  STATUS_DELETED = "deleted",
  STATUS_ACTIVE = "active",
  STATUS_REQUESTED = "requested",
  STATUS_PROVISIONING = "provisioning",
}

export interface SubscriptionGetParams {
  id: string;
  [key: string]: any;
};

export default class Subscription extends Ressource {
  id: string;
  status: SubscriptionStatusEnum;
  owner: string;
  plan: string;
  environments: number;
  storage: number;
  big_dev: number;
  user_licenses: number;
  project_id: string;
  project_title: string;
  project_region: string;
  project_region_label: string;
  project_ui: string;
  vendor: string;
  owner_info: object;
  organization: string;
  created_at: string;
  users_licenses: number;
  license_uri: string;

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
    this.id = "";
    this.status = SubscriptionStatusEnum.STATUS_FAILED;
    this.owner = "";
    this.plan = "";
    this.environments = 0;
    this.storage = 0;
    this.big_dev = 0;
    this.user_licenses = 0;
    this.project_id = "";
    this.project_title = "";
    this.project_region = "";
    this.project_region_label = "";
    this.project_ui = "";
    this.vendor = "";
    this.owner_info = {};
    this.organization = "";
    this.created_at = "";
    this.users_licenses = 0;
    this.license_uri = "";
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
  checkProperty(property: string, value: number | {uri: string}) {
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

    return Project.get({ id: this.project_id }, url);
  }

  /**
   * Get estimate associated with this subscription.
   *
   * @return Project|false
   */
  getEstimate() {
    const params = {
      plan: this.plan,
      storage: this.storage,
      environments: this.environments,
      user_licenses: this.users_licenses,
      big_dev: this.big_dev || undefined
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
  wrap(data: { subscriptions?: Array<Subscription>}) {
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
