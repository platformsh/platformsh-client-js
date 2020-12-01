export default class TeamMember extends Ressource {
    static get(params: {}, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(teamMember: any, url: any);
    user: string;
}
import Ressource from "./Ressource";
