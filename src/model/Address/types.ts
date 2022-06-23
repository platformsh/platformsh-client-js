import {components} from '../../types/model';

export interface AddressParams {
    id: string,
    [index: string]: any
};

export type AddressType = components['schemas']['Address'];