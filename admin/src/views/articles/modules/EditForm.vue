<template>
  <a-form :form="form" class="article-form">
    <a-row :gutter="16">
      <a-col :lg="24" :md="12" :sm="24">
        <a-form-item :label="$tv('articleFormTitle', 'Title')">
          <a-input
            style="width: 220px; max-width: 100%"
            :placeholder="$tv('articleFormTitlePlaceholder', 'Please input title')"
            v-decorator="['title', { rules: rules.title }]"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :lg="24" :md="12" :sm="24">
        <a-form-item :label="$tv('articleFormSummary', 'Summary')">
          <a-textarea
            style="width: 500px; max-width: 100%"
            :placeholder="$tv('articleFormSummaryPlaceholder', 'Please input summary')"
            v-decorator="['summary', { rules: rules.summary }]"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :lg="24" :md="12" :sm="24">
        <a-form-item :label="$tv('articleFormThumbnail', 'Thumbnail')">
          <a-upload
            action="/api/plumemo-server/v1/file/upload/"
            class="upload-list-inline"
            list-type="picture-card"
            :default-file-list="defaultThumbnailList"
            :before-upload="beforeThumbnailUpload"
            @change="handleThumbnailChange"
            v-decorator="['thumbnail']"
          >
            <template v-if="!thumbnailList.length">
              <a-icon type="plus" />
              <div class="ant-upload-text">{{ $tv('upload', 'Upload') }}</div>
            </template>
          </a-upload>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :lg="8" :md="12" :sm="24">
        <a-form-item :label="$tv('articleFormCategory', 'Category')">
          <a-select
            mode="multiple"
            style="width: 220px"
            :placeholder="$tv('articleFormCategoryPlaceholder', 'Please choose category')"
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
        <a-form-item :label="$tv('articleFormTag', 'Tag')">
          <a-select
            mode="tags"
            style="width: 220px"
            :placeholder="$tv('articleFormCategoryPlaceholder', 'Please choose tag')"
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
      <a-col :lg="24" :md="12" :sm="24">
        <a-form-item :label="$tv('articleFormContent', 'Content')">
          <MavonEditor
            ref="md"
            :toolbars="markdownOption"
            :box-shadow="false"
            :subfield="false"
            :ishljs="true"
            :placeholder="$tv('articleFormContentPlaceholder', 'Please input content')"
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
      defaultThumbnailList: [],
      thumbnailList: [],
      markdownOption: markdownOption,
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, {
      name: 'article_form',
      props: {
        title: String,
      },
    });
  },
  created() {
    this.rules = {
      title: [
        {
          required: true,
          message: this.$tv('articleFormTitleRequired', 'Please input article title'),
          whitespace: true,
        },
      ],
      summary: [
        {
          required: this.summaryRequired,
          message: this.$tv('articleFormSummaryRequired', 'Please input article summary'),
          whitespace: true,
        },
      ],
      content: [{ required: true, message: this.$tv('articleFormContentRequired', 'Please input article content') }],
    };
  },
  mounted() {
    const { thumbnail, ...restVals } = this.defaultValues;
    if (thumbnail) {
      this.defaultThumbnailList = Array.isArray(model.thumbnail)
        ? model.thumbnail
        : model.thumbnail
        ? [model.thumbnail]
        : [];
    }
    // 初始值，必须在确保对应的 field 已经用 getFieldDecorator 或 v-decorator 注册过了
    const model = Object.assign(
      { title: '', thumbnail: { file: null, fileList: [] }, categoryIds: [], tags: [], content: '' },
      restVals,
    );
    this.form.setFieldsValue(model);
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
            pureValues.thumbnail = null;
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
