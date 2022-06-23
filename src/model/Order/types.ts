import { APIObject } from "../Ressource";
import {components} from '../../types/model';

export interface OrdersGetParams {
    id: string;
    [key: string]: any;
  };
  
  export interface CommerceOrderResponse {
    commerce_order: Array<APIObject>
  };
  

export type OrderType = components['schemas']['Order'];