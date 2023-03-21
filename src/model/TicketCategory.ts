import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/category";
const paramDefaults = {};

export interface TicketCategoryGetParams {
  [key: string]: any;
}

export default class TicketCategory extends Ressource {
  id: string;
  label: string;

  constructor(ticketCategory: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticketCategory, [], []);

    this.id = "";
    this.label = "";
  }

  static get(queryParams?: TicketCategoryGetParams) {
    const { api_url } = getConfig();

    return super._query<TicketCategory>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams
    );
  }
}
