import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { isUndefined } from 'lodash';
import { ValidationError } from '@/common/utils/gql-errors.utils';
import { PostStatus, PostType, PostCommentStatus } from '@/common/helpers/enums';
import { UserCapability } from '@/common/helpers/user-capability';
import { OptionKeys } from '@/common/helpers/option-keys';
import { PostMetaKeys } from '@/common/helpers/post-meta-keys';
import { MetaDataSource } from './meta.datasource';

// Types
import { Transaction, WhereOptions, Includeable } from 'sequelize';
import { PostAttributes, PostCreationAttributes, PostOperateStatus, PostOperateType } from '@/orm-entities/interfaces';
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
   * 是否有修改权限，没有则会直接抛出异常
   * @param post Post
   * @param requestUser 登录用户
   */
  private async hasEditCapability(post: PostAttributes, requestUser: JwtPayload) {
    // 是否有编辑权限
    await this.hasCapability(
      post.type === PostType.Post ? UserCapability.EditPosts : UserCapability.EditPages,
      requestUser,
    );

    // 是否有编辑已发布的文章的权限
    if (post.status === PostStatus.Publish) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.EditPublishedPosts : UserCapability.EditPublishedPages,
        requestUser,
      );
    }

    // 是否有编辑别人文章的权限
    if (post.author !== requestUser.id) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.EditOthersPosts : UserCapability.EditOthersPages,
        requestUser,
      );

      // 是否有编辑私有的文章权限
      if (post.status === PostStatus.Private) {
        await this.hasCapability(
          post.type === PostType.Post ? UserCapability.EditPrivatePosts : UserCapability.EditPrivatePages,
          requestUser,
        );
      }
    }
  }

  /**
   * 是否有删除权限，没有则会直接抛出异常
   * @param post Post
   * @param requestUser 登录用户
   */
  private async hasDeleteCapability(post: PostAttributes, requestUser: JwtPayload) {
    // 是否有删除文章的权限
    await this.hasCapability(
      post.type === PostType.Post ? UserCapability.DeletePosts : UserCapability.DeletePages,
      requestUser,
    );

    // 是否有删除已发布的文章的权限
    if (post.status === PostStatus.Publish) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.DeletePublishedPosts : UserCapability.DeletePublishedPages,
        requestUser,
      );
    }

    // 是否有删除别人文章的权限
    if (post.author !== requestUser.id) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.DeleteOthersPosts : UserCapability.DeleteOthersPages,
        requestUser,
      );

      // 是否有删除私有的文章权限
      if (post.status === PostStatus.Private) {
        await this.hasCapability(
          post.type === PostType.Post ? UserCapability.DeletePrivatePosts : UserCapability.DeletePrivatePages,
          requestUser,
        );
      }
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
          metaKey: PostMetaKeys.TrashMetaStatus,
          metaValue: prevStatus,
        },
        {
          postId,
          metaKey: PostMetaKeys.TrashMetaTime,
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
        [],
        posts.map((post) => [
          {
            postId: post.id,
            metaKey: PostMetaKeys.TrashMetaStatus,
            metaValue: post.status,
          },
          {
            postId: post.id,
            metaKey: PostMetaKeys.TrashMetaTime,
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
        metaKey: [PostMetaKeys.TrashMetaStatus, PostMetaKeys.TrashMetaTime],
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
  async get(id: number, type: PostType, fields: string[], requestUser?: JwtPayload): Promise<PostModel | null> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    const where: WhereOptions = {
      id,
      type,
    };

    // 匿名用户只能查询 published 的内容
    if (!requestUser) {
      where['status'] = PostStatus.Publish;
    } else {
      let hasEditPrivateCapability = false;
      await this.hasCapability(UserCapability.EditPrivatePosts, requestUser, (result) => {
        hasEditPrivateCapability = result;
      });

      if (
        !hasEditPrivateCapability &&
        (await this.models.Posts.count({
          where: {
            ...where,
            status: PostStatus.Private,
            author: {
              [this.Op.ne]: requestUser.id,
            },
          },
        })) > 0
      ) {
        throw new ValidationError(`No permissions to edit this ${type === PostType.Post ? 'post' : 'page'}!`);
      }
    }

    return this.models.Posts.findOne({
      attributes: this.filterFields(fields, this.models.Posts),
      where: { ...where },
    }).then((post) => post?.toJSON() as PostModel);
  }

  /**
   * 查询分页文章/页面列表
   * 没有状态条件时，返回的结果不包含 Trash 状态
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access [Authorized?]
   * @param param 分页查询参数
   * @param type 类型
   * @param fields 返回字段
   */
  async getPaged(
    query: PagedPostArgs,
    type: PostType.Post,
    fields: string[],
    requestUser?: JwtPayload,
  ): Promise<PagedPostModel>;
  async getPaged(
    query: PagedPageArgs,
    type: PostType.Page,
    fields: string[],
    requestUser?: JwtPayload,
  ): Promise<PagedPostModel>;
  async getPaged(
    { offset, limit, ...query }: PagedPostArgs | PagedPageArgs,
    type: PostType,
    fields: string[],
    requestUser?: JwtPayload,
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

    // 匿名用户只返回 published 的文章
    if (!requestUser) {
      where['status'] = PostStatus.Publish;
    } else {
      let hasEditPrivateCapability = false;
      await this.hasCapability(UserCapability.EditPrivatePosts, requestUser, (result) => {
        hasEditPrivateCapability = result;
      });

      if (query.status) {
        // 如果查询私有状态，但没有权限。直接返回
        if (query.status === PostStatus.Private && !hasEditPrivateCapability) {
          return Promise.resolve({ rows: [], total: 0 });
        } else {
          where['status'] = {
            [this.Op.eq]: query.status,
          };
        }
      } else {
        // All 时排除 操作状态下的所有状态和 trash 状态
        where['status'] = {
          [this.Op.notIn]: [...Object.values(PostOperateStatus), PostStatus.Trash],
        };

        // 如果没有编辑私有文章权限，则不返回非自己的私有文章
        if (!hasEditPrivateCapability) {
          // @ts-ignore
          where[this.Op.not] = {
            status: PostStatus.Private,
            author: {
              [this.Op.ne]: requestUser.id,
            },
          };
        }
      }
    }

    const include: Includeable[] = [];
    if (type === PostType.Post && (query as PagedPostArgs).categoryIds?.length) {
      include.push({
        model: this.models.TermRelationships,
        attributes: ['taxonomyId'],
        where: {
          taxonomyId: (query as PagedPostArgs).categoryIds,
        },
      });
    }

    return this.models.Posts.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Posts),
      include,
      where: { ...where },
      offset,
      limit,
      order: [['order', 'ASC']],
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
   * @access Authorized
   * @param type 类型
   */
  async getCountByStatus(type: PostType, requestUser: JwtPayload) {
    const where: WhereOptions = {
      type,
    };

    let hasEditPrivateCapability = false;
    await this.hasCapability(UserCapability.EditPrivatePosts, requestUser, (result) => {
      hasEditPrivateCapability = result;
    });

    // 不包含所有的操作时的状态
    where['status'] = {
      [this.Op.notIn]: [...Object.values(PostOperateStatus), PostStatus.Trash],
    };

    // 如果没有编辑私有文章权限，则不返回非自己的私有文章
    if (!hasEditPrivateCapability) {
      // @ts-ignore
      where[this.Op.not] = {
        status: PostStatus.Private,
        author: {
          [this.Op.ne]: requestUser.id,
        },
      };
    }

    return this.models.Posts.count({
      attributes: ['status'],
      where: { ...where },
      group: 'status',
    });
  }

  /**
   * 获取我的数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @param type
   * @param requestUser
   * @returns
   */
  getCountBySelf(type: PostType, requestUser: JwtPayload) {
    return this.models.Posts.count({
      where: {
        type,
        author: requestUser.id,
      },
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
   * @access capabilities: [CreatePosts/CreatePages]
   * @param model 添加实体模型
   * @param type 类型
   */
  async create(model: NewPostInput | NewPageInput, type: PostType, requestUser: JwtPayload): Promise<PostModel> {
    await this.hasCapability(
      type === PostType.Post ? UserCapability.CreatePosts : UserCapability.CreatePages,
      requestUser,
    );

    const { name, title, metas, ...rest } = model;
    const creationModel: Omit<PostCreationAttributes, 'updatedAt' | 'createdAt'> = {
      ...rest,
      title,
      name: await this.fixName(name || title),
      author: requestUser.id,
      type,
      status: PostOperateStatus.AutoDraft, // 默认为 auto draft
    };

    const defaultCommentStatus = await this.getOption<PostCommentStatus>(OptionKeys.DefaultCommentStatus);

    if (type === PostType.Post) {
      creationModel.commentStatus = defaultCommentStatus;
    } else if (type === PostType.Page) {
      const pageComments = await this.getOption<'off' | 'on'>(OptionKeys.PageComments);
      // 如果 PageComments 开启，则状态根据 Option.DefaultCommentStatus 状态
      if (pageComments === 'on') {
        creationModel.commentStatus = defaultCommentStatus;
      } else {
        creationModel.commentStatus = PostCommentStatus.Disabled;
      }
    }

    const t = await this.sequelize.transaction();
    try {
      const post = await this.models.Posts.create(creationModel, { transaction: t });

      if (metas && metas.length) {
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
   * id 可是副本 post id(将会修改复本和原始值)
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPosts/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id/副本 post id
   * @param model 修改实体模型
   */
  async update(id: number, model: UpdatePostInput | UpdatePageInput, requestUser: JwtPayload): Promise<boolean> {
    let post = await this.models.Posts.findByPk(id);
    if (post && post.parent) {
      post = await this.models.Posts.findByPk(post.parent);
    }
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      // 修改到 Trash 状态同删除权限一致
      if (model.status === PostStatus.Trash) {
        await this.hasDeleteCapability(post, requestUser);
      }

      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态，并删除记录等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError('Cound not update from "trush" status, use "restore" function to update status!');
      }

      const t = await this.sequelize.transaction();
      try {
        // 移到 Trash 之前记录状态
        if (model.status === PostStatus.Trash) {
          await this.storeTrashStatus(id, post.status, t);
        }

        await this.models.Posts.update(model, {
          where: { id },
          transaction: t,
        });

        // 记录每一次的修改（undefined 是不会产生修改记录，需要区分 null 和 空）
        if (
          (!isUndefined(model.title) && model.title !== post.title) ||
          (!isUndefined(model.content) && model.content !== post.content) ||
          (post.type === PostType.Post &&
            !isUndefined((model as UpdatePostInput).excerpt) &&
            (model as UpdatePostInput).excerpt !== post.excerpt)
        ) {
          await this.models.Posts.create(
            {
              title: !isUndefined(model.title) ? model.title : post.title,
              content: !isUndefined(model.content) ? model.content : post.content,
              excerpt:
                post.type === PostType.Post && !isUndefined((model as UpdatePostInput).excerpt)
                  ? (model as UpdatePostInput).excerpt
                  : post.excerpt,
              author: requestUser.id,
              name: `${id}-revision`,
              type: PostOperateType.Revision,
              status: PostOperateStatus.Inherit,
              parent: id,
              commentStatus: post.commentStatus,
              commentCount: post.commentCount,
            },
            { transaction: t },
          );
        }

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

      // 修改到 Trash 状态同删除权限一致
      if (status === PostStatus.Trash) {
        await this.hasDeleteCapability(post, requestUser);
      }

      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError('Cound not update from "trush" status, use "restore" function to update status!');
      }

      // 状态相同，无需修改
      if (post.status === status) {
        return true;
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
        throw err;
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
  async blukUpdateStatus(ids: number[], status: PostStatus, requestUser: JwtPayload): Promise<boolean> {
    await Promise.all(
      ids.map(async (id) => {
        const post = await this.models.Posts.findByPk(id);
        if (post) {
          // 是否有编辑权限
          await this.hasEditCapability(post, requestUser);

          // 修改到 Trash 状态同删除权限一致
          if (status === PostStatus.Trash) {
            await this.hasDeleteCapability(post, requestUser);
          }
        }
      }),
    );

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
  async blukRestore(ids: number[]): Promise<true> {
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
   * id 可是副本 post id(将会修改复本和原始值)
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [EditPots/EditPages, EditOthersPosts/EditOthersPages, EditPublishedPosts/EditPublishedPages, EditPrivatePosts/EditPrivatePages]
   * @param id Post id/副本 post id
   * @param status 状态
   */
  async updateCommentStatus(id: number, commentStatus: PostCommentStatus, requestUser: JwtPayload): Promise<boolean> {
    let post = await this.models.Posts.findByPk(id);
    if (post && post.parent) {
      post = await this.models.Posts.findByPk(post.parent);
    }
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      post.commentStatus = commentStatus;
      await post.save();

      // 修改副本状态
      if (post.id !== id) {
        this.models.Posts.update(
          { commentStatus },
          {
            where: { id },
          },
        );
      }
      return true;
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
      await this.hasDeleteCapability(post, requestUser);

      // 非 trash 状态下不可以删除
      if (post.status !== PostStatus.Trash) {
        throw new ValidationError('Could not delete the status is not in "trash" status!');
      }

      const t = await this.sequelize.transaction();

      try {
        // 删除相关信息
        await this.models.PostMeta.destroy({
          where: {
            postId: post.id,
          },
          transaction: t,
        });

        await this.models.TermRelationships.destroy({
          where: {
            objectId: post.id,
          },
          transaction: t,
        });

        await post.destroy({ transaction: t });

        await t.commit();
        return true;
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }
    return false;
  }

  async blukDelete(ids: number[], requestUser: JwtPayload): Promise<boolean> {
    await Promise.all(
      ids.map(async (id) => {
        const post = await this.models.Posts.findByPk(id);
        if (post) {
          // 是否有删除文章的权限
          await this.hasDeleteCapability(post, requestUser);
        }
      }),
    );

    // 非 trash 状态下不可以删除
    const noneTrushedIds = await this.models.Posts.findAll({
      attributes: ['id'],
      where: {
        id: ids,
        status: {
          [this.Op.ne]: PostStatus.Trash,
        },
      },
    });
    if (noneTrushedIds.length > 0) {
      throw new ValidationError(
        `Could not delete the status is not in "trash" status, ids: ${noneTrushedIds
          .map((item) => item.id)
          .join(',')}!`,
      );
    }

    const t = await this.sequelize.transaction();

    try {
      // 删除相关信息
      await this.models.PostMeta.destroy({
        where: {
          postId: ids,
        },
        transaction: t,
      });

      await this.models.TermRelationships.destroy({
        where: {
          objectId: ids,
        },
        transaction: t,
      });

      await this.models.Posts.destroy({
        where: {
          id: ids,
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
