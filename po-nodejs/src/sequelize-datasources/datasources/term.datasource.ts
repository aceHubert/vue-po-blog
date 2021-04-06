import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@/common/utils/gql-errors.utils';
import { MetaDataSource } from './meta.datasource';

// Types
import {
  TermMetaModel,
  TermTaxonomyArgs,
  TermTaxonomyModel,
  TermTaxonomyRelationshipArgs,
  TermRelationshipModel,
  TermTaxonomyRelationshipModel,
  NewTermInput,
  NewTermMetaInput,
  NewTermRelationshipInput,
  UpdateTermInput,
} from '../interfaces/term.interface';
import { WhereOptions, Transaction } from 'sequelize';

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
          attributes: this.filterFields(fields, this.models.Terms),
          where: {
            id,
          },
        },
      ],
    }).then((term) => {
      if (term) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Term, id: taxonomyId, termId, ...rest } = term.toJSON() as any;
        return {
          taxonomyId,
          ...rest,
          ...Term,
        } as TermTaxonomyModel;
      }
      return null;
    });
  }

  /**
   * 获取协议列表
   * 包含 taxonomy, Term.id => termId,TermTaxonomy.id => taxonomyId;
   * Term.group, TermTaxonomy.id, TermTaxonomy.taxonomy 会强制查询，可用于级联条件调用;
   * @param query 过滤的字段
   * @param fields 返回的字段
   */
  getList(query: TermTaxonomyArgs, fields: string[]): Promise<Array<TermTaxonomyModel>> {
    // 主键(meta/children 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    const where: WhereOptions = {};
    if (query.keyword) {
      where['name'] = {
        [this.Op.like]: `%${query.keyword}%`,
      };
    }
    if (query.group) {
      where['group'] = query.group;
    }

    return this.models.TermTaxonomy.findAll({
      attributes: this.filterFields(fields, this.models.TermTaxonomy),
      include: [
        {
          model: this.models.Terms,
          attributes: this.filterFields(fields, this.models.Terms),
          where: { ...where },
        },
      ],
      where: {
        parentId: query.parentId,
        taxonomy: query.taxonomy,
      },
    }).then((values) =>
      values.map((term) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Term, id: taxonomyId, termId, ...restTaxonomy } = term.toJSON() as any;
        return {
          taxonomyId,
          ...restTaxonomy,
          ...Term,
        } as TermTaxonomyModel;
      }),
    );
  }

  /**
   * 获取协议关系列表
   * @param objectId 对象ID
   * @param fields 返回的字段
   */
  getTermRelationships(
    query: TermTaxonomyRelationshipArgs,
    fields: string[],
  ): Promise<Array<TermTaxonomyRelationshipModel>> {
    fields = fields.filter((field) => field !== 'id'); // 排除 id, 在下面独自处理添加(两个表共有字段)

    return this.models.TermTaxonomy.findAll({
      attributes: this.filterFields(fields, this.models.TermTaxonomy),
      include: [
        {
          model: this.models.Terms,
          attributes: this.filterFields(fields, this.models.Terms),
          required: true,
        },
        {
          model: this.models.TermRelationships,
          attributes: this.filterFields(fields, this.models.TermRelationships),
          where: {
            objectId: query.objectId,
          },
        },
      ],
      where: {
        taxonomy: query.taxonomy,
      },
    }).then((values) =>
      values.map((term) => {
        const { Term, TermRelationships, ...rest } = term.toJSON() as any;
        return {
          ...rest,
          ...Term,
          ...TermRelationships[0],
        } as TermTaxonomyRelationshipModel;
      }),
    );
  }

  /**
   * 新建协议
   * @param model 新建协议实体
   */
  async create(model: NewTermInput): Promise<TermTaxonomyModel> {
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
  async createRelationship(model: NewTermRelationshipInput, transaction?: Transaction): Promise<TermRelationshipModel> {
    const isExists =
      (await this.models.TermRelationships.count({
        where: {
          objectId: model.objectId,
          taxonomyId: model.taxonomyId,
        },
      })) > 0;

    if (isExists) {
      throw new ValidationError('The relationship has been defined!');
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

      await this.models.TermTaxonomy.destroy({
        where: {
          termId: id,
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

  /**
   * 批量删除协议（包括类别，关系，元数据）
   * @param id term Id
   */
  async blukDelete(ids: number[]): Promise<true> {
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

      await this.models.TermTaxonomy.destroy({
        where: {
          termId: ids,
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
