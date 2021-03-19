import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { BaseDataSource } from './base.datasource';

// Types
import { PagedLinkArgs } from '@/links/dto/paged-link.args';
import { NewLinkInput } from '@/links/dto/new-link.input';
import { UpdateLinkInput } from '@/links/dto/update-link.input';
import { PagedLink } from '@/links/models/link.model';
import Link from '@/sequelize-entities/entities/links.entity';

@Injectable()
export class LinkDataSource extends BaseDataSource {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  get(id: number, fields: string[]): Promise<Link | null> {
    return this.models.Links.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Links),
    });
  }

  getPaged({ offset, limit, ...query }: PagedLinkArgs, fields: string[]): Promise<PagedLink> {
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
  create(model: NewLinkInput): Promise<Link | null> {
    return this.models.Links.create(model);
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
