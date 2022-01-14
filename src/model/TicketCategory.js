import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/category";
const paramDefaults = {};

export default class TicketCategory extends Ressource {
  constructor(ticketCategory) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticketCategory, [], []);

    this.id = "";
    this.label = "";
  }

  static get(queryParams) {
    const { api_url } = getConfig();

    return super._query(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams,
      data => data
    );
  }
}
