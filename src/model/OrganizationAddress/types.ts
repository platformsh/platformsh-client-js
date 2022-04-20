import {components} from '../../types/model';

export interface OrganizationAddressGetParams {
    id?: string;
    organizationId: string;
    [key: string]: any;
};
  
export interface OrganizationAddressQueryParams {
    organizationId: string;
    [key: string]: any;
};
  

export type AddressType = components['schemas']['Address'];