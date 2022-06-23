import {components} from '../../types/model';

export interface EnvironmentBackupsGetParams {
    projectId: string;
    environmentId: string;
    id: string;
    [key: string]: any;
};
  
export interface EnvironmentBackupsQueryParams {
    projectId: string;
    environmentId: string;
    [key: string]: any;
};

export type BackupType = components['schemas']['Backup'];