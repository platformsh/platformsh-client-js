import {components} from '../../types/model';

export interface APITokenGetParams {
    id?: string,
    [index: string]: any
};
  
export interface APITokenQueryParams {
    userId?: string,
    [index: string]: any
};

export type APITokenType = components['schemas']['APIToken'];