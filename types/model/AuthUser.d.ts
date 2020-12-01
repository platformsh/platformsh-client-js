export default class AuthUser extends Ressource {
    static get(params: any, customUrl: any): any;
    static update(id: any, data: any): Promise<AuthUser>;
    static updateEmailAddress(id: any, emailAddress: any): Promise<any>;
    static getUserByUsername(username: any): Promise<AuthUser>;
    constructor(user: any);
    _queryUrl: string;
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: string;
    picture: string;
    website: string;
    country: string;
    company: string;
    mfa_enabled: string;
    deactivated: string;
    created_at: string;
    updated_at: string;
}
import Ressource from "./Ressource";
