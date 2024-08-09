import { getConfig } from "../config";

import type { FormattedCost } from "./Cost";
import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/organizations/:organizationId/discounts";
const paramDefaults = {};
const creatableField = ["code"];

export type OrganizationDiscountGetParams = {
  [key: string]: any;
  organizationId: string;
};

export type DiscountResponse = {
  discounts: OrganizationDiscount[];
};

export default class OrganizationDiscount extends Ressource {
  items: {
    end_at: string;
    id: number;
    organization_id: string;
    start_at: string;
    status: string;
    total_months: number;
    type: string;
    type_label: string;
    commitment: {
      months: number;
      amount: {
        commitment_period: FormattedCost;
        contract_total: FormattedCost;
        monthly: FormattedCost;
      };
      net: {
        commitment_period: FormattedCost;
        contract_total: FormattedCost;
        monthly: FormattedCost;
      };
    } | null;
    config: {
      commitment_amount: number;
      commitment_months: number;
      discount_amount: number;
      discount_currency: string;
      end_month: number;
      end_year: number;
      start_month: number;
      start_year: number;
    };
    discount: {
      commitment_period?: FormattedCost;
      contract_total?: FormattedCost;
      monthly: FormattedCost;
    };
  }[];

  constructor(discount: APIObject, customUrl?: string) {
    const { api_url } = getConfig();

    super(
      customUrl ?? `${api_url}${url}`,
      paramDefaults,
      {},
      discount,
      creatableField
    );
    this.items = [];
  }

  static async get(params: OrganizationDiscountGetParams, customUrl?: string) {
    const { organizationId, ...queryParams } = params;
    const { api_url } = getConfig();

    return super._get<OrganizationDiscount>(
      customUrl ?? `${api_url}${url}`,
      { organizationId },
      {},
      queryParams
    );
  }
}
