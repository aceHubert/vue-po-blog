import { registerEnumType } from '@nestjs/graphql';
import { PostStatus } from './post-status.enum';
import { PostCommentStatus } from './post-comment-status.enum';

registerEnumType(PostStatus, {
  name: 'POST_STATUS',
  description: 'post status',
});

registerEnumType(PostCommentStatus, {
  name: 'POST_COMMENT_STATUS',
  description: 'post comment status',
});

export { PostStatus, PostCommentStatus };
