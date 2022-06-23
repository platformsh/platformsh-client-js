import {components} from '../../types/model';
import { APIObject } from '../Ressource';
import Ticket from './Ticket';

export interface TicketQueryParams {
    [key: string]: any;
  };
  
export interface Attachment {
    filename: string,
    uri: string,
    content_type: string
};

export type TicketResponse = {
    data: {
        count: number,
        tickets: Array<Ticket>
    }
} & APIObject;
  
export interface AttachmentsResponse {
    attachments: Array<Attachment>
};

export type TicketType = components['schemas']['Ticket'];