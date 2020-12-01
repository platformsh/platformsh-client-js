export default class Comment extends Ressource {
    static query(ticketId: any, queryParams: any): any;
    static send(comment: any): any;
    constructor(comment: any);
    ticket_id: string;
    comment_id: string;
    created_at: string;
    body: string;
    author_id: string;
    public: string;
    attachments: any[];
}
import Ressource from "./Ressource";
