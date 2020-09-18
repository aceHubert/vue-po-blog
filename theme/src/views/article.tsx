import { Vue, Component } from 'vue-property-decorator';
import { VContainer } from '@/components/vuetify-tsx';
import moment from 'moment';

// Styles
import classes from './styles/article.module.scss';

@Component({
  name: 'theme-article',
  head: {
    title: 'Article',
  },
  asyncData({ params, postApi }) {
    return postApi.get(params.id);
  },
})
export default class ThemeArticle extends Vue {
  id = null;
  title = '';
  author = '';
  thumbnail = '';
  content = '';
  tags = [];
  views = 0;
  createTime = null;

  render() {
    return (
      <VContainer class={classes.article}>
        <h1>{this.title}</h1>
        <p class="caption text--grey">
          <span>{moment(this.createTime).format('yyyy-MM-DD')}</span>
        </p>
        <div domPropsInnerHTML={this.content} class={classes.content} style="width:100%; overflow:hidden;"></div>
      </VContainer>
    );
  }
}
