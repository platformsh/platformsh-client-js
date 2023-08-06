import isUrl from "is-url";

import { authenticatedRequest } from "../api";
import { getConfig } from "../config";

import Account from "./Account";
import Project from "./Project";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

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
  "backups",
  "blackfire",
  "observability_suite"
];

const url = "/v1/subscriptions/:id";

const availablePlans = ["development", "standard", "medium", "large"];
const availableRegions = ["eu.platform.sh", "us.platform.sh"];

export enum SubscriptionStatusEnum {
  STATUS_FAILED = "provisioning Failure",
  STATUS_SUSPENDED = "suspended",
  STATUS_DELETED = "deleted",
  STATUS_ACTIVE = "active",
  STATUS_REQUESTED = "requested",
  STATUS_PROVISIONING = "provisioning"
}

export type SubscriptionGetParams = {
  [key: string]: any;
  id: string;
};

export type SubscriptionEstimateQueryType = {
  plan?: string;
  environments?: number;
  storage?: number;
  user_licenses?: number;
  format?: "formatted" | "complex";
  big_dev?: string; // Not available anymore on API
};

type SellablesNameType = "observability_suite" | "blackfire";
type SellableType = {
  [x in SellablesNameType]?: {
    available: boolean;
    products: string[];
  };
};

export default class Subscription extends Ressource {
  id: string;
  status: SubscriptionStatusEnum;
  created_at: string;
  owner_info: {
    type: string;
  };

  blackfire?: string;
  observability_suite?: string;
  owner: string;
  plan: string;
  environments: number;
  storage: number;
  big_dev: number;
  backups: string;
  user_licenses: number;
  project_id: string;
  project_title: string;
  project_region: string;
  project_region_label: string;
  project_ui: string;
  vendor: string;
  organization: string;
  users_licenses: number;
  license_uri: string;
  organization_id: string;
  project_options: {
    plan_title: Record<string, string>;
    sellables?: SellableType;
    initialize?: Record<string, string>;
  };

  enterprise_tag: string;
  support_tier: string;

  constructor(subscription: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      subscription,
      subscription,
      creatableField,
      modifiableField
    );

    this._queryUrl = Ressource.getQueryUrl(customUrl ?? `${api_url}${url}`);
    this._required = ["project_region"];
    this.id = "";
    this.status = SubscriptionStatusEnum.STATUS_FAILED;
    this.owner = "";
    this.plan = "";
    this.environments = 0;
    this.storage = 0;
    this.big_dev = 0;
    this.backups = "";
    this.user_licenses = 0;
    this.project_id = "";
    this.project_title = "";
    this.project_region = "";
    this.project_region_label = "";
    this.project_ui = "";
    this.vendor = "";
    this.owner_info = {
      type: ""
    };
    this.organization = "";
    this.created_at = "";
    this.users_licenses = 0;
    this.license_uri = "";
    this.organization_id = "";
    this.project_options = {
      plan_title: {},
      sellables: {
        blackfire: { products: [], available: false },
        observability_suite: { products: [], available: false }
      },
      initialize: {}
    };
    this.enterprise_tag = "";
    this.support_tier = "";
    this.blackfire = "";
    this.observability_suite = "";
  }

  static async get(params: SubscriptionGetParams, customUrl?: string) {
    const { id, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<Subscription>(
      customUrl ?? `${api_url}${url}`,
      { id },
      paramDefaults,
      queryParams
    );
  }

  static async query(params: Record<string, any>) {
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
  async wait(
    onPoll: (subscription: Subscription) => void,
    intervalSeconds = 2
  ) {
    const millisecInterval = intervalSeconds * 1000;

    return new Promise(resolve => {
      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        if (!this.isPending()) {
          resolve(this);
          clearInterval(interval);
          return;
        }
        void this.refresh().then(() => {
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
    } else if (
      property === "activation_callback" &&
      typeof value !== "number"
    ) {
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

    return (
      status === SubscriptionStatusEnum.STATUS_PROVISIONING ||
      status === SubscriptionStatusEnum.STATUS_REQUESTED
    );
  }

  /**
   * Find whether the subscription is active.
   *
   * @return bool
   */
  isActive() {
    return this.getStatus() === SubscriptionStatusEnum.STATUS_ACTIVE;
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
  async getOwner() {
    const id = this.owner;

    return Account.get(
      { id },
      this.makeAbsoluteUrl("/api/users", this.getLink("project"))
    );
  }

  /**
   * Get the project associated with this subscription.
   *
   * @return Project|false
   */
  async getProject() {
    if (!this.hasLink("project") && !this.isActive()) {
      throw new Error("Inactive subscriptions do not have projects.");
    }

    return Project.get({ id: this.project_id }, this.getLink("project"));
  }

  /**
   * Get estimate associated with this subscription.
   * @param query the query parameter for this subscription estimate
   * @return Project|false
   */
  async getEstimate(query?: SubscriptionEstimateQueryType) {
    const params = {
      plan: query?.plan ?? this.plan,
      storage: query?.storage ?? this.storage,
      environments: query?.environments ?? this.environments,
      user_licenses: query?.user_licenses ?? this.users_licenses,
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
  wrap(data: { subscriptions?: Subscription[] }) {
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
    super.copy(data.subscriptions?.[0] || data);
  }
}
