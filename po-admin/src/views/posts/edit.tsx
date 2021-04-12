import { Component, mixins } from 'nuxt-property-decorator';
import { PostStatus, PostVisibility, UserCapability } from '@/includes/datas/enums';
import { PostEditForm } from '@/components';
import PostEditMixin from './modules/mixin';

{
  /* <router>
{
  name:'posts-edit',
  path:':id/edit',
  meta:{
    title: 'Edit',
  }
}
</router> */
}

@Component<PostEdit>({
  name: 'PostEdit',
  layout: 'blank',
  meta: {
    capabilities: [UserCapability.EditPosts],
  },
})
export default class PostEdit extends mixins(PostEditMixin) {
  render() {
    return (
      <PostEditForm
        style="height:100vh"
        ref="editForm"
        editModel={this.post}
        updatePost={this.onUpdatePost.bind(this)}
        updatePostStatus={this.onUpdatePostStatus.bind(this)}
        onStatusChange={(status) => (this.status = status)}
        {...{
          scopedSlots: {
            formItemAppend: () => (
              <div>
                <a-form-item
                  class="px-3 pb-4"
                  label={this.$tv('post.form.excerpt', 'Excerpt')}
                  help={this.$tv('post.form.excerptHelp', 'Write an excerpt(optional)')}
                  hasFeedback={false}
                >
                  <a-textarea
                    placeholder={this.$tv('post.form.excerptPlaceholder', 'Please input excerpt')}
                    {...{ directives: [{ name: 'decorator', value: ['excerpt'] }] }}
                  />
                </a-form-item>
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
                  <a-collapse-panel header={this.$tv('post.form.thumbnail', 'Thumbnail')}>
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
                            <div class="ant-upload-text">{this.$tv('post.btnText.upload', 'Upload')}</div>,
                          ]
                        : null}
                    </a-upload>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.categoryTitle', 'Categories')}>
                    <div class="mb-3">
                      <a-tree
                        checkable
                        checkStrictly
                        checkedKeys={this.checkedCagegoryKeys}
                        selectable={false}
                        treeData={this.allCategories}
                        onCheck={this.handCategoryChecked.bind(this)}
                      ></a-tree>
                    </div>
                    <nuxt-link to={{ name: 'categories' }}>
                      {this.$tv('post.form.addCategoryLinkText', 'Add Cagetory')}
                    </nuxt-link>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.tagTitle', 'Tags')}>
                    <a-select
                      value={this.selectedTags}
                      options={this.allTags}
                      maxTagCount={10}
                      mode="tags"
                      optionFilterProp="children"
                      placeholder={this.$tv('post.form.tagPlaceholder', 'Please choose/input a tag')}
                      style="width:100%"
                      class="mb-3"
                      onSelect={this.handleTagSelect.bind(this)}
                      onDeselect={this.handleTagDeselect.bind(this)}
                      onSearch={() => {}}
                    ></a-select>
                    <nuxt-link to={{ name: 'tags' }}>
                      {this.$tv('post.form.tagManagementLinkText', 'Tag Management')}
                    </nuxt-link>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.discusionTitle', 'Discusion')}>
                    <a-checkbox
                      checked={this.allowComments}
                      disabled={this.allowCommentsChanging}
                      onChange={this.handleAllowCommentsChange.bind(this)}
                    >
                      {this.$tv('post.form.allowCommentCheckboxText', 'Allow comments')}
                    </a-checkbox>
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
