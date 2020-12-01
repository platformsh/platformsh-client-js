export default class TicketPriority extends Ressource {
    static get(queryParams: any): any;
    constructor(ticketPriority: any);
    id: string;
    label: string;
    short_description: string;
    description: string;
}
import Ressource from "./Ressource";
