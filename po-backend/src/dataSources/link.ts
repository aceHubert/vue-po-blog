import { SequelizeDataSource } from './sequelizeDataSource';

// Types
import Link, { PagedLinkQueryArgs, PagedLink, LinkAddModel, LinkUpdateModel } from '@/model/link';

export default class OptionDataSource extends SequelizeDataSource {
  get(id: number, fields: string[]): Promise<Link | null> {
    return this.models.Links.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Links),
    });
  }

  getPaged({ offset, limit, ...query }: PagedLinkQueryArgs, fields: string[]): Promise<PagedLink> {
    const { name, ...restQuery } = query;
    return this.models.Links.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Links),
      where: {
        ...(name
          ? {
              name: {
                [this.Op.like]: `%${name}%`,
              },
            }
          : null),
        ...restQuery,
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
   * 添加链接
   * @param model 添加实体模型
   */
  create(model: LinkAddModel): Promise<Link | null> {
    return this.models.Links.create(model);
  }

  /**
   * 修改链接
   * @param id Link Id
   * @param model 修改实体模型
   */
  update(id: number, model: LinkUpdateModel): Promise<boolean> {
    return this.models.Links.update(model, {
      where: { id },
    }).then(([count]) => count > 0);
  }

  /**
   * 根据 Id 删除
   * @param id Link Id
   */
  delete(id: number): Promise<boolean> {
    return this.models.Links.destroy({
      where: { id },
    }).then((count) => count > 0);
  }
}
