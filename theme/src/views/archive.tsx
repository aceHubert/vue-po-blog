import { Vue, Component } from 'vue-property-decorator';
import moment from 'moment';
import {
  VContainer,
  VIcon,
  VList,
  VListItem,
  VListItemContent,
  VListItemSubtitle,
  VListItemAction,
  VListItemTitle,
  VSubheader,
  VDivider,
} from '@/components/vuetify-tsx';

@Component({
  name: 'theme-archive',
  head: {
    title: '归档',
  },
  asyncData({ postApi }) {
    return postApi.getArchive().then((archives: any) => ({ archives }));
  },
})
export default class ThemeArchive extends Vue {
  archives = [];

  render() {
    return (
      <VContainer class="archive">
        <VList twoLine subheader>
          {this.archives.map((item: any, index: number) => [
            index > 0 ? <VDivider /> : null,
            <VSubheader>
              <VIcon small class="mr-1">
                mdi-calendar-range
              </VIcon>
              {moment(item.date).format('YYYY-MM')}
            </VSubheader>,
            ...item.posts.map(({ id, title, summary, createTime }: any) => (
              <VListItem nuxt to={{ name: 'theme-article', params: { id } }}>
                <VListItemContent>
                  <VListItemTitle>{title}</VListItemTitle>
                  {summary ? <VListItemSubtitle>{summary}</VListItemSubtitle> : null}
                </VListItemContent>
                <VListItemAction>
                  <span>{moment(createTime).format('YYYY-MM-DD')}</span>
                </VListItemAction>
              </VListItem>
            )),
          ])}
        </VList>
      </VContainer>
    );
  }
}
