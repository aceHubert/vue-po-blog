<template>
  <a-form :form="form" class="article-form">
    <a-row :gutter="16">
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('article.form.title', 'Title')">
          <a-input
            style="width: 220px; max-width: 100%"
            :placeholder="$tv('article.form.titlePlaceholder', 'Please input title')"
            v-decorator="['title', { rules: rules.title }]"
          />
        </a-form-item>
      </a-col>
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('article.form.author', 'Author')">
          <a-input
            style="width: 220px; max-width: 100%"
            :placeholder="$tv('article.form.authorPlaceholder', 'Please input author')"
            v-decorator="['author', { rules: rules.author }]"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :md="16" :sm="24">
        <a-form-item :label="$tv('article.form.summary', 'Summary')">
          <a-textarea
            style="width: 500px; max-width: 100%"
            :placeholder="$tv('article.form.summaryPlaceholder', 'Please input summary')"
            v-decorator="['summary', { rules: rules.summary }]"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('article.form.thumbnail', 'Thumbnail')">
          <a-upload
            action="/api/plumemo-server/v1/file/upload/"
            class="upload-list-inline"
            list-type="picture-card"
            :file-list="thumbnailList"
            :before-upload="beforeThumbnailUpload"
            @change="handleThumbnailChange"
            v-decorator="['thumbnail']"
          >
            <template v-if="!thumbnailList.length">
              <a-icon type="plus" />
              <div class="ant-upload-text">{{ $tv('article.btnText.upload', 'Upload') }}</div>
            </template>
          </a-upload>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('article.form.category', 'Category')">
          <a-select
            mode="multiple"
            style="width: 220px"
            :placeholder="$tv('article.form.categoryPlaceholder', 'Please choose category')"
            v-decorator="['categoryIds']"
            @change="handleSelectChange"
          >
            <a-select-option v-for="item in categories" :key="String(item.id)" :value="String(item.id)">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('article.form.tag', 'Tag')">
          <a-select
            mode="tags"
            style="width: 220px"
            :placeholder="$tv('article.form.tagPlaceholder', 'Please choose tag')"
            v-decorator="['tags']"
            @change="handleSelectChange"
          >
            <a-select-option v-for="item in tags" :key="String(item.id)" :value="String(item.id)">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item :label="$tv('article.form.content', 'Content')">
          <MavonEditor
            ref="md"
            :toolbars="markdownOption"
            :box-shadow="false"
            :subfield="false"
            :ishljs="true"
            :placeholder="$tv('article.form.contentPlaceholder', 'Please input content')"
            style="min-height: 335px; z-index: 5"
            class="editor ant-input"
            v-decorator="['content', { initialValue: '', rules: rules.content }]"
            @imgAdd="handleEditorImgAdd"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script>
import { mavonEditor as MavonEditor } from 'mavon-editor';
import { isPlainObject } from '@vue-async/utils';
import { categoryApi, tagApi } from '@/includes/datas';
import { markdownOption } from '../constants';

// Styles
import 'mavon-editor/dist/css/index.css';

export default {
  name: 'EditForm',
  components: {
    MavonEditor,
  },
  props: {
    defaultValues: {
      type: Object,
      default: () => ({}),
    },
    summaryRequired: {
      type: Boolean,
      default: false,
    },
  },
  fetch() {
    return Promise.all([this.getTags(), this.getCategories()]).catch(() => {
      // ignoer error
    });
  },
  data() {
    return {
      tags: [],
      categories: [],
      thumbnailList: [],
      markdownOption: markdownOption(),
    };
  },
  created() {
    const { thumbnail, ...restVals } = this.defaultValues;

    if (thumbnail) {
      this.thumbnailList = [
        {
          uid: '-1',
          name: 'thumbnail',
          status: 'done',
          url: thumbnail,
        },
      ];
    }
    const model = Object.assign(
      {
        title: '',
        author: '',
        summary: '',
        thumbnail: { file: null, fileList: [] },
        categoryIds: [],
        tags: [],
        content: '',
      },
      restVals,
    );

    this.form = this.$form.createForm(this, {
      name: 'article_form',
      mapPropsToFields: () => {
        // 默认值
        return Object.keys(model).reduce((prev, key) => {
          prev[key] = this.$form.createFormField({
            value: model[key],
          });
          return prev;
        }, {});
      },
    });

    this.rules = {
      title: [
        {
          required: true,
          message: this.$tv('article.form.titleRequired', 'Title is required'),
          whitespace: true,
        },
      ],
      author: [
        {
          required: true,
          message: this.$tv('article.form.authorRequired', 'Author is required'),
          whitespace: true,
        },
      ],
      summary: [
        {
          required: this.summaryRequired,
          message: this.$tv('article.form.summaryRequired', 'Summary  is required'),
          whitespace: true,
        },
      ],
      content: [{ required: true, message: this.$tv('article.form.contentRequired', 'Content  is required') }],
    };
  },
  methods: {
    getTags() {
      return tagApi.getList().then((tags) => {
        this.tags = tags;
      });
    },
    getCategories() {
      return categoryApi.getList().then((categories) => {
        this.categories = categories;
      });
    },
    reset() {
      this.currentModel.content = '';
      this.form.resetFields();
    },
    validate(callback) {
      this.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const pureValues = { ...values };
          if (pureValues.thumbnail.file) {
            pureValues.thumbnail =
              pureValues.thumbnail.file.response && isPlainObject(pureValues.thumbnail.file.response)
                ? pureValues.thumbnail.file.response.extra
                : null;
          } else {
            pureValues.thumbnail = this.defaultValues.thumbnail || null;
          }

          callback(pureValues);
        }
      });
    },
    beforeThumbnailUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      if (!isJPG) {
        this.$notification.error({
          message: 'You can only upload JPG file!',
        });
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$notification.error({
          message: 'Image must smaller than 2MB!',
        });
      }
      return isJPG && isLt2M;
    },
    handleThumbnailChange({ fileList }) {
      this.thumbnailList = fileList;
    },
    handleSelectChange(value) {
      console.log(`Selected: ${value}`);
    },
    handleEditorImgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData();
      formdata.append('file', $file);
      // uploadFile(formdata).then((res) => {
      //   console.log(res);
      //   const url = res.extra;
      //   // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
      //   // $vm.$img2Url 详情见本页末尾
      //   this.$refs.md.$img2Url(pos, url);
      // });
    },
  },
};
</script>
