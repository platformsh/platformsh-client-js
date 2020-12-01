export default class Me extends User {
    static get(): any;
    constructor(account: any);
    projects: any[];
    ssh_keys: any[];
    roles: any[];
    organizations: any[];
    teams: any[];
    picture: string;
    newsletter: string;
    plaintext: string;
    website: string;
    company_role: string;
    company_type: string;
    mail: string;
    trial: boolean;
}
import User from "./User";
