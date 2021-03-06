import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { isUndefined } from 'lodash';
import { ValidationError } from '@/common/utils/gql-errors.util';
import { MetaDataSource } from './meta.datasource';

// Types
import { WhereOptions, Transaction } from 'sequelize';
import { TermAttributes } from '@/orm-entities/interfaces';
import {
  TermMetaModel,
  TermTaxonomyArgs,
  ChildrenTermTaxonomyArgs,
  TermTaxonomyByObjectIdArgs,
  TermTaxonomyModel,
  TermRelationshipModel,
  NewTermInput,
  NewTermMetaInput,
  NewTermRelationshipInput,
  UpdateTermInput,
} from '../interfaces/term.interface';

@Injectable()
export class TermDataSource extends MetaDataSource<TermMetaModel, NewTermMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 获取协议
   * @param id Term Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<TermTaxonomyModel | null> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    return this.models.TermTaxonomy.findOne({
      attributes: this.filterFields(fields, this.models.TermTaxonomy),
      include: [
        {
          model: this.models.Terms,
          as: 'Terms',
          attributes: this.filterFields(fields, this.models.Terms),
          where: {
            id,
          },
        },
      ],
    }).then((term) => {
      if (term) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Terms, id: taxonomyId, termId, ...rest } = term.toJSON() as any;
        return {
          taxonomyId,
          ...rest,
          ...Terms,
        } as TermTaxonomyModel;
      }
      return null;
    });
  }

  /**
   * 获取协议列表
   * @param query 过滤的字段
   * @param fields 返回的字段
   */
  getList(query: TermTaxonomyArgs | ChildrenTermTaxonomyArgs, fields: string[]): Promise<TermTaxonomyModel[]> {
    // 主键(meta/children 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    const keyword = (query as TermTaxonomyArgs).keyword;
    const taxonomy = (query as TermTaxonomyArgs).taxonomy;
    const parentId = query.parentId;
    const group = query.group;

    const where: WhereOptions<TermAttributes> = {};
    if (keyword) {
      where['name'] = {
        [this.Op.like]: `%${keyword}%`,
      };
    }
    if (!isUndefined(group)) {
      where['group'] = query.group;
    }

    return this.models.TermTaxonomy.findAll({
      attributes: this.filterFields(fields, this.models.TermTaxonomy),
      include: [
        {
          model: this.models.Terms,
          as: 'Terms',
          attributes: this.filterFields(fields, this.models.Terms),
          where,
        },
      ],
      where: {
        ...(!isUndefined(parentId) ? { parentId } : {}),
        ...(taxonomy ? { taxonomy } : {}),
      },
    }).then((values) =>
      values.map((term) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Terms, id: taxonomyId, termId, ...restTaxonomy } = term.toJSON() as any;
        return {
          taxonomyId,
          ...restTaxonomy,
          ...Terms,
        } as TermTaxonomyModel;
      }),
    );
  }

  /**
   * 获取协议关系列表
   * @param objectId 对象ID
   * @param fields 返回的字段
   */
  getListByObjectId(query: TermTaxonomyByObjectIdArgs, fields: string[]): Promise<TermTaxonomyModel[]> {
    // 主键(meta/children 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    return this.models.TermTaxonomy.findAll({
      attributes: this.filterFields(fields, this.models.TermTaxonomy),
      include: [
        {
          model: this.models.Terms,
          attributes: this.filterFields(fields, this.models.Terms),
          as: 'Terms',
          where: {
            ...(!isUndefined(query.group) ? { group: query.group } : {}),
          },
          required: true,
        },
        {
          model: this.models.TermRelationships,
          as: 'TermRelationships',
          where: {
            objectId: query.objectId,
          },
        },
      ],
      where: {
        ...(!isUndefined(query.parentId) ? { parentId: query.parentId } : {}),
        taxonomy: query.taxonomy,
      },
      order: [[this.models.TermRelationships, 'order', query.desc ? 'DESC' : 'ASC']],
    }).then((values) =>
      values.map((term) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Terms, id: taxonomyId, termId, ...restTaxonomy } = term.toJSON() as any;
        return {
          taxonomyId,
          ...restTaxonomy,
          ...Terms,
        } as TermTaxonomyModel;
      }),
    );
  }

  /**
   * 新建协议
   * @param model 新建协议实体
   */
  async create(model: NewTermInput, requestUser: JwtPayloadWithLang): Promise<TermTaxonomyModel> {
    const t = await this.sequelize.transaction();
    const { name, slug, group, taxonomy, description, parentId, metas } = model;
    try {
      const term = await this.models.Terms.create(
        {
          name,
          slug: slug || name,
          group: group,
        },
        { transaction: t },
      );

      if (metas && metas.length) {
        this.models.TermMeta.bulkCreate(
          metas.map((meta) => {
            return {
              ...meta,
              termId: term.id,
            };
          }),
          {
            transaction: t,
          },
        );
      }

      // 添加类别
      const termTaxonomy = await this.models.TermTaxonomy.create(
        {
          termId: term.id,
          taxonomy,
          description,
          parentId,
        },
        { transaction: t },
      );

      // 如提供，则会自动绑定关系
      if (model.objectId) {
        await this.createRelationship(
          {
            objectId: model.objectId,
            taxonomyId: termTaxonomy.id,
          },
          requestUser,
          t,
        );
      }

      await t.commit();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: taxonomyId, termId, ...restTaxonomy } = termTaxonomy.toJSON() as any;

      return {
        taxonomyId,
        ...restTaxonomy,
        ...term.toJSON(),
      } as TermTaxonomyModel;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 新建协议关系
   * @param model 新建协议关系实体
   */
  async createRelationship(
    model: NewTermRelationshipInput,
    requestUser: JwtPayloadWithLang,
    transaction?: Transaction,
  ): Promise<TermRelationshipModel> {
    const isExists =
      (await this.models.TermRelationships.count({
        where: {
          objectId: model.objectId,
          taxonomyId: model.taxonomyId,
        },
      })) > 0;

    if (isExists) {
      throw new ValidationError(
        await this.i18nService.tv(
          'datasource.termrelationship_duplicate_definition',
          'Term relationship has been defined!',
          { lang: requestUser.lang },
        ),
      );
    }

    // 数量 +1
    await this.models.TermTaxonomy.increment('count', {
      where: {
        id: model.taxonomyId,
      },
      transaction,
    });
    const termRelationship = await this.models.TermRelationships.create(model, { transaction });
    return termRelationship.toJSON() as TermRelationshipModel;
  }

  /**
   * 修改协议
   * @param id term Id
   * @param model 修改协议实体
   */
  async update(id: number, model: UpdateTermInput): Promise<true> {
    const { description, parentId, ...termModel } = model;
    const t = await this.sequelize.transaction();
    try {
      await this.models.Terms.update(termModel, {
        where: {
          id,
        },
      });
      await this.models.TermTaxonomy.update(
        {
          description,
          parentId,
        },
        {
          where: {
            termId: id,
          },
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
   * 删除协议关系
   * @param objectId
   * @param taxonomyId
   */
  async deleteRelationship(objectId: number, taxonomyId: number): Promise<true> {
    const t = await this.sequelize.transaction();
    try {
      const count = await this.models.TermRelationships.destroy({
        where: {
          objectId,
          taxonomyId,
        },
        transaction: t,
      });

      if (count > 0) {
        // 数量 -1
        await this.models.TermTaxonomy.increment('count', {
          where: {
            id: taxonomyId,
          },
          by: 0 - count,
          transaction: t,
        });
      }

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 删除协议（包括类别，关系，元数据）
   * @param id term Id
   */
  async delete(id: number): Promise<true> {
    const t = await this.sequelize.transaction();
    try {
      await this.models.TermMeta.destroy({
        where: {
          termId: id,
        },
        transaction: t,
      });

      await this.models.Terms.destroy({
        where: {
          id,
        },
        transaction: t,
      });

      await this.models.TermRelationships.destroy({
        where: {
          taxonomyId: await this.models.TermTaxonomy.findAll({
            attributes: ['id'],
            where: {
              termId: id,
            },
          }).then((termTaxonomys) => termTaxonomys.map(({ id }) => id)),
        },
        transaction: t,
      });

      const termTaxonomy = await this.models.TermTaxonomy.findOne({
        where: {
          termId: id,
        },
      });

      if (termTaxonomy) {
        await termTaxonomy.destroy({
          transaction: t,
        });

        // 子项层级提升
        await this.models.TermTaxonomy.update(
          { parentId: termTaxonomy.parentId },
          {
            where: {
              parentId: termTaxonomy.id,
            },
            transaction: t,
          },
        );
      }

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // 批量删除时子项提升查找parentId
  private getParentId(
    deleteTermTaxonomies: Array<{ id: number; parentId: number }>,
    itemModel: { id: number; parentId: number },
  ): number {
    const item = deleteTermTaxonomies.find((term) => term.id === itemModel.parentId);
    if (item) {
      return this.getParentId(deleteTermTaxonomies, item);
    }
    return itemModel.parentId;
  }

  /**
   * 批量删除协议（包括类别，关系，元数据）
   * @param id term Id
   */
  async bulkDelete(ids: number[]): Promise<true> {
    const t = await this.sequelize.transaction();
    try {
      await this.models.TermMeta.destroy({
        where: {
          termId: ids,
        },
        transaction: t,
      });

      await this.models.Terms.destroy({
        where: {
          id: ids,
        },
        transaction: t,
      });

      await this.models.TermRelationships.destroy({
        where: {
          taxonomyId: await this.models.TermTaxonomy.findAll({
            attributes: ['id'],
            where: {
              termId: ids,
            },
          }).then((termTaxonomys) => termTaxonomys.map(({ id }) => id)),
        },
        transaction: t,
      });

      const termTaxonomies = await this.models.TermTaxonomy.findAll({
        where: {
          termId: ids,
        },
      });

      if (termTaxonomies.length) {
        await this.models.TermTaxonomy.destroy({
          where: {
            id: termTaxonomies.map(({ id }) => id),
          },
          transaction: t,
        });

        // 子项层级提升
        await Promise.all(
          termTaxonomies.map((termTaxonomy) =>
            this.models.TermTaxonomy.update(
              { parentId: this.getParentId(termTaxonomies, termTaxonomy) },
              {
                where: {
                  parentId: termTaxonomy.id,
                },
                transaction: t,
              },
            ),
          ),
        );
      }

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
