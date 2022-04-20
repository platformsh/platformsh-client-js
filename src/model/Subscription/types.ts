import {components} from '../../types/model';

export interface SubscriptionGetParams {
    id: string;
    [key: string]: any;
};

export enum SubscriptionStatusEnum {
    STATUS_FAILED = "provisioning Failure",
    STATUS_SUSPENDED = "suspended",
    STATUS_DELETED = "deleted",
    STATUS_ACTIVE = "active",
    STATUS_REQUESTED = "requested",
    STATUS_PROVISIONING = "provisioning",
};  

export type SubscriptionEstimateQueryType = {
    plan?: string
    environments?: number
    storage?: number
    user_licenses?: number
    format?: "formatted" | "complex"
    big_dev?: string //Not available anymore on API
};

export type SubscriptionType = components['schemas']['Subscription'];