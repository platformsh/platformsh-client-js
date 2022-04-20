import {components} from '../../types/model'

export interface OrganizationProfilGetParams {
    organizationId: string;
    [key: string]: any;
};

export type ProfileType = components['schemas']['Profile'];
