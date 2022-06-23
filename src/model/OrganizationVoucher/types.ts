import {components} from '../../types/model';
import OrganizationVoucher from "./OrganizationVoucher";

export interface OrganizationVoucherGetParams {
    organizationId: string;
    [key: string]: any;
  };
  export interface OrganizationVoucherQueryParams {
    organizationId: string;
    [key: string]: any;
  };
  
  export interface VoucherResponse {
    vouchers: Array<OrganizationVoucher>
  };

export type VoucherType = components['schemas']['Vouchers'];