import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { BaseDataSource } from './base.datasource';

// Types
import { LinkModel, PagedLinkModel, PagedLinkArgs, NewLinkInput, UpdateLinkInput } from '../interfaces/link.interface';

@Injectable()
export class LinkDataSource extends BaseDataSource {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  get(id: number, fields: string[]): Promise<LinkModel | null> {
    return this.models.Links.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Links),
    }).then((link) => link?.toJSON() as LinkModel);
  }

  getPaged({ offset, limit, ...query }: PagedLinkArgs, fields: string[]): Promise<PagedLinkModel> {
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
      rows: (rows as unknown) as PagedLinkModel['rows'],
      total,
    }));
  }

  /**
   * 添加链接
   * @param model 添加实体模型
   */
  async create(model: NewLinkInput): Promise<LinkModel | null> {
    const link = await this.models.Links.create(model);
    return link.toJSON() as LinkModel;
  }

  /**
   * 修改链接
   * @param id Link Id
   * @param model 修改实体模型
   */
  update(id: number, model: UpdateLinkInput): Promise<boolean> {
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
