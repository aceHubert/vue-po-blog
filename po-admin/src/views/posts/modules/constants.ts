/**
 * scopedSlots 中设置 title 是关键字
 */
import { upperFirst } from 'lodash-es';
import { PostStatus } from '@/includes/datas/enums';

// 表格列信息
const table: Table = ({ i18nRender }) => ({
  columns: [
    {
      title: i18nRender('core.page-post.column.title', 'Title'),
      align: 'left',
      dataIndex: 'title',
      width: '300px',
      ellipsis: true,
      showInMobile: true,
      showInTablet: true,
      scopedSlots: { customRender: 'titles' },
    },
    {
      title: i18nRender('core.page-post.column.author', 'Author'),
      align: 'center',
      dataIndex: 'author',
      showInTablet: true,
      scopedSlots: { customRender: 'author' },
    },
    {
      title: i18nRender('core.page-post.column.comment_count', 'Comment Count'),
      align: 'center',
      dataIndex: 'commentCount',
      showInTablet: true,
      scopedSlots: { customRender: 'commentCount' },
    },
    {
      title: i18nRender('core.page-post.column.category', 'Categories'),
      align: 'center',
      dataIndex: 'categories',
      scopedSlots: { customRender: 'categories' },
    },
    {
      title: i18nRender('core.page-post.column.tag', 'Tags'),
      align: 'center',
      dataIndex: 'tags',
      scopedSlots: { customRender: 'tags' },
    },
    {
      title: i18nRender('core.page-post.column.create_time', 'CreateTime'),
      align: 'center',
      dataIndex: 'createTime',
      width: '220px',
      showInTablet: true,
      scopedSlots: { customRender: 'createTime' },
    },
  ],
});

// 表格里面的列key value
const filters = {
  statusFilter(status: PostStatus, i18nRender: (key: string, fallback: string) => string) {
    return i18nRender(`core.page-post.status.${PostStatus[status]}`, upperFirst(PostStatus[status]));
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
