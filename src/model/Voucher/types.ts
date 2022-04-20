import {components} from '../../types/model';

export interface VoucherGetParams {
    uuid: string;
    [key: string]: any;
  };
  
export interface VoucherQueryParams {
    [key: string]: any;
};
  
export type VouchersType = components['schemas']['Vouchers'];