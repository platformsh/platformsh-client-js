export default class Blob extends Ressource {
    static get(projectId: any, sha: any): any;
    constructor(blob: any, url: string, params: any);
    id: string;
    type: string;
    path: string;
    sha: string;
    size: string;
    encoding: string;
    content: string;
    getInstance(): Promise<any>;
    decodeBase64(): any;
    /**
     * Get the raw content of the file.
     *
     * @return string
     */
    getRawContent(): Promise<any>;
}
import Ressource from "../Ressource";
