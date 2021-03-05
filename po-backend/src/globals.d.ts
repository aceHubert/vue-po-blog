import { Context } from 'apollo-server-core';
import { Sequelize, Dialect, ModelCtor } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

import { DataSources, AuthHelper, UserRole } from '@/dataSources';
import Opitons from '@/dataSources/entities/options';
import Users from '@/dataSources/entities/users';
import UserMeta from '@/dataSources/entities/userMeta';
import Posts from '@/dataSources/entities/posts';
import PostMeta from '@/dataSources/entities/postMeta';
import Comments from '@/dataSources/entities/comments';
import CommentMeta from '@/dataSources/entities/commentMeta';
import Medias from '@/dataSources/entities/medias';
import MediaMeta from '@/dataSources/entities/mediaMeta';
import Links from '@/dataSources/entities/links';
import Terms from '@/dataSources/entities/terms';
import TermMeta from '@/dataSources/entities/termMeta';
import TermTaxonomy from '@/dataSources/entities/termTaxonomy';
import TermRelationships from '@/dataSources/entities/termRelationships';

declare global {
  export type Config = {
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_HOST?: string;
    DB_DIALECT?: Dialect;
    DB_CHARSET?: string;
    DB_COLLATE?: string;
    use_db_variable: false | string;
    table_prefix: string;
    jwt_screct: string;
    jwt_algorithm: Algorithm;
    jwt_expiresIn: string | number;
    jwt_refresh_token_expiresIn: string | number;
  };

  export type Models = {
    Options: ModelCtor<Opitons>;
    Users: ModelCtor<Users>;
    UserMeta: ModelCtor<UserMeta>;
    Posts: ModelCtor<Posts>;
    PostMeta: ModelCtor<PostMeta>;
    Comments: ModelCtor<Comments>;
    CommentMeta: ModelCtor<CommentMeta>;
    Medias: ModelCtor<Medias>;
    MediaMeta: ModelCtor<MediaMeta>;
    Links: ModelCtor<Links>;
    Terms: ModelCtor<Terms>;
    TermMeta: ModelCtor<TermMeta>;
    TermTaxonomy: ModelCtor<TermTaxonomy>;
    TermRelationships: ModelCtor<TermRelationships>;
  };

  export type TableInitOptions = {
    prefix: string;
  };

  export interface TableInitFunc {
    (sequelize: Sequelize, options: TableInitOptions): void;
  }

  export interface TableAssociateFunc {
    (models: Models): void;
  }

  export type JwtPayload = {
    id: number;
    loginName: string;
    role: UserRole | null;
    createdAt: Date;
  };

  export type ContextType = Context<{
    token: string | null;
    user: JwtPayload | null;
    // eslint-disable-next-line no-undef
    authHelper: InstanceType<typeof AuthHelper>;
    dataSources: DataSources;
  }>;

  export type Dictionary<T> = Record<string, T>;
}

// 注意: 修改"全局声明"必须在模块内部, 所以至少要有 export{}字样
// 不然会报错❌: 全局范围的扩大仅可直接嵌套在外部模块中或环境模块声明中
export {};
