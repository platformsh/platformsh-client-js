export default class OrganizationMember extends Ressource {
    static get(params: {}, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(organizationMember: any, url: any);
    user: string;
    role: string;
    organizationId: string;
}
import Ressource from "./Ressource";
