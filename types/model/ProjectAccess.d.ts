export default class ProjectAccess extends Ressource {
    static query(params: {}, customUrl: any): any;
    constructor(projectAccess: any, url: any);
    _required: string[];
    id: string;
    role: string;
    user: string;
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
