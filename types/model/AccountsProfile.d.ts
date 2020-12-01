export default class AccountsProfile extends Ressource {
    static get(params: any, customUrl: any): any;
    static update(id: any, data: any): Promise<AccountsProfile>;
    static getUserByUsername(username: any): Promise<AccountsProfile>;
    static updateProfilePicture(userId: any, picture: any): any;
    static deleteProfilePicture(userId: any): Promise<any>;
    constructor(profile: any);
    _queryUrl: string;
    id: string;
    display_name: string;
    email: string;
    username: string;
    picture: string;
    company_type: string;
    company_role: string;
    company_name: string;
    website_url: string;
    new_ui: string;
    ui_colorscheme: string;
    ui_contrast: string;
    default_catalog: string;
    marketing: string;
}
import Ressource from "./Ressource";
