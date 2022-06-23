import {components} from '../../types/model';

export interface SourceOperationQueryParams {
    projectId: string,
    environmentId: string,
    [key: string]: any;
};

export type SourceOperationType = components['schemas']['EnvironmentSourceOperation'];