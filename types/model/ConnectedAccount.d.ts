export default class ConnectedAccount extends Ressource {
    static get(userId: any, provider: any): any;
    static query(userId: any): any;
    constructor(connectedAccount: any, url: any);
    provider: string;
    subject: string;
    created_at: string;
    updated_at: string;
}
import Ressource from "./Ressource";
