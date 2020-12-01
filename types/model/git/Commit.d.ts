export default class Commit extends Ressource {
    static get(projectId: any, sha: any): any;
    constructor(commit: any, url: any, params: any);
    id: string;
    sha: string;
    author: string;
    committer: string;
    message: string;
    tree: string;
    parents: any[];
    getTree(projectId?: any): Promise<any>;
}
import Ressource from "../Ressource";
