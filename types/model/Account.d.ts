export default class Account extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any): any;
    constructor(account: any);
    _queryUrl: string;
    id: string;
    created_at: string;
    updated_at: string;
    has_key: boolean;
    display_name: string;
    email: string;
    picture: string;
    roles: string;
}
import Ressource from "./Ressource";
