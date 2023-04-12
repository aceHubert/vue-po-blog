import { Field, ArgsType, ID } from '@nestjs/graphql';
import { PagedArgs } from '@/common/resolvers/dto/paged.args';
import { PostStatus } from '../enums';

/**
 * 文章分页查询参数
 */
@ArgsType()
export class PagedPostArgs extends PagedArgs {
  @Field({ nullable: true, description: 'Search keyword (fuzzy searching from title)' })
  keyword?: string;

  @Field({ nullable: true, description: 'Author id' })
  author?: number;

  @Field((type) => PostStatus, {
    nullable: true,
    description: 'Post status (search for all not "trash" status posts if none value is provided)',
  })
  status?: PostStatus;

  @Field((type) => ID, {
    nullable: true,
    description: 'Category id (termId, categoryId and tagId can not be in the condition at the same time)',
  })
  categoryId?: number;

  @Field({
    nullable: true,
    description: 'Category name (categoryId and categoryName can not be in the condition at the same time)',
  })
  categoryName?: string;

  @Field((type) => ID, {
    nullable: true,
    description:
      'Tag id (termId, categoryId and tagId can not be in the condition at the same time. if so, categoryId will be the priority)',
  })
  tagId?: number;

  @Field({ nullable: true, description: 'Tag name (tagId and tagName can not be in the condition at the same time)' })
  tagName?: string;

  @Field({ nullable: true, description: 'Date (format: yyyy(year)、yyyyMM(month)、yyyyMMdd(day)' })
  date?: string;
}
