import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { MetaDataSource } from './meta.datasource';

// Types
import { PagedCommentArgs } from '@/comments/dto/paged-comment.args';
import { NewCommentInput } from '@/comments/dto/new-comment.input';
import { NewCommentMetaInput } from '@/comments/dto/new-comment-meta.input';
import { UpdateCommentInput } from '@/comments/dto/update-comment.input';
import { PagedComment } from '@/comments/models/comment.model';
import { CommentCreationAttributes, CommentMetaCreationAttributes } from '@/orm-entities/interfaces';
import Comment from '@/sequelize-entities/entities/comments.entity';
import CommentMeta from '@/sequelize-entities/entities/comment-meta.entity';

@Injectable()
export class CommentDataSource extends MetaDataSource<CommentMeta, NewCommentMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

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
    { offset, limit, ...query }: PagedCommentArgs | Omit<PagedCommentArgs, 'postId'>,
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
  async create(model: NewCommentInput): Promise<Comment> {
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
  update(id: number, model: UpdateCommentInput): Promise<boolean> {
    return this.models.Comments.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }
}
