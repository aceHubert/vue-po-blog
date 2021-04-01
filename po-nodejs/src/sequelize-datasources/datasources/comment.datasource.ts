import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { MetaDataSource } from './meta.datasource';

// Types
import {
  CommentModel,
  CommentMetaModel,
  PagedCommentArgs,
  PagedCommentModel,
  NewCommentInput,
  NewCommentMetaInput,
  UpdateCommentInput,
} from '../interfaces/comment.interface';

@Injectable()
export class CommentDataSource extends MetaDataSource<CommentMetaModel, NewCommentMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 获取评论
   * @param id 评论 Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<CommentModel | null> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    return this.models.Comments.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Comments),
    }).then((comment) => comment?.toJSON() as CommentModel);
  }

  /**
   * 获取评论分页列表
   * @param query 分页 Query 参数
   * @param fields 返回的字段
   */
  getPaged({ offset, limit, ...query }: PagedCommentArgs, fields: string[]): Promise<PagedCommentModel> {
    return this.models.Comments.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Comments),
      where: {
        ...query,
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows: rows as PagedCommentModel['rows'],
      total,
    }));
  }

  /**
   * 添加评论
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: NewCommentInput): Promise<CommentModel> {
    const { metas, ...rest } = model;

    const t = await this.sequelize.transaction();
    try {
      const comment = await this.models.Comments.create(rest, { transaction: t });

      if (metas && metas.length) {
        this.models.CommentMeta.bulkCreate(
          metas.map((meta) => {
            return {
              ...meta,
              commentId: comment.id,
            };
          }),
          { transaction: t },
        );
      }

      await t.commit();

      return comment.toJSON() as CommentModel;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 修改评论
   * @param id Link Id
   * @param model 修改实体模型
   */
  update(id: number, model: UpdateCommentInput): Promise<boolean> {
    return this.models.Comments.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }

  /**
   * 删除评论
   * @param id comment id
   */
  async delete(id: number): Promise<true> {
    const t = await this.sequelize.transaction();
    try {
      await this.models.CommentMeta.destroy({
        where: {
          commentId: id,
        },
        transaction: t,
      });

      await this.models.Comments.destroy({
        where: {
          id,
        },
        transaction: t,
      });

      await t.commit();

      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
