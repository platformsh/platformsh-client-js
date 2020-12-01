export default class ApiToken extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    constructor(data: any, params: any);
    _queryUrl: string;
    id: string;
    name: string;
    created_at: string;
    update_at: string;
    token: string;
}
import Ressource from "./Ressource";
