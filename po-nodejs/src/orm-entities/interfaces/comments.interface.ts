import { Optional } from './optional.interface';
import { CommentType } from '@/comments/enums';

export interface CommentAttributes {
  id: number;
  postId: number;
  author: string;
  authorEmail: string;
  authorUrl: string;
  authorIp: string;
  content: string;
  approved: boolean;
  edited: boolean;
  type: CommentType;
  agent: string;
  parentId: number;
  userId: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface CommentCreationAttributes
  extends Optional<
    CommentAttributes,
    'id' | 'authorEmail' | 'authorUrl' | 'authorIp' | 'approved' | 'edited' | 'type' | 'agent' | 'parentId' | 'userId'
  > {}
