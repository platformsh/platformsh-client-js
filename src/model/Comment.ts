import request from "../api";
import { getConfig } from "../config";

import type { APIObject } from "./Ressource";
import Ressource from "./Ressource";

const url = "/v1/comments";
const paramDefaults = {};

const createableField = ["body", "ticket_id", "attachments", "author_id"];

export type CommentsResponse = {
  data: {
    comments: Comment[];
    count: number;
  } & APIObject;
};

export default class Comment extends Ressource {
  id: string;
  ticket_id: string;
  comment_id: string;
  created_at: string;
  body: string;
  author_id: string;
  public: string;
  attachments: any[];

  constructor(comment: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, comment, createableField, []);

    this.ticket_id = comment.ticket_id ?? "";
    this.id = this.ticket_id;
    this.comment_id = comment.comment_id ?? "";
    this.created_at = comment.created_at ?? "";
    this.body = comment.body ?? "";
    this.author_id = comment.author_id ?? "";
    this.public = comment.public ?? "";
    this.attachments = comment.attachments ?? [];
  }

  static async query(ticketId: string, queryParams: Record<string, any>) {
    const { api_url } = getConfig();

    return super._get<CommentsResponse>(
      `${api_url}${url}/${ticketId}`,
      {},
      paramDefaults,
      queryParams
    );
  }

  // @deprecated use save() on the instance instead
  static async send(comment: Comment) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}`, "POST", comment);
  }
}
