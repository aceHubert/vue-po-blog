import { Component, mixins } from 'nuxt-property-decorator';
import { PostStatus, PostVisibility, UserCapability } from '@/includes/datas/enums';
import PostEditForm from '@/components/PostEditForm';
import PostEditMixin from './modules/mixin';

{
  /* <router>
{
  meta:{
    title: 'New',   
  }
}
</router> */
}

@Component<PageCreate>({
  name: 'PageCreate',
  layout: 'blank',
  meta: {
    capabilities: [UserCapability.CreatePages],
  },
})
export default class PageCreate extends mixins(PostEditMixin) {
  render() {
    return (
      <PostEditForm
        style="height:100vh"
        ref="editForm"
        editModel={this.page}
        updatePost={this.onUpdatePage.bind(this)}
        updatePostStatus={this.onUpdatePageStatus.bind(this)}
        isPage
        {...{
          scopedSlots: {
            formItemAppend: () => (
              <div>
                <a-divider class="my-0"></a-divider>

                <a-collapse
                  bordered={false}
                  activeKey="statusAndVisibility"
                  expand-icon-position="right"
                  class="shades transparent"
                >
                  <a-collapse-panel
                    key="statusAndVisibility"
                    header={this.$tv('post.form.statusAndVisibility', 'Status & Visibility')}
                  >
                    <a-row>
                      <a-col span={6}>
                        <span style="line-height:24px;"> {this.$tv('post.form.visibility', 'Visibility')}</span>
                      </a-col>
                      <a-col span={18}>
                        <a-popover vModel={this.visibilityPopShown} placement="bottomRight" trigger="click">
                          <template slot="content">
                            <a-radio-group vModel={this.visibility} onChange={this.handleVisibility.bind(this)}>
                              <a-radio style="display:block" value={PostVisibility.Public}>
                                {this.$tv('post.visibility.public', 'Public')}
                                <span class="grey--text" style="display:block">
                                  {this.$tv('post.visibility.publicDescription', 'Visible for everyone!')}
                                </span>
                              </a-radio>
                              <a-radio style="display:block" value={PostVisibility.Private}>
                                {this.$tv('post.visibility.private', 'Private')}
                                <span class="grey--text" style="display:block">
                                  {this.$tv(
                                    'post.visibility.privateDescription',
                                    'Only visible to site admins and editors',
                                  )}
                                </span>
                              </a-radio>
                            </a-radio-group>
                          </template>
                          <a-button type="link" size="small">
                            {this.$tv(
                              `post.visibility.${this.status === PostStatus.Private ? 'private' : 'public'}`,
                              this.status === PostStatus.Private ? 'Private' : 'Public',
                            )}
                          </a-button>
                        </a-popover>
                      </a-col>
                    </a-row>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('page.form.thumbnail', 'Thumbnail')}>
                    <a-upload
                      action="/api/file/upload/"
                      class="upload-list-inline"
                      listType="picture-card"
                      fileList={this.thumbnailList}
                      beforeUpload={this.beforeThumbnailUpload.bind(this)}
                      onChange={this.handleThumbnailChange.bind(this)}
                    >
                      {!this.thumbnailList.length
                        ? [
                            <a-icon type="plus" />,
                            <div class="ant-upload-text">{this.$tv('page.btnText.upload', 'Upload')}</div>,
                          ]
                        : null}
                    </a-upload>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('page.form.discusionTitle', 'Discusion')}>
                    <a-checkbox
                      checked={this.allowComments}
                      disabled={this.allowCommentsChanging}
                      onChange={this.handleAllowCommentsChange.bind(this)}
                    >
                      {this.$tv('page.form.allowCommentCheckboxText', 'Allow comments')}
                    </a-checkbox>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('page.form.attributes', 'Page Attributes')}>
                    <a-form-item label={this.$tv(`page.form.order`, 'Order')} hasFeedback={false}>
                      <a-input-number {...{ directives: [{ name: 'decorator', value: ['order'] }] }} />
                    </a-form-item>
                  </a-collapse-panel>
                </a-collapse>
              </div>
            ),
          },
        }}
      ></PostEditForm>
    );
  }
}
