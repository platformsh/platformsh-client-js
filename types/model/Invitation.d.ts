export default class Invitation extends Ressource {
    static get(projectId: any, id: any): any;
    static query(projectId: any): any;
    constructor(invitation: any, url: any);
    _queryUrl: string;
    id: string;
    owner: {};
    projectId: string;
    environments: any[];
    state: string;
    email: string;
    role: string;
    force: boolean;
}
import Ressource from "./Ressource";
