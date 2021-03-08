import OptionDataSource from './option';
import UserDataSource from './user';
import PostDataSorce from './post';
import CommentDataSource from './comment';
import TermDataSource from './term';
import MediaDataSource from './media';
import LinkDataSource from './link';

export const dataSources = () => {
  return {
    option: new OptionDataSource(),
    user: new UserDataSource(),
    post: new PostDataSorce(),
    comment: new CommentDataSource(),
    term: new TermDataSource(),
    media: new MediaDataSource(),
    link: new LinkDataSource(),
  };
};

export { default as AuthHelper } from './helper/auth';
export * from './helper/auth';
export { default as InitHelper } from './helper/init';
export * from './helper/init';
export { default as UserRoles } from './helper/userRoles';
export * from './helper/enums';

export type DataSources = ReturnType<typeof dataSources>;
