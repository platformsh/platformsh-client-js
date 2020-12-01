export default class Tree extends Ressource {
    static get(projectId: any, sha?: any): Promise<any>;
    constructor(tree: any, url: string, params: any);
    id: string;
    type: string;
    sha: string;
    path: string;
    tree: any[];
    getInstance(): Promise<any>;
}
import Ressource from "../Ressource";
