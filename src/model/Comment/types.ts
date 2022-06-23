// import {components} from '../../types/model';
import { APIObject } from "../Ressource";
import Comment from "./Comment";

export interface CommentsResponse{
    data: {
      comments: Array<Comment>,
      count: number
    } & APIObject
};

// export type APITokenType = components['schemas']['Comment'];
