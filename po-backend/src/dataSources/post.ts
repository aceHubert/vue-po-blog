import { PostCommentStatus, PostStatus, PostType } from '@/model/enums';
import { MetaDataSource } from './meta';

// Types
import Post, { PagedPostQueryArgs, PagedPost, PostAddModel, PostUpdateModel, PostMetaAddModel } from '@/model/post';
import { PagedPageQueryArgs, PageAddModel, PageUpdateModel } from '@/model/page';
import { PostCreationAttributes } from './entities/posts';
import PostMeta, { PostMetaCreationAttributes } from './entities/postMeta';

export default class PostDataSource extends MetaDataSource<PostMeta, PostMetaAddModel> {
  /**
   * 获取文章/页面
   * @param id Post Id
   * @param type 类型
   * @param fields 返回字段
   */
  get(id: number, type: PostType, fields: string[]): Promise<Post | null> {
    return this.models.Posts.findOne({
      attributes: this.filterFields(fields, this.models.Posts),
      where: {
        id,
        type,
      },
    });
  }

  /**
   * 查询分页文章/页面列表
   * @param param 分页查询参数
   * @param type 类型
   * @param fields 返回字段
   */
  getPaged(
    { offset, limit, ...query }: PagedPostQueryArgs | PagedPageQueryArgs,
    type: PostType,
    fields: string[],
  ): Promise<PagedPost> {
    return this.models.Posts.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Posts),
      where: {
        ...query,
        type,
      },
      offset,
      limit,
      order: [['created_at', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows,
      total,
    }));
  }

  /**
   * 修正唯一名称，在末尾添加数字
   * @param name 唯一名称，用于URL地址
   */
  private async fixName(name: string) {
    name = escape(name);
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
   * 添加文章/页面
   * @param model 添加实体模型
   * @param type 类型
   */
  async create(model: PostAddModel | PageAddModel, type: PostType): Promise<Post> {
    const { name, title, metas, ...rest } = model;
    const creationModel: PostCreationAttributes = {
      ...rest,
      title,
      name: await this.fixName(name || title),
      author: 1, // todo: 登录的用户
      type,
    };

    if (type === PostType.Post) {
      // todo: 截取摘要
      creationModel.excerpt = '123456';
    } else {
      creationModel.commentStatus = PostCommentStatus.Disabled;
    }
    const post = await this.models.Posts.create(creationModel);

    if (metas && metas.length) {
      const metaCreationModels: PostMetaCreationAttributes[] = metas.map((meta) => {
        return {
          ...meta,
          postId: post.id,
        };
      });
      this.models.PostMeta.bulkCreate(metaCreationModels);
    }
    return post;
  }

  /**
   * 修改文章
   * @param id Post Id
   * @param model 修改实体模型
   */
  update(id: number, model: PostUpdateModel | PageUpdateModel): Promise<boolean> {
    return this.models.Posts.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }

  /**
   * 修改唯一标识（如重复的话，会经过修正，在成功时返回修正后的值，否则返回 false）
   * @param id Post Id
   * @param name 唯一标识
   */
  async updateName(id: number, name: string): Promise<string | false> {
    const fixedName = await this.fixName(name);

    const [count] = await this.models.Posts.update(
      {
        name: fixedName,
      },
      {
        where: {
          id,
        },
      },
    );
    return count > 0 ? fixedName : false;
  }

  /**
   * 修改状态
   * @param id Post Id
   * @param status 状态
   */
  updateStatus(id: number, status: PostStatus): Promise<boolean> {
    return this.models.Posts.update(
      { status },
      {
        where: { id },
      },
    ).then(([count]) => count > 0);
  }

  /**
   * 根据 Id 删除
   * @param id Post Id
   */
  delete(id: number): Promise<boolean> {
    return this.models.Posts.destroy({
      where: { id },
    }).then((count) => count > 0);
  }
}
