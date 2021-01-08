import InitDataSource from './init';
import OptionDataSource from './option';
import UserDataSource from './user';
import PostDataSorce from './post';
import CommentDataSource from './comment';
import TermDataSource from './term';
import MediaDataSource from './media';
import LinkDataSource from './link';

export const dataSources = () => {
  return {
    init: new InitDataSource(),
    option: new OptionDataSource(),
    user: new UserDataSource(),
    post: new PostDataSorce(),
    comment: new CommentDataSource(),
    term: new TermDataSource(),
    media: new MediaDataSource(),
    link: new LinkDataSource(),
  };
};

export type DataSources = ReturnType<typeof dataSources>;
