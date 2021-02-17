import Ressource from "./Ressource";
import { getConfig } from "../config";

const url = "/v1/tickets/category";
const paramDefaults = {};

export default class TicketCategory extends Ressource {
  constructor(ticketCategory, url, params, config) {
    super(`:api_url${url}`, paramDefaults, {}, ticketCategory, [], [], config);

    this.id = "";
    this.label = "";
  }

  static get(queryParams, config) {
    return super.query(
      `:api_url${url}`,
      {},
      super.getConfig(config),
      queryParams,
      data => data
    );
  }
}
