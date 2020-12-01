export default class Organization extends Ressource {
    static get(params: {}, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(organization: any, url: any);
    id: string;
    name: string;
    label: string;
    owner: string;
    getMembers(): any;
    addMember(member: any): any;
}
import Ressource from "./Ressource";
