import {components} from '../../types/model'

export type ProfileType = components['schemas']['Profile']

export interface AccountsProfileGetParams {
  id: string,
  [index: string]: any
};
