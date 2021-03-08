import { MetaDataSource } from './meta';

// Types
import {
  TermQueryArgs,
  TermAddModel,
  TermRelationshipQueryArgs,
  TermRelationshipAddModel,
  TermMetaAddModel,
} from '@/model/term';
import Term, { TermCreationAttributes } from './entities/terms';
import TermMeta, { TermMetaCreationAttributes } from './entities/termMeta';
import TermTaxonomy, { TermTaxonomyCreationAttributes } from './entities/termTaxonomy';
import TermRelationship from './entities/termRelationships';

export default class TermDataSource extends MetaDataSource<TermMeta, TermMetaAddModel> {
  /**
   * 获取协议
   * @param id Term Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<Term | null> {
    return this.models.Terms.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Terms),
    });
  }

  /**
   * 获取协议列表(级联查询)
   * 包含 taxonomy, Term.id => termId,TermTaxonomy.id => taxonomyId;
   * Term.group, TermTaxonomy.id, TermTaxonomy.taxonomy 会强制查询，可用于级联条件调用;
   * @param query 过滤的字段
   * @param fields 返回的字段
   */
  getList(
    query: TermQueryArgs,
    fields: string[],
  ): Promise<Array<Omit<Term, 'id'> & Omit<TermTaxonomy, 'id'> & { taxonomyId: number }>> {
    fields = fields.filter((field) => field !== 'id'); // 排除 id, 在下面独自处理添加(两个表共有字段)

    // 如果是级联查询下级，必须要把query中搜索条件的字段查询出来
    const hasChildrenField = fields.includes('children');

    return this.models.TermTaxonomy.findAll({
      attributes: this.filterFields(fields, this.models.TermTaxonomy).concat(
        ['id'],
        hasChildrenField ? ['taxonomy'] : [], // id, taxonomy 必须，用于级联子查询
      ),
      include: [
        {
          model: this.models.Terms,
          attributes: this.filterFields(fields, this.models.Terms).concat(
            hasChildrenField ? ['group'] : [], // group 必须，用于级联子查询
          ),
          where: {
            ...(query.group ? { group: query.group } : {}),
          },
        },
      ],
      where: {
        parentId: query.parentId,
        taxonomy: query.taxonomy,
      },
    }).then((values) =>
      values.map((term) => {
        const { Term, id: taxonomyId, ...rest } = term.toJSON() as any;
        return {
          taxonomyId,
          ...rest,
          ...Term,
        };
      }),
    );
  }

  /**
   * 获取协议关系列表
   * @param objectId 对象ID
   * @param fields 返回的字段
   */
  getRelationships(
    query: TermRelationshipQueryArgs,
    fields: string[],
  ): Promise<Array<Omit<Term, 'id'> & Omit<TermTaxonomy, 'id'> & TermRelationship>> {
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
        const { Terms, TermRelationships, ...rest } = term.toJSON() as any;
        return {
          ...rest,
          ...Terms,
          ...TermRelationships,
        };
      }),
    );
  }

  /**
   * 新建协议
   * @param model 新建协议实体
   */
  async create(
    model: TermAddModel,
  ): Promise<Array<Omit<Term, 'id'> & Omit<TermTaxonomy, 'id'> & { taxonomyId: number }>> {
    const t = await this.sequelize.transaction();
    const { name, slug, taxonomy, group, metas } = model;
    try {
      const termCreationModel: TermCreationAttributes = {
        name,
        slug: slug || name,
        group: group || 0,
      };
      const term = await this.models.Terms.create(termCreationModel, { transaction: t });

      if (metas && metas.length) {
        const metaCreationModels: TermMetaCreationAttributes[] = metas.map((meta) => {
          return {
            ...meta,
            termId: term.id,
          };
        });
        this.models.TermMeta.bulkCreate(metaCreationModels);
      }

      const termTaxonomyCreationModle: TermTaxonomyCreationAttributes = {
        termId: term.id,
        taxonomy,
        description: '',
      };

      const termTaxonomy = await this.models.TermTaxonomy.create(termTaxonomyCreationModle, { transaction: t });

      // 如提供，则会自动绑定关系
      if (model.objectId) {
        await this.createRelationship({
          objectId: model.objectId,
          taxonomyId: termTaxonomy.id,
        });
      }

      await t.commit();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: termId, ...termRest } = term.toJSON() as any;
      const { id: taxonomyId, ...taxonomyRest } = termTaxonomy.toJSON() as any;

      return {
        taxonomyId,
        ...termRest,
        ...taxonomyRest,
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 新建协议关系
   * @param model 新建协议关系实体
   */
  async createRelationship(model: TermRelationshipAddModel): Promise<TermRelationship | null> {
    const isExists =
      (await this.models.TermRelationships.count({
        where: {
          objectId: model.objectId,
          taxonomyId: model.taxonomyId,
        },
      })) > 0;

    if (!isExists) {
      // 数量 +1
      await this.models.TermTaxonomy.increment('count', {
        where: {
          id: model.taxonomyId,
        },
      });
      return await this.models.TermRelationships.create(model);
    }
    return null;
  }

  /**
   * 删除协议关系
   * @param objectId
   * @param taxonomyId
   */
  async deleteRelationship(objectId: number, taxonomyId: number): Promise<boolean> {
    const count = await this.models.TermRelationships.destroy({
      where: {
        objectId,
        taxonomyId,
      },
    });

    if (count > 0) {
      // 数量 -1
      await this.models.TermTaxonomy.increment('count', {
        where: {
          id: taxonomyId,
        },
        by: 0 - count,
      });
      return true;
    }
    return false;
  }
}
