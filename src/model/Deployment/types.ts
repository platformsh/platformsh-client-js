import {components} from '../../types/model';

export interface DeploymentGetParams {
    projectId: string;
    environmentId: string;
    [key: string]: any;
};

export type DeploymentType = components['schemas']['Deployment'];
