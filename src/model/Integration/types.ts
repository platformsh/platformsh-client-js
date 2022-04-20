import {components} from '../../types/model';

export interface IntegrationGetParams {
    projectId: string;
    id: string;
    [key: string]: any;
  };
  
export interface IntegrationQueryParams {
    projectId: string;
    [key: string]: any;
};

export type IntegrationType = components["schemas"]["Integration"];
