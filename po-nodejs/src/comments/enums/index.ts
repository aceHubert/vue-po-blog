import { registerEnumType } from '@nestjs/graphql';
import { CommentType } from './comment-type.enum';

registerEnumType(CommentType, {
  name: 'COMMENT_TYPE',
  description: 'comment type',
});

export { CommentType };
