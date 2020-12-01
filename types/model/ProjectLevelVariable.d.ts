export default class ProjectLevelVariable extends Ressource {
    static get(params: {}, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(projectLevelVariable: any, url: any);
    id: string;
    name: string;
    value: string;
    is_json: string;
    is_sensitive: string;
    visible_build: string;
    visible_runtime: string;
    created_at: string;
    updated_at: string;
}
import Ressource from "./Ressource";
