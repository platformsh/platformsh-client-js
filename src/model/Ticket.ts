import Ressource, { APIObject } from "./Ressource";
import { getConfig } from "../config";
import request from "../api";

const url = "/v1/tickets";
const paramDefaults = {};

export interface TicketQueryParams {
  [key: string]: any;
}

export interface Attachment {
  filename: string;
  uri: string;
  content_type: string;
}

export type TicketResponse = {
  data: {
    count: number;
    tickets: Array<Ticket>;
  };
} & APIObject;

export interface AttachmentsResponse {
  attachments: Array<Attachment>;
}

export default class Ticket extends Ressource {
  subject: string;
  description: string;
  requester_id: string;
  priority: string;
  affected_url: string;
  subscription_id: string;
  attachment: string;
  attachment_filename: string;

  constructor(ticket: APIObject) {
    const { api_url } = getConfig();

    super(`${api_url}${url}`, paramDefaults, {}, ticket, [], []);

    this.subject = "";
    this.description = "";
    this.requester_id = "";
    this.priority = "";
    this.affected_url = "";
    this.subscription_id = "";
    this.attachment = "";
    this.attachment_filename = "";
  }

  static getAttachments(ticketId: string) {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/description`;

    return super._get<AttachmentsResponse>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      {}
    );
  }

  static getAllAttachments(ticketId: string): Promise<Array<Attachment>> {
    const { api_url } = getConfig();
    const url = `/v1/comments/${ticketId}/attachments`;

    return request(`${api_url}${url}`, "GET");
  }

  static query(queryParams: TicketQueryParams) {
    const { api_url } = getConfig();

    return super._get<TicketResponse>(
      `${api_url}${url}`,
      {},
      paramDefaults,
      queryParams
    );
  }

  static open(ticket: APIObject) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}`, "POST", ticket);
  }

  static patch(ticketId: string, ticket: APIObject) {
    const { api_url } = getConfig();

    return request(`${api_url}${url}/${ticketId}`, "PATCH", ticket);
  }
}
