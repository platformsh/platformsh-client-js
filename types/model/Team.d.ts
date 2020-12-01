export default class Team extends Ressource {
    static get(params: {}, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(team: any, url: any);
    id: string;
    name: string;
    parent: string;
    organization: string;
    getMembers(): any;
    addMember(member: any): any;
}
import Ressource from "./Ressource";
