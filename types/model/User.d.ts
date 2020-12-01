export default class User extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(account: any, url?: string, modifiableField?: any[]);
    _queryUrl: string;
    id: string;
    created_at: string;
    updated_at: string;
    has_key: boolean;
    display_name: string;
    email: string;
    username: string;
}
import Ressource from "./Ressource";
