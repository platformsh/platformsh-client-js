import Ressource from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const url = "/v1/comments";
const paramDefaults = {};

export default class Comment extends Ressource {
  constructor(comment, config) {
    super(`:api_url${url}`, paramDefaults, {}, comment, [], [], config);

    this.ticket_id = "";
    this.comment_id = "";
    this.created_at = "";
    this.body = "";
    this.author_id = "";
    this.public = "";
    this.attachments = [];
  }

  static query(ticketId, queryParams, config) {
    return super.get(
      `:api_url${url}/${ticketId}`,
      {},
      super.getConfig(config),
      queryParams
    );
  }

  static send(comment, config) {
    const conf = super.getConfig(config);

    return request(`${conf.api_url}${url}`, "POST", comment, conf);
  }
}
