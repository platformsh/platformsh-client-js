import {components} from '../../types/model';

export interface AuthUserParams {
    id?: string,
    [index: string]: any
};

export type UserType = components['schemas']['User'];
