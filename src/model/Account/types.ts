import {components} from 'src/types/model'

export interface AccountGetParams {
    id?: string,
    [index: string]: any
  };

export type CurrentUserType = components['schemas']['CurrentUser'];
