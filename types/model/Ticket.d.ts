export default class Ticket extends Ressource {
    static getAttachments(ticketId: any): any;
    static getAllAttachments(ticketId: any): any;
    static query(queryParams: any): any;
    static open(ticket: any): any;
    static patch(ticketId: any, ticket: any): any;
    constructor(ticket: any);
    subject: string;
    description: string;
    requester_id: string;
    priority: string;
    affected_url: string;
    subscription_id: string;
    attachment: string;
    attachment_filename: string;
}
import Ressource from "./Ressource";
