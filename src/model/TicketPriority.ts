import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/priority";
const paramDefaults = {};

export interface TicketPriorityGetParams {
  [key: string]: any;
}

export default class TicketPriority extends Ressource {
  id: string;
  label: string;
  short_description: string;
  description: string;

  constructor(ticketPriority: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticketPriority, [], []);

    this.id = "";
    this.label = "";
    this.short_description = "";
    this.description = "";
  }

  static get(queryParams: TicketPriorityGetParams) {
    const { api_url } = getConfig();

    return super._query<TicketPriority>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams
    );
  }
}
