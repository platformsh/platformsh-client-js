import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const url = "/v1/comments";
const paramDefaults = {};

export default class Comment extends Ressource {
  constructor(comment) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, comment, [], []);

    this.ticket_id = "";
    this.comment_id = "";
    this.created_at = "";
    this.body = "";
    this.author_id = "";
    this.public = "";
    this.attachments = [];
  }

  static query(ticketId, queryParams) {
    const { api_url } = getConfig();

    return super._get(
      `${api_url}${url}/${ticketId}`,
      {},
      paramDefaults,
      queryParams
    );
  }

  static send(comment) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}`, "POST", comment);
  }
}
