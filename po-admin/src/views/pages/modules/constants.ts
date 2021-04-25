import { upperFirst } from 'lodash-es';
import { PostStatus } from '@/includes/datas/enums';

// Types
import { Table } from 'types/constants';

// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('post.column.title', 'Title'),
      align: 'left',
      dataIndex: 'title',
      width: '300px',
      ellipsis: true,
      scopedSlots: { customRender: 'titles' },
    },
    {
      title: i18nRender('post.column.author', 'Author'),
      align: 'center',
      dataIndex: 'author',
      hideInMobile: true,
      scopedSlots: { customRender: 'author' },
    },
    {
      title: i18nRender('post.column.commentCount', 'Comment Count'),
      align: 'center',
      dataIndex: 'commentCount',
      hideInMobile: true,
      scopedSlots: { customRender: 'commentCount' },
    },
    {
      title: i18nRender('post.column.createTime', 'CreateTime'),
      align: 'center',
      dataIndex: 'createTime',
      width: '220px',
      hideInMobile: true,
      scopedSlots: { customRender: 'createTime' },
    },
  ],
});
// 表格里面的列key value
const filters = {
  statusFilter(status: PostStatus, i18nRender: (key: string, fallback: string) => string) {
    return i18nRender(`page.status.${PostStatus[status]}`, upperFirst(PostStatus[status]));
  },
  statusTypeFilter(status: number) {
    enum StatusType {
      'error' = PostStatus.Draft,
      'success' = PostStatus.Publish,
    }
    return StatusType[status];
  },
};

export { table, filters };
