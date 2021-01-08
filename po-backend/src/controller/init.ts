import { Resolver, Mutation, Args, Ctx } from 'type-graphql';
import { error as globalError } from '@vue-async/utils';

// Types
import { DataSources } from '@/dataSources';
import { GetInitArgs } from '@/model/init';

@Resolver()
export default class InitResolver {
  @Mutation((returns) => Boolean, { description: '检查数据库是否已经初始化完成' })
  initCheck(@Ctx('dataSources') { init }: DataSources) {
    return init.haveTables();
  }

  @Mutation((returns) => Boolean, { description: '初始化数据库，如果数据库已经初始化完成，则会直接跳过并返回 true' })
  initDB(@Args() args: GetInitArgs, @Ctx('dataSources') { init }: DataSources) {
    return init
      .initDB({
        alter: true,
        match: /_dev$/,
        when: () => init.haveTables().then((haveTables) => !haveTables),
      })
      .then(async (result) => {
        if (typeof result === 'boolean') {
          if (result) {
            // true 第一次建表
            await init.initDatas(args);
          }
          return true;
        } else {
          globalError(process.env.NODE_ENV === 'production', result.message);
          return false;
        }
      });
  }
}
