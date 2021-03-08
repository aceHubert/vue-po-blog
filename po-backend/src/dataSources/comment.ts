import { MetaDataSource } from './meta';

// Types
import Comment, {
  PagedCommentQueryArgs,
  PagedComment,
  CommentAddModel,
  CommentUpdateModel,
  CommentMetaAddModel,
} from '@/model/comment';
import { CommentCreationAttributes } from './entities/comments';
import CommentMeta, { CommentMetaCreationAttributes } from './entities/commentMeta';

export default class CommentDataSource extends MetaDataSource<CommentMeta, CommentMetaAddModel> {
  /**
   * 获取评论
   * @param id 评论 Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<Comment | null> {
    return this.models.Comments.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Comments),
    });
  }

  /**
   * 获取评论分页列表
   * @param query 分页 Query 参数
   * @param fields 返回的字段
   */
  getPaged(
    { offset, limit, ...query }: PagedCommentQueryArgs | Omit<PagedCommentQueryArgs, 'postId'>,
    fields: string[],
  ): Promise<PagedComment> {
    return this.models.Comments.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Comments),
      where: {
        ...query,
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows,
      total,
    }));
  }

  /**
   * 添加评论
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: CommentAddModel): Promise<Comment> {
    const { metas, ...rest } = model;
    const creationModel: CommentCreationAttributes = {
      ...rest,
    };

    const comment = await this.models.Comments.create(creationModel);

    if (metas && metas.length) {
      const metaCreationModels: CommentMetaCreationAttributes[] = metas.map((meta) => {
        return {
          ...meta,
          commentId: comment.id,
        };
      });
      this.models.CommentMeta.bulkCreate(metaCreationModels);
    }

    return comment;
  }

  /**
   * 修改链接
   * @param id Link Id
   * @param model 修改实体模型
   */
  update(id: number, model: CommentUpdateModel): Promise<boolean> {
    return this.models.Comments.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }
}
