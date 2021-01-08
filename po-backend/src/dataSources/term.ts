import { MetaDataSource } from './meta';

// Types
import { TermQueryArgs, TermAddModel, TermRelationshipAddModel, TermMetaAddModel } from '@/model/term';
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
   * 获取协议列表（包含 taxonomy）
   * @param query 过滤的字段
   * @param fields 返回的字段
   */
  async getList(
    query: TermQueryArgs,
    fields: string[],
  ): Promise<Array<Term & Omit<TermTaxonomy, 'id' | 'termId' | 'parentId'>>> {
    const { group, ...rest } = query;
    return await this.models.Terms.findAll({
      attributes: this.filterFields(fields, this.models.Terms),
      include: [
        {
          association: Term.belongsTo(TermTaxonomy, { foreignKey: 'id', targetKey: 'termId' }),
          as: 'TermTaxonomy',
          attributes: this.filterFields(fields, this.models.TermTaxonomy).filter(
            (key) => !['id', 'termId', 'parentId'].includes(key),
          ), // 排除 id
          where: {
            ...rest,
          },
        },
      ],
      where: {
        group,
      },
    }).then((values) => {
      return values.map((term) => {
        const { TermTaxonomy = {}, ...rest } = term.toJSON() as any;
        return {
          ...rest,
          ...TermTaxonomy,
        } as Term & Omit<TermTaxonomy, 'id' | 'termId' | 'parentId'>;
      });
    });
  }

  /**
   * 新建协议
   * @param model 新建协议实体
   */
  async create(model: TermAddModel) {
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

      await this.models.TermTaxonomy.create(termTaxonomyCreationModle, { transaction: t });

      t.commit();
      return term;
    } catch (err) {
      t.rollback();
      return null;
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
      return await this.models.TermRelationships.create(model);
    }
    return null;
  }
}
