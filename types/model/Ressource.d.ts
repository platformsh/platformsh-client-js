export default class Ressource {
    static getQueryUrl(_url?: string): string;
    static get(_url: any, params: any, paramDefaults: any, queryParams: any): any;
    static query(_url: any, params: any, paramDefaults: any, queryParams: any, transformResultBeforeMap: any): any;
    static wrap(objects: any): any;
    constructor(_url: any, paramDefaults: any, params: any, data?: {}, _creatableField?: any[], _modifiableField?: any[]);
    _params: any;
    _url: string;
    _baseUrl: string;
    _creatableField: any[];
    _modifiableField: any[];
    _paramDefaults: any;
    checkProperty(): any;
    /**
     * Validate values for update.
     *
     * @param array values
     *
     * @return string{} An object of validation errors.
     */
    checkUpdate(values?: {}): any;
    update(data: any, _url: any): any;
    updateLocal(data: any): any;
    /**
     * Get the required properties for creating a new resource.
     *
     * @return array
     */
    getRequired(): any;
    /**
     * Validate a new resource.
     *
     * @param array data
     *
     * @return string{} An object of validation errors.
     */
    checkNew(values?: {}): {
        _error: string;
    };
    save(): any;
    delete(): any;
    copy(data: any): void;
    data: any;
    /**
     * Refresh the resource.
     *
     */
    refresh(params: any): any;
    /**
     * Check whether an operation is available on the resource.
     *
     * @param string op
     *
     * @return bool
     */
    operationAvailable(op: any): any;
    /**
     * Check whether the resource has a link.
     *
     * @param rel
     *
     * @return bool
     */
    hasLink(rel: any): any;
    /**
     * Check whether the resource has an embedded.
     *
     * @param rel
     *
     * @return bool
     */
    hasEmbedded(rel: any): boolean;
    /**
     * Get a embedded for a given resource relation.
     *
     * @param string rel
     *
     * @return array
     */
    getEmbedded(rel: any): any;
    /**
     * Get a link for a given resource relation.
     *
     * @param string rel
     * @param bool absolute
     *
     * @return string
     */
    getLink(rel: any, absolute?: boolean): any;
    /**
     * Get the resource's URI.
     *
     * @param bool absolute
     *
     * @return string
     */
    getUri(absolute?: boolean): any;
    /**
     * Make a URL absolute, based on the base URL.
     *
     * @param string relativeUrl
     * @param string _baseUrl
     *
     * @return string
     */
    makeAbsoluteUrl(relativeUrl: any, _baseUrl?: string): string;
    /**
     * Execute an operation on the resource.
     *
     * @param string op
     * @param string method
     * @param array  body
     *
     * @return array
     */
    runOperation(op: any, method: string, body: any): any;
    /**
     * Run a long-running operation.
     *
     * @param string op
     * @param string method
     * @param array  body
     *
     * @return Activity
     */
    runLongOperation(op: any, method: string, body: any): any;
    hasPermission(permission: any): boolean;
}
