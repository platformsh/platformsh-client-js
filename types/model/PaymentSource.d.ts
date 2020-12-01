export default class PaymentSource extends Ressource {
    static get(queryParams: {}, customUrl: any): any;
    static query(params: {}, customUrl: any): any;
    /**
     * Delete the payment source.
     *
     * @return Result
     */
    static delete(params: any): any;
    /**
     * Get allowed payment source.
     * The list of allowed payment sources for the current API consumer.
     *
     * @return PaymentSource allowd []
     */
    static getAllowed(): any;
    /**
     * Create a Setup Intent.
     *
     * @return SetupIntent
     */
    static intent(): any;
    /**
     * Format data according to the type of payment source
     *
     * @param paymentSource PaymentSource
     *
     * @return PaymentSource
     */
    static formatDetails(paymentSource: any): any;
    constructor(paymentSource: any);
    id: string;
    type: string;
    name: string;
    number: string;
    card: string;
    mandate: string;
}
import Ressource from "./Ressource";
