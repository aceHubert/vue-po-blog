import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { isUndefined } from 'lodash';
import { ValidationError } from '@/common/utils/errors.util';
import { TermTaxonomy } from '@/common/utils/term-taxonomy.util';
import { UserCapability } from '@/common/utils/user-capability.util';
import { OptionKeys } from '@/common/utils/option-keys.util';
import { PostMetaKeys } from '@/common/utils/post-meta-keys.util';
import { PostStatus, PostCommentStatus } from '@/posts/enums';
import { MetaDataSource } from './meta.datasource';

// Types
import { Transaction, WhereOptions, WhereValue, Includeable } from 'sequelize';
import {
  PostAttributes,
  PostCreationAttributes,
  PostType,
  PostOperateStatus,
  PostOperateType,
} from '@/orm-entities/interfaces';
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
          [this.Op.or]: {
            [this.Op.like]: `${name}-%`,
            [this.Op.eq]: name,
          },
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
  private async hasEditCapability(post: PostAttributes, requestUser: RequestUser) {
    // 是否有编辑权限
    await this.hasCapability(
      post.type === PostType.Post ? UserCapability.EditPosts : UserCapability.EditPages,
      requestUser,
      true,
    );

    // 是否有编辑已发布的文章的权限
    if (post.status === PostStatus.Publish) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.EditPublishedPosts : UserCapability.EditPublishedPages,
        requestUser,
        true,
      );
    }

    // 是否有编辑别人文章的权限
    if (post.author !== requestUser.id) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.EditOthersPosts : UserCapability.EditOthersPages,
        requestUser,
      );

      // 是否有编辑私有的(别人)文章权限
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
  private async hasDeleteCapability(post: PostAttributes, requestUser: RequestUser) {
    // 是否有删除文章的权限
    await this.hasCapability(
      post.type === PostType.Post ? UserCapability.DeletePosts : UserCapability.DeletePages,
      requestUser,
      true,
    );

    // 是否有删除已发布的文章的权限
    if (post.status === PostStatus.Publish) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.DeletePublishedPosts : UserCapability.DeletePublishedPages,
        requestUser,
        true,
      );
    }

    // 是否有删除别人文章的权限
    if (post.author !== requestUser.id) {
      await this.hasCapability(
        post.type === PostType.Post ? UserCapability.DeleteOthersPosts : UserCapability.DeleteOthersPages,
        requestUser,
        true,
      );

      // 是否有删除私有的文章权限
      if (post.status === PostStatus.Private) {
        await this.hasCapability(
          post.type === PostType.Post ? UserCapability.DeletePrivatePosts : UserCapability.DeletePrivatePages,
          requestUser,
          true,
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
  private async bulkStoreTrashStatus(postsOrPostIds: PostAttributes[] | number[], t?: Transaction) {
    const posts = (postsOrPostIds as any[]).every((postOrId) => typeof postOrId === 'number')
      ? await this.models.Posts.findAll({
          attributes: ['id', 'status'],
          where: {
            id: postsOrPostIds as number[],
          },
        })
      : (postsOrPostIds as PostAttributes[]);

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
  private async deleteStorageTrashStatus(postId: number | number[], t?: Transaction) {
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
   * @access Authorized?
   * @param id Post id
   * @param type 类型
   * @param fields 返回字段
   * @param requestUser 请求的用户
   */
  async get(id: number, type: PostType, fields: string[], requestUser?: RequestUser): Promise<PostModel | undefined> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    const where: WhereOptions<PostAttributes> = {
      id,
      type,
    };

    // 匿名用户只能查询 published 的内容
    if (!requestUser) {
      where['status'] = PostStatus.Publish;
      return this.models.Posts.findOne({
        attributes: this.filterFields(fields, this.models.Posts),
        where,
      }).then((post) => post?.toJSON() as PostModel);
    } else {
      const post = await this.models.Posts.findOne({
        where,
      });
      if (post) {
        // 是否有编辑权限
        await this.hasEditCapability(post, requestUser);

        return post.toJSON() as PostModel;
      }
      return;
    }
  }

  /**
   * 查询分页文章/页面列表
   * 匿名访问只返回 Publish 状态的结果
   * 没有状态条件时，结果不包含 Trash 状态的
   * 没有编辑私有权限的，结果不包含别人私有的
   * 没有发布权限的，结果不包含别人待发布的
   * 如果categoryId是默认分类（无分类），结果包含所有没有分类的
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized?
   * @param param 分页查询参数
   * @param type 类型
   * @param fields 返回字段
   * @param requestUser 请求的用户
   */
  async getPaged(
    query: PagedPostArgs,
    type: PostType.Post,
    fields: string[],
    requestUser?: RequestUser,
  ): Promise<PagedPostModel>;
  async getPaged(
    query: PagedPageArgs,
    type: PostType.Page,
    fields: string[],
    requestUser?: RequestUser,
  ): Promise<PagedPostModel>;
  async getPaged(
    { offset, limit, ...query }: PagedPostArgs | PagedPageArgs,
    type: PostType,
    fields: string[],
    requestUser?: RequestUser,
  ): Promise<PagedPostModel> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    const include: Includeable[] = [];
    const andWhere: WhereOptions<PostAttributes>[] | WhereValue<PostAttributes>[] = [];
    const where: WhereOptions<PostAttributes> = {
      type,
      [this.Op.and]: andWhere,
    };
    if (query.keyword) {
      andWhere.push({
        title: {
          [this.Op.like]: `%${query.keyword}%`,
        },
      });
    }
    if (query.author) {
      andWhere.push({
        author: query.author,
      });
    }

    if (query.date) {
      andWhere.push(
        this.Sequelize.where(
          this.Sequelize.fn(
            'DATE_FORMAT',
            this.col('createdAt', this.models.Posts),
            query.date.length === 4 ? '%Y' : query.date.length === 6 ? '%Y%m' : '%Y%m%d',
          ),
          query.date,
        ),
      );
    }

    // 匿名用户只返回 published 的文章
    if (!requestUser) {
      andWhere.push({
        status: PostStatus.Publish,
      });
    } else {
      const hasEditPrivateCapability = await this.hasCapability(
        type === PostType.Post ? UserCapability.EditPrivatePosts : UserCapability.EditPrivatePages,
        requestUser,
      );

      if (query.status) {
        // 如果查询私有状态，但没有权限。直接返回
        if (query.status === PostStatus.Private && !hasEditPrivateCapability) {
          return Promise.resolve({ rows: [], total: 0 });
        } else {
          andWhere.push({
            status: query.status,
          });
        }
      } else {
        // All 时排除 操作状态下的所有状态和 trash 状态
        andWhere.push({
          status: {
            [this.Op.notIn]: [...Object.values(PostOperateStatus), PostStatus.Trash],
          },
        });
      }

      // 如果没有编辑私有权限，则不返回非自己的私有的内容
      if (!hasEditPrivateCapability) {
        andWhere.push({
          [this.Op.not]: {
            status: PostStatus.Private,
            author: {
              [this.Op.ne]: requestUser.id,
            },
          },
        });
      }

      // 如果没有发布权限的，不返回待发布的内容
      const hasPublishCapability = await this.hasCapability(
        type === PostType.Post ? UserCapability.PublishPosts : UserCapability.PublishPosts,
        requestUser,
      );
      if (!hasPublishCapability) {
        andWhere.push({
          [this.Op.not]: {
            status: PostStatus.Pending,
            author: {
              [this.Op.ne]: requestUser.id,
            },
          },
        });
      }
    }

    if (type === PostType.Post) {
      const categoryId = (query as PagedPostArgs).categoryId;
      const categoryName = (query as PagedPostArgs).categoryName;
      const tagId = (query as PagedPostArgs).tagId;
      const tagName = (query as PagedPostArgs).tagName;
      if (categoryId || tagId) {
        include.push({
          model: this.models.TermRelationships,
          as: 'TermRelationships',
          include: [
            {
              model: this.models.TermTaxonomy,
              as: 'TermTaxonomy',
              duplicating: false,
            },
          ],
          duplicating: false,
        });
        /** 如果是默认分类（未分类）的话，包含所有没有分类的内容 */
        const defaultCategory = await this.getOption(OptionKeys.DefaultCategory);
        andWhere.push({
          [`$TermRelationships.TermTaxonomy.${this.field('termId', this.models.TermTaxonomy)}$`]: categoryId
            ? defaultCategory === String(categoryId)
              ? {
                  [this.Op.or]: [categoryId, { [this.Op.is]: null }],
                }
              : categoryId
            : tagId,
        });
      } else if (categoryName || tagName) {
        include.push({
          model: this.models.TermRelationships,
          as: 'TermRelationships',
          attributes: [],
          include: [
            {
              model: this.models.TermTaxonomy,
              as: 'TermTaxonomy',
              attributes: [],
              include: [
                {
                  model: this.models.Terms,
                  as: 'Terms',
                  attributes: [],
                  duplicating: false,
                },
              ],
              duplicating: false,
            },
          ],
          duplicating: false,
        });

        andWhere.push({
          [`$TermRelationships.TermTaxonomy.Terms.${this.field('name', this.models.Terms)}$`]: categoryName || tagName,
          [`$TermRelationships.TermTaxonomy.${this.field('taxonomy', this.models.TermTaxonomy)}$`]: categoryName
            ? TermTaxonomy.Category
            : TermTaxonomy.Tag,
        });
      }
    }

    return this.models.Posts.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Posts),
      include,
      where,
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
   * @param requestUser 请求的用户
   */
  async getCountByStatus(type: PostType, requestUser: RequestUser) {
    const andWhere: WhereOptions<PostAttributes>[] | WhereValue<PostAttributes>[] = [];
    const where: WhereOptions<PostAttributes> = {
      type,
      status: {
        // 不包含所有的操作时的状态
        [this.Op.notIn]: [...Object.values(PostOperateStatus)],
      },
      [this.Op.and]: andWhere,
    };

    // 如果没有编辑私有权限，则不返回非自己私有的内容
    const hasEditPrivateCapability = await this.hasCapability(
      type === PostType.Post ? UserCapability.EditPrivatePosts : UserCapability.EditPrivatePages,
      requestUser,
    );
    if (!hasEditPrivateCapability) {
      andWhere.push({
        [this.Op.not]: {
          status: PostStatus.Private,
          author: {
            [this.Op.ne]: requestUser.id,
          },
        },
      });
    }

    // 如果没有发布权限的，不返回待发布的内容
    const hasPublishCapability = await this.hasCapability(
      type === PostType.Post ? UserCapability.PublishPosts : UserCapability.PublishPages,
      requestUser,
    );
    if (!hasPublishCapability) {
      andWhere.push({
        [this.Op.not]: {
          status: PostStatus.Pending,
          author: {
            [this.Op.ne]: requestUser.id,
          },
        },
      });
    }

    return this.models.Posts.count({
      attributes: ['status'],
      where,
      group: 'status',
    });
  }

  /**
   * 获取我的数量
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access Authorized
   * @param type 类型
   * @param requestUser 请求的用户
   */
  getCountBySelf(type: PostType, requestUser: RequestUser) {
    return this.models.Posts.count({
      where: {
        type,
        status: {
          // 不包含所有的操作时的状态
          [this.Op.notIn]: [...Object.values(PostOperateStatus)],
        },
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
   * @access capabilities: [EditPosts/EditPages]
   * @param model 添加实体模型
   * @param type 类型
   * @param requestUser 请求的用户
   */
  async create(model: NewPostInput | NewPageInput, type: PostType, requestUser: RequestUser): Promise<PostModel> {
    await this.hasCapability(
      type === PostType.Post ? UserCapability.EditPosts : UserCapability.EditPages,
      requestUser,
      true,
    );

    const { name, title, metas, ...rest } = model;
    const creationModel: Omit<PostCreationAttributes, 'updatedAt' | 'createdAt'> = {
      ...rest,
      title,
      name: await this.fixName(name || title),
      author: requestUser.id,
      type,
      excerpt: type == PostType.Post ? (model as NewPostInput).excerpt : '',
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
   * trash 状态下不可修改(抛出 ValidationError)
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPosts/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages,
   *  DeletePosts/DeletePages(model.status=>Trash),
   *  DeleteOthersPosts/DeleteOthersPages(model.status=>Trash),
   *  DeletePublishedPosts/DeletePublishedPages(model.status=>Trash),
   *  DeletePrivatePosts/DeletePrivatePages(model.status=>Trash),
   *  PublishPosts/PublishPages
   * ]
   * @param id Post id/副本 post id
   * @param model 修改实体模型
   * @param requestUser 请求的用户
   */
  async update(id: number, model: UpdatePostInput | UpdatePageInput, requestUser: RequestUser): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态，并删除记录等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError(
          await this.i18nService.tv(
            'core.datasource.post.update_trash_forbidden',
            `Must not be in "trush" status, use "restore" function first!`,
            { lang: requestUser.lang },
          ),
        );
      }

      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      // 是否有发布的权限
      if (
        (model.status === PostStatus.Publish || model.status === PostStatus.Private) &&
        post.status !== model.status
      ) {
        await this.hasCapability(
          post.type === PostType.Post ? UserCapability.PublishPosts : UserCapability.PublishPages,
          requestUser,
          true,
        );
      }

      // 修改到 Trash 状态同删除权限一致
      if (model.status === PostStatus.Trash) {
        await this.hasDeleteCapability(post, requestUser);
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
        const title = !isUndefined(model.title) && model.title !== post.title ? model.title! : false;
        const content = !isUndefined(model.content) && model.content !== post.content ? model.content! : false;
        const excerpt =
          post.type === PostType.Post &&
          !isUndefined((model as UpdatePostInput).excerpt) &&
          (model as UpdatePostInput).excerpt !== post.excerpt
            ? (model as UpdatePostInput).excerpt!
            : false;
        if (title || content || excerpt) {
          await this.models.Posts.create(
            {
              title: title || post.title,
              content: content || post.content,
              excerpt: excerpt || post.excerpt,
              author: requestUser.id,
              name: `${id}-revision`,
              type: PostOperateType.Revision,
              status: PostOperateStatus.Inherit,
              parentId: id,
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
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages
   * ]
   * @param id Post id
   * @param name 唯一标识
   */
  async updateName(id: number, name: string, requestUser: RequestUser): Promise<string | false> {
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
   * 修改状态（如果post id 不在在返回 false）
   * trash 状态下不可以修改（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages,
   *  DeletePosts/DeletePages(status=>Trash),
   *  DeleteOthersPosts/DeleteOthersPages(status=>Trash),
   *  DeletePublishedPosts/DeletePublishedPages(status=>Trash),
   *  DeletePrivatePosts/DeletePrivatePages(status=>Trash),
   *  PublishPosts/PublishPages
   * ]
   * @param id Post id
   * @param status 状态
   */
  async updateStatus(id: number, status: PostStatus, requestUser: RequestUser): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 状态相同，忽略
      if (post.status === status) {
        return true;
      }

      // 如果状态为 Trash, 不被允许修改，先使用 restore 统一处理状态逻辑
      // 需要恢复到移入Trash前的状态等逻辑
      if (post.status === PostStatus.Trash) {
        throw new ValidationError(
          await this.i18nService.tv(
            'core.datasource.post.update_status_forbidden_in_trash_status',
            `Must not be in "trush" status, use "restore" function first!"`,
            { lang: requestUser.lang },
          ),
        );
      }

      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      // 是否有发布的权限
      if (status === PostStatus.Publish || status === PostStatus.Private) {
        await this.hasCapability(
          post.type === PostType.Post ? UserCapability.PublishPosts : UserCapability.PublishPages,
          requestUser,
          true,
        );
      }

      // 修改到 Trash 状态同删除权限一致
      if (status === PostStatus.Trash) {
        await this.hasDeleteCapability(post, requestUser);
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
   * 任意一条是 trash 状态下不可以修改（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages,
   *  DeletePosts/DeletePages(status=>Trash),
   *  DeleteOthersPosts/DeleteOthersPages(status=>Trash),
   *  DeletePublishedPosts/DeletePublishedPages(status=>Trash),
   *  DeletePrivatePosts/DeletePrivatePages(status=>Trash),
   *  PublishPosts/PublishPages
   * ]
   * @param ids Post ids
   * @param status 状态
   */
  async bulkUpdateStatus(ids: number[], status: PostStatus, requestUser: RequestUser): Promise<true> {
    const posts = await this.models.Posts.findAll({
      where: {
        id: ids,
      },
    });

    // trash 状态下不可以修改，使用 restore 重置
    const trushedIds = posts.filter((post) => post.status === PostStatus.Trash).map((post) => post.id);
    if (trushedIds.length > 0) {
      const ids = trushedIds.join(',');
      throw new ValidationError(
        await this.i18nService.tv(
          'core.datasource.post.bluk_update_status_forbidden_in_trash_status',
          `Id(s) "${ids}" must not be in "trush" status, use "restore" function first!`,
          {
            lang: requestUser.lang,
            args: { ids },
          },
        ),
      );
    }

    // 权限判断
    await Promise.all(
      posts.map(async (post) => {
        // 是否有编辑权限
        await this.hasEditCapability(post, requestUser);

        // 是否有发布的权限
        if (status === PostStatus.Publish) {
          await this.hasCapability(
            post.type === PostType.Post ? UserCapability.PublishPosts : UserCapability.PublishPages,
            requestUser,
            true,
          );
        }

        // 修改到 Trash 状态同删除权限一致
        if (status === PostStatus.Trash) {
          await this.hasDeleteCapability(post, requestUser);
        }
      }),
    );

    const t = await this.sequelize.transaction();
    try {
      // 移到 Trash 之前记录状态
      if (status === PostStatus.Trash) {
        await this.bulkStoreTrashStatus(posts, t);
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
   * 重置Trash到之前状态（如果历史状态没有记录或 post id 不在在返回 false）
   * 非 trash 状态不可重置（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages
   * ]
   * @param id Post id
   */
  async restore(id: number, requestUser: RequestUser): Promise<boolean> {
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
        // 如果状态为非 Trash, 不被允许重置
        if (post.status !== PostStatus.Trash) {
          throw new ValidationError(
            await this.i18nService.tv(
              'core.datasource.post.restore_forbidden_not_in_trash_status',
              `Must be in "trush" status!`,
              {
                lang: requestUser.lang,
              },
            ),
          );
        }

        // 是否有编辑权限
        await this.hasEditCapability(post, requestUser);

        const t = await this.sequelize.transaction();
        try {
          post.status = metaStatus.metaValue as PostStatus;
          await post.save({
            transaction: t,
          });

          await this.deleteStorageTrashStatus(id, t);

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
   * 任意一条是非 trash 状态不可重置（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages
   * ]
   * @param ids Post ids
   */
  async bulkRestore(ids: number[], requestUser: RequestUser): Promise<true> {
    const posts = await this.models.Posts.findAll({
      where: {
        id: ids,
      },
    });

    // 如果状态为非 Trash, 不被允许重置
    const notWithTrushedIds = posts.filter((post) => post.status !== PostStatus.Trash).map((post) => post.id);
    if (notWithTrushedIds.length > 0) {
      const ids = notWithTrushedIds.join(',');
      throw new ValidationError(
        await this.i18nService.tv(
          'core.datasource.post.bluk_restore_forbidden_not_in_trash_status',
          `Id(s) "${ids}" must be in "trush" status!`,
          {
            lang: requestUser.lang,
            args: { ids },
          },
        ),
      );
    }

    // 权限判断
    await Promise.all(
      posts.map(async (post) => {
        // 是否有编辑权限
        await this.hasEditCapability(post, requestUser);
      }),
    );

    const t = await this.sequelize.transaction();
    try {
      // 注：只修改了有保存回收站之前状态的，其它忽略
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

      await this.deleteStorageTrashStatus(ids, t);

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 修改评论状态（如果post id 不在在返回 false）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  EditPots/EditPages,
   *  EditOthersPosts/EditOthersPages,
   *  EditPublishedPosts/EditPublishedPages,
   *  EditPrivatePosts/EditPrivatePages
   * ]
   * @param id Post id/副本 post id
   * @param status 状态
   */
  async updateCommentStatus(id: number, commentStatus: PostCommentStatus, requestUser: RequestUser): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 是否有编辑权限
      await this.hasEditCapability(post, requestUser);

      post.commentStatus = commentStatus;
      await post.save();
      return true;
    }
    return false;
  }

  /**
   * 根据 Id 删除（如果post id 不在在返回 false）
   * 非 trash 状态下不可以删除（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  DeletePots/DeletePages,
   *  DeleteOthersPosts/DeleteOthersPages,
   *  DeletePublishedPosts/DeletePublishedPages,
   *  DeletePrivatePosts/DeletePrivatePages
   * ]
   * @param id Post id
   */
  async delete(id: number, requestUser: RequestUser): Promise<boolean> {
    const post = await this.models.Posts.findByPk(id);
    if (post) {
      // 非 trash 状态下不可以删除
      if (post.status !== PostStatus.Trash) {
        throw new ValidationError(
          await this.i18nService.tv(
            'core.datasource.post.delete_forbidden_not_in_trash_status',
            `Must be in "trash" status!`,
            {
              lang: requestUser.lang,
            },
          ),
        );
      }

      // 是否有删除文章的权限
      await this.hasDeleteCapability(post, requestUser);

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

  /**
   * 批量删除
   * 任意一条是非 trash 状态下不可以删除（抛出 ValidationError）
   * @author Hubert
   * @since 2020-10-01
   * @version 0.0.1
   * @access capabilities: [
   *  DeletePots/DeletePages,
   *  DeleteOthersPosts/DeleteOthersPages,
   *  DeletePublishedPosts/DeletePublishedPages,
   *  DeletePrivatePosts/DeletePrivatePages
   * ]
   * @param id Post id
   */
  async bulkDelete(ids: number[], requestUser: RequestUser): Promise<true> {
    const posts = await this.models.Posts.findAll({
      where: {
        id: ids,
      },
    });

    // 如果状态为非 Trash, 不被允许删除
    const notWithTrushedIds = posts.filter((post) => post.status !== PostStatus.Trash).map((post) => post.id);
    if (notWithTrushedIds.length > 0) {
      const ids = notWithTrushedIds.join(',');
      throw new ValidationError(
        await this.i18nService.tv(
          'core.datasource.post.bluk_delete_forbidden_not_in_trash_status',
          `Ids "${ids}" must be in "trash" status!`,
          {
            lang: requestUser.lang,
            args: { ids },
          },
        ),
      );
    }

    // 判断权限
    await Promise.all(
      posts.map(async (post) => {
        // 是否有删除文章的权限
        await this.hasDeleteCapability(post, requestUser);
      }),
    );

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
