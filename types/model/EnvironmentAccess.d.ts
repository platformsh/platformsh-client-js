export default class EnvironmentAccess extends Ressource {
    static get(params: any, customUrl: any): any;
    static query(params: any, customUrl: any): any;
    constructor(environmentAccess: any, url: any);
    id: string;
    user: string;
    email: string;
    role: string;
    project: string;
    environment: string;
    _required: string[];
    /**
     * Get the account information for this user.
     *
     * @throws \Exception
     *
     * @return Result
     */
    getAccount(): any;
    /**
     * Get the user
     *
     * @throws \Exception
     *
     * @return User
     */
    getUser(): User;
}
import Ressource from "./Ressource";
import User from "./User";
