import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@/common/utils/errors.utils';
import { PostOperateStatus } from '@/orm-entities/interfaces';
import { PostStatus, PostType, PostCommentStatus, UserRoleCapability } from '@/common/helpers/enums';
import { InitOptionKeys } from '@/common/helpers/init-option-keys';
import { MetaDataSource } from './meta.datasource';

// Types
import { Transaction, WhereOptions } from 'sequelize';
import {
  PostModel,
  PostMetaModel,
  PagedPostModel,
  PagedPostArgs,
  PagedPageArgs,
  NewPostInput,
  NewPageInput,
  NewPostMetaInput,
  UpdatePostInput,
  UpdatePageInput,
} from '../interfaces/post.interface';

@Injectable()
export class PostDataSource extends MetaDataSource<PostMetaModel, NewPostMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 修正唯一名称，在末尾添加数字
   * @param name 唯一名称，用于URL地址
   */
  private async fixName(name: string) {
    name = escape(name).trim();
    if (!name) return '';

    const count = await this.models.Posts.count({
      where: {
        name: {
          [this.Op.like]: `${name}%`,
        },
      },
    });

    if (count === 0) {
      return name;
    } else {
      return `${name}-${count}`;
    }
  }

  /**
   * 是否有修改权限，没有则会直接抛出异常(author, status is required)
   * @param post Post instance
   */
  private async hasEditCapability(post: PostModel, requestUser: JwtPayload) {
    // 是否有编辑权限
    await this.hasCapability(
      post.type === PostType.Post ? UserRoleCapability.EditPosts : UserRoleCapability.EditPages,
      requestUser,
    );

    // 是否有编辑别人文章的权限
    if (post.author !== requestUser.id) {
      await this.hasCapability(
        post.type === PostType.Post ? UserRoleCapability.EditOthersPosts : UserRoleCapability.EditOthersPages,
        requestUser,
      );
    }

    // 是否有编辑已发布的文章的权限
    if (post.status === PostStatus.Publish) {
      await this.hasCapability(
        post.type === PostType.Post ? UserRoleCapability.EditPublishedPosts : UserRoleCapability.EditPublishedPages,
        requestUser,
      );
    }

    // 是否有编辑私有的文章权限
    if (post.status === PostStatus.Private) {
      await this.hasCapability(
        post.type === PostType.Post ? UserRoleCapability.EditPrivatePosts : UserRoleCapability.EditPrivatePages,
        requestUser,
      );
    }
  }

  /**
   * 记录修改为 Trash 状态之前的状态
   * @param postId Post id
   * @param prevStatus 之前的状态
   */
  private async storeTrashStatus(postId: number, prevStatus: PostStatus | PostOperateStatus, t?: Transaction) {
    return await this.models.PostMeta.bulkCreate(
      [
        {
          postId,
          metaKey: 'trash_meta_status',
          metaValue: prevStatus,
        },
        {
          postId,
          metaKey: 'trash_meta_time',
          metaValue: String(Date.now()),
        },
      ],
      {
        updateOnDuplicate: ['postId', 'metaKey'], // mssql not support
        transaction: t,
      },
    );
  }

  /**
   * 批量记录修改为 Trash 状态之前的状态
   * @param postIds Post ids
   */
  private async blukStoreTrashStatus(postIds: number[], t?: Transaction) {
    const posts = await this.models.Posts.findAll({
      attributes: ['id', 'status'],
      where: {
        id: postIds,
      },
    });

    return await this.models.PostMeta.bulkCreate(
      Array.prototype.concat.apply(
        null,
        posts.map((post) => [
          {
            postId: post.id,
            metaKey: 'trash_meta_status',
            metaValue: post.status,
          },
          {
            postId: post.id,
            metaKey: 'trash_meta_time',
            metaValue: String(Date.now()),
          },
        ]),
      ),
      {
        updateOnDuplicate: ['postId', 'metaKey'], // mssql not support
        transaction: t,
      },
    );
  }

  /**
   * [批量]移除 trash 之前的状态
   * @param postId Post id
   */
  private async removeStorageTrashStatus(postId: number | number[], t?: Transaction) {
    return await this.models.PostMeta.destroy({
      where: {
        postId,
        metaKey: ['trash_meta_status', 'trash_meta_time'],
      },
      transaction: t,
    });
  }

  /**
   * 获取文章/页面
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param id Post id
   * @param type 类型
   * @param fields 返回字段
   */
  get(id: number, type: PostType, fields: string[]): Promise<PostModel | null> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    return this.models.Posts.findOne({
      attributes: this.filterFields(fields, this.models.Posts),
      where: {
        id,
        type,
      },
    }).then((post) => post?.toJSON() as PostModel);
  }

  /**
   * 查询分页文章/页面列表
   * 没有状态条件时，返回的结果不包含 Trash 状态
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param param 分页查询参数
   * @param type 类型
   * @param fields 返回字段
   */
  getPaged(query: PagedPostArgs, type: PostType.Post, fields: string[]): Promise<PagedPostModel>;
  getPaged(query: PagedPageArgs, type: PostType.Page, fields: string[]): Promise<PagedPostModel>;
  getPaged(
    { offset, limit, ...query }: PagedPostArgs | PagedPageArgs,
    type: PostType,
    fields: string[],
  ): Promise<PagedPostModel> {
    const where: WhereOptions = {
      type,
    };
    if (query.keyword) {
      where['title'] = {
        [this.Op.like]: `%${query.keyword}%`,
      };
    }
    if (query.author) {
      where['author'] = query.author;
    }
    if (query.status) {
      where['status'] = query.status;
    } else {
      // All 时排除 操作状态下的所有状态和 trash 状态
      where['status'] = {
        [this.Op.notIn]: [...Object.values(PostOperateStatus), PostStatus.Trash],
      };
    }

    if (query.date) {
      // @ts-ignore
      where[this.Op.and] = this.Sequelize.where(
        this.Sequelize.fn(
          'DATE_FORMAT',
          this.col('createdAt', this.models.Posts),
          query.date.length === 4 ? '%Y' : query.date.length === 6 ? '%Y%m' : '%Y%m%d',
        ),
        query.date,
      );
    }

    return this.models.Posts.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Posts),
      include:
        type === PostType.Post && (query as PagedPostArgs).categoryIds && (query as PagedPostArgs).categoryIds?.length
          ? {
              model: this.models.TermRelationships,
              attributes: ['taxonomyId'],
              where: {
                taxonomyId: (query as PagedPostArgs).categoryIds,
              },
            }
          : undefined,
      where: {
        ...where,
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows: rows as PagedPostModel['rows'],
      total,
    }));
  }

  /**
   * 根据状态分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param type 类型
   */
  getCountByStatus(type: PostType) {
    return this.models.Posts.count({
      attributes: ['status'],
      where: {
        type,
        status: {
          // 不包含所有的操作时的状态
          [this.Op.notIn]: Object.values(PostOperateStatus),
        },
      },
      group: 'status',
    });
  }

  /**
   * 按天分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param month 月份：yyyyMM
   * @param type 类型
   */
  getCountByDay(month: string, type: PostType) {
    return this.models.Posts.count({
      attributes: [[this.Sequelize.fn('DATE_FORMAT', this.col('createdAt', this.models.Posts), '%Y%m%d'), 'day']],
      where: {
        type,
        status: {
          // 不包含所有的操作时的状态
          [this.Op.notIn]: Object.values(PostOperateStatus),
        },
        [this.Op.and]: this.Sequelize.where(
          this.Sequelize.fn('DATE_FORMAT', this.col('createdAt', this.models.Posts), '%Y%m'),
          month,
        ),
      },
      group: 'day',
    });
  }

  /**
   * 按月分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param param year: 当前年的月份分组，months: 如果年没有值，则从当前时间向前推多少个月（默认12个月）
   * @param type 类型
   */
  getCountByMonth({ year, months }: { year?: string; months?: number }, type: PostType) {
    if (!year) {
      months = months || 12; // 默认向前推12个月
    }
    return this.models.Posts.count({
      attributes: [[this.Sequelize.fn('DATE_FORMAT', this.col('createdAt', this.models.Posts), '%Y%m'), 'month']],
      where: {
        type,
        status: {
          // 不包含所有的操作时的状态
          [this.Op.notIn]: Object.values(PostOperateStatus),
        },
        [this.Op.and]: year
          ? this.Sequelize.where(this.Sequelize.fn('DATE_FORMAT', this.col('createdAt', this.models.Posts), '%Y'), year)
          : this.Sequelize.where(
              this.Sequelize.fn(
                'TIMESTAMPDIFF',
                this.Sequelize.literal('MONTH'),
                this.col('createdAt', this.models.Posts),
                this.Sequelize.literal('CURRENT_TIMESTAMP'),
              ),
              { [this.Op.lte]: months },
            ),
      },
      group: 'month',
    });
  }

  /**
   * 按年分组获取数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access None
   * @param type 类型
   */
  getCountByYear(type: PostType) {
    return this.models.Posts.count({
      attributes: [[this.Sequelize.fn('DATE_FORMAT', this.col('createdAt', this.models.Posts), '%Y'), 'year']],
      where: {
        type,
        status: {
          // 不包含所有的操作时的状态
          [this.Op.notIn]: Object.values(PostOperateStatus),
        },
      },
      group: 'year',
    });
  }

  /**
   * 添加文章/页面
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [CreatePages]
   * @param model 添加实体模型
   * @param type 类型
   */
  async create(model: NewPostInput | NewPageInput, type: PostType, requestUser: JwtPayload): Promise<PostModel> {
    const { name, title, metas, ...rest } = model;
    const creationModel: NewPostInput = {
      ...rest,
      title,
      name: await this.fixName(name || title),
      author: requestUser.id,
      type,
      status: PostOperateStatus.AutoDraft, // 默认为 auto draft
    };

    const defaultCommentStatus = await this.getOption<PostCommentStatus>(InitOptionKeys.DefaultCommentStatus);

    if (type === PostType.Post) {
      creationModel.commentStatus = (model as NewPostInput).commentStatus || defaultCommentStatus;
    } else if (type === PostType.Page) {
      const pageComments = await this.getOption<'0' | '1'>(InitOptionKeys.PageComments);
      if (pageComments === '1') {
        creationModel.commentStatus = defaultCommentStatus;
      } else {
        creationModel.commentStatus = PostCommentStatus.Disabled;
      }
    }

    const t = await this.sequelize.transaction();
    try {
      const post = await this.models.Posts.create(creationModel, { transaction: t });

      if (metas && metas.length) {
        const falseOrMetaKeys = await this.isMetaExists(
          post.id,
          metas.map((meta) => meta.metaKey),
        );
        if (falseOrMetaKeys) {
          throw new ValidationError(`The meta keys (${falseOrMetaKeys.join(',')}) have existed!`);
        } else {
          this.models.PostMeta.bulkCreate(
            metas.map((meta) => {
              return {
                ...meta,
                postId: post.id,
              };
            }),
            { transaction: t },
          );
        }
      }

      await t.commit();

      // 返回将 auto draft 变更为draft
      return { ...post.toJSON(), status: PostStatus.Draft } as PostModel;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 修改文章
   * name 没有值的话，通过 title 生成
   * trash 状态下不可修改，先使用 restore 方法重置
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id
   * @param model 修改实体模型
   */
  async update(id: number, model: UpdatePostInput | UpdatePageInput, requestUser: JwtPayload): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态，并删除记录等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError('Cound not update from "trush" status, use "restore" function to update status!');
      }

      const t = await this.sequelize.transaction();
      try {
        // 移到 Trash 之前记录状态
        if (model.status === PostStatus.Trash) {
          await this.storeTrashStatus(post.id, post.status, t);
        }

        await this.models.Posts.update(model, {
          where: { id },
          transaction: t,
        });

        await t.commit();
        return true;
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }
    return false;
  }

  /**
   * 修改唯一标识（如重复的话，会经过修正，在成功时返回修正后的值，否则返回 false）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id
   * @param name 唯一标识
   */
  async updateName(id: number, name: string, requestUser: JwtPayload): Promise<string | false> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      const fixedName = await this.fixName(name);
      post.name = fixedName;
      await post.save();
      return fixedName;
    }
    return false;
  }

  /**
   * 修改状态
   * trash 状态下不可以修改，先通过restore方法重置
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id
   * @param status 状态
   */
  async updateStatus(id: number, status: PostStatus, requestUser: JwtPayload): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      // 状态相同，无需修改
      if (post.status === status) {
        return true;
      }

      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError('Cound not update from "trush" status, use "restore" function to update status!');
      }

      const t = await this.sequelize.transaction();
      try {
        // 移到 Trash 之前记录状态
        if (status === PostStatus.Trash) {
          await this.storeTrashStatus(post.id, post.status, t);
        }
        post.status = status;
        await post.save({
          transaction: t,
        });
        await t.commit();
        return true;
      } catch (err) {
        await t.rollback();
        throw false;
      }
    }
    return false;
  }

  /**
   * 批量修改状态
   * trash 状态下不可以修改
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized
   * @param ids Post ids
   * @param status 状态
   */
  async blukUpdateStatus(ids: number[], status: PostStatus): Promise<boolean> {
    // todo:  hasEditCapability

    // trash 状态下不可以修改，使用 restore 重置
    const trushedIds = await this.models.Posts.findAll({
      attributes: ['id'],
      where: {
        id: ids,
        status: PostStatus.Trash,
      },
    });
    if (trushedIds.length > 0) {
      throw new ValidationError(
        `Cound not update from "trush" status, use "restore" function to update status, ids: ${trushedIds
          .map((item) => item.id)
          .join(',')}!`,
      );
    }

    const t = await this.sequelize.transaction();
    try {
      // 移到 Trash 之前记录状态
      if (status === PostStatus.Trash) {
        await this.blukStoreTrashStatus(ids, t);
      }

      await this.models.Posts.update(
        {
          status,
        },
        {
          where: {
            id: ids,
          },
          transaction: t,
        },
      );

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 重置Trash到之前状态
   * 如果历史状态没有记录返回 false, 如果非 trash 状态抛出异常
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id
   */
  async restore(id: number, requestUser: JwtPayload): Promise<boolean> {
    const metaStatus = await this.models.PostMeta.findOne({
      attributes: ['metaValue'],
      where: {
        postId: id,
        metaKey: 'trash_meta_status',
      },
    });
    // 没有历史状态直接返回false
    if (metaStatus) {
      const post = await this.models.Posts.findByPk(id);
      if (post) {
        // 是否有编辑权限
        await this.hasEditCapability(post, requestUser);

        // 如果状态为非 Trash, 不被允许重置
        if (post.status !== PostStatus.Trash) {
          throw new ValidationError('Cound not restore from not "trush" status！');
        }

        const t = await this.sequelize.transaction();
        try {
          post.status = metaStatus.metaValue as PostStatus;
          await post.save({
            transaction: t,
          });

          await this.removeStorageTrashStatus(id, t);

          await t.commit();
          return true;
        } catch (err) {
          await t.rollback();
          throw err;
        }
      }
      return false;
    }
    return false;
  }

  /**
   * 批量重置
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized
   * @param ids Post ids
   */
  async blukRestore(ids: number[]): Promise<boolean> {
    // todo: hasEditCapability

    const t = await this.sequelize.transaction();
    try {
      const metas = await this.models.PostMeta.findAll({
        attributes: ['postId', 'metaValue'],
        where: { postId: ids, metaKey: 'trash_meta_status' },
      });

      await Promise.all(
        metas.map((meta) =>
          this.models.Posts.update(
            { status: meta.metaValue as PostStatus },
            {
              where: { id: meta.postId },
              transaction: t,
            },
          ),
        ),
      );

      await this.removeStorageTrashStatus(ids, t);

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 修改评论状态
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id
   * @param status 状态
   */
  async updateCommentStatus(id: number, commentStatus: PostCommentStatus, requestUser: JwtPayload): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      post.commentStatus = commentStatus;
      await post.save();
    }
    return false;
  }

  /**
   * 根据 Id 删除
   * 非 trash 状态下无法删除
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [DeletePots/DeletePages, DeleteOthersPosts/DeleteOthersPages, DeletePublishedPosts/DeletePublishedPages, DeletePrivatePosts/DeletePrivatePages]
   * @param id Post id
   */
  async delete(id: number, requestUser: JwtPayload): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有删除文章的权限
      await this.hasCapability(
        post.type === PostType.Post ? UserRoleCapability.DeletePosts : UserRoleCapability.DeletePages,
        requestUser,
      );

      // 是否有删除别人文章的权限
      if (post.author !== requestUser.id) {
        await this.hasCapability(
          post.type === PostType.Post ? UserRoleCapability.DeleteOthersPosts : UserRoleCapability.DeleteOthersPages,
          requestUser,
        );
      }

      // 是否有删除已发布的文章的权限
      if (post.status === PostStatus.Publish) {
        await this.hasCapability(
          post.type === PostType.Post
            ? UserRoleCapability.DeletePublishedPosts
            : UserRoleCapability.DeletePublishedPages,
          requestUser,
        );
      }

      // 是否有删除私有的文章权限
      if (post.status === PostStatus.Private) {
        await this.hasCapability(
          post.type === PostType.Post ? UserRoleCapability.DeletePrivatePosts : UserRoleCapability.DeletePrivatePages,
          requestUser,
        );
      }

      if (post.status !== PostStatus.Trash) {
        throw new ValidationError('Could not delete the status is not in "trash"');
      }

      const t = await this.sequelize.transaction();

      try {
        // 删除相关信息
        this.models.PostMeta.destroy({
          where: {
            postId: post.id,
          },
          transaction: t,
        });

        this.models.TermRelationships.destroy({
          where: {
            objectId: post.id,
          },
          transaction: t,
        });

        await post.destroy({ transaction: t });

        await t.commit();
        return true;
      } catch (err) {
        this.logger.error(`An error occurred during deleting post/page(id:${id}), Error: ${err.message}`);
        await t.rollback();
        return false;
      }
    }
    return false;
  }
}
