import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { Sequelize, ModelCtor, Model, Op } from 'sequelize';
import dbModels, { sequelize, Models } from './entities';

export class SequelizeDataSource<TContext = any> extends DataSource {
  protected content!: TContext;
  protected sequelize = sequelize;
  protected Sequelize = Sequelize;
  protected Op = Op;
  protected models = dbModels as NonNullable<Models>;

  initialize(config: DataSourceConfig<TContext>) {
    this.content = config.context;
  }

  /**
   * 过滤非数据库字段造成的异常
   * @param fields 字段名
   * @param rawAttributes ORM 实体对象属性
   */
  protected filterFields(fields: string[], model: ModelCtor<Model<any, any>>) {
    const columns = Object.keys(model.rawAttributes);
    return fields.filter((field) => columns.includes(field));
  }
}
