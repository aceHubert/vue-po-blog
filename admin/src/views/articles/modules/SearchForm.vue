<template>
  <div class="table-page-search-wrapper">
    <a-form layout="inline">
      <a-row :gutter="48">
        <a-col :md="8" :sm="24">
          <a-form-item :label="$t('article.search.title')">
            <a-input v-model="queryParam.title" :placeholder="$t('article.search.titlePlaceholder')" />
          </a-form-item>
        </a-col>
        <a-col :md="8" :sm="24">
          <a-form-item :label="$t('article.search.status')">
            <a-select v-model="queryParam.status" :placeholder="$t('article.search.statusPlaceholder')">
              <a-select-option v-for="option in statusOptions" :key="option.value" :value="option.value">{{
                option.label
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <template v-show="advanced">
          <a-col :md="8" :sm="24">
            <!-- <a-form-item label="创建时间">
              <a-date-picker @change="dateChange" style="width: 100%" placeholder="请选择日期" />
            </a-form-item> -->
          </a-col>
          <!-- <a-col :md="8" :sm="24">
            <a-form-item label="同步状态">
              <a-select v-model="queryParam.isPublishByteBlogs" placeholder="请选择" default-value="">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">未同步</a-select-option>
                <a-select-option value="1">已同步</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
        </template>
        <a-col :md="(!advanced && 8) || 24" :sm="24">
          <span
            class="table-page-search-submitButtons"
            :style="(advanced && { float: 'right', overflow: 'hidden' }) || {}"
          >
            <a-button type="primary" @click="handlerSearch">{{ $t('common.btn.search') }}</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">{{ $t('common.btn.reset') }}</a-button>
            <a @click="toggleAdvanced" style="margin-left: 8px">
              {{ $t(`common.btn.${advanced ? 'collapse' : 'expand'}`) }}
              <a-icon :type="advanced ? 'up' : 'down'" />
            </a>
          </span>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
import { ArticleStatus } from '@/includes/datas/enums';

export default {
  name: 'ArticleSearch',
  props: {
    title: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: null,
    },
    createTime: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        title: this.title,
        status: this.status,
        createTime: this.createTime,
      },
    };
  },
  computed: {
    statusOptions() {
      return [
        {
          value: null,
          label: this.$t('article.status.all'),
        },
        {
          value: ArticleStatus.published,
          label: this.$t('article.status.published'),
        },
        {
          value: ArticleStatus.draft,
          label: this.$t('article.status.draft'),
        },
      ];
    },
  },
  methods: {
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    dateChange(date, dateString) {
      if (dateString !== '') {
        this.queryParam.createTime = new Date(dateString[0]).getTime();
      } else {
        this.queryParam.createTime = null;
      }
    },
    handleReset() {
      this.queryParam = {
        title: this.title,
        status: this.status,
        createTime: this.createTime,
      };
    },
    handlerSearch() {
      this.$emit('search', this.queryParam);
    },
  },
};
</script>
