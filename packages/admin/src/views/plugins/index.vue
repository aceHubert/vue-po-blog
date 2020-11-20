<template>
  <a-card :bordered="false">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="全部">
        <a-row :gutter="18">
          <a-col :xs="8" :sm="4" :md="6" :lg="8" :xl="8">
            <a-card hoverable>
              <a-row type="flex" justify="space-between">
                <a-col :span="5" style="margin: auto 0px">
                  <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" />
                </a-col>
                <a-col :span="13">
                  <p>Contact Form 7</p>
                  <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                  <p>作者: Team Yoast</p>
                </a-col>
                <a-col :span="4">
                  <a-button type="primary">现在安装</a-button>
                  <a-button type="link"> 更新详情 </a-button>
                </a-col>
              </a-row>
              <a-divider />
              <a-row>
                <a-col :span="12">
                  <p><a-rate :default-value="2.5" allow-half /> <span class="ant-rate-text">(122)</span></p>

                  <p>安装: 80000+次</p>
                </a-col>
                <a-col :span="12" style="text-align: right">
                  <p>最后更新: 3月前</p>
                  <p>兼容当前版本</p>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
          <a-col :xs="8" :sm="16" :md="12" :lg="8" :xl="8">
            <a-card hoverable>
              <a-row type="flex" justify="space-between">
                <a-col :span="5" style="margin: auto 0px">
                  <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" />
                </a-col>
                <a-col :span="13">
                  <p>Contact Form 7</p>
                  <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                  <p>作者: Team Yoast</p>
                </a-col>
                <a-col :span="4">
                  <a-button type="primary">现在安装</a-button>
                  <a-button type="link"> 更新详情 </a-button>
                </a-col>
              </a-row>
              <a-divider />
              <a-row>
                <a-col :span="12">
                  <p><a-rate :default-value="2.5" allow-half /> <span class="ant-rate-text">(122)</span></p>

                  <p>安装: 80000+次</p>
                </a-col>
                <a-col :span="12" style="text-align: right">
                  <p>最后更新: 3月前</p>
                  <p>兼容当前版本</p>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
          <a-col :xs="8" :sm="4" :md="6" :lg="8" :xl="8">
            <a-card hoverable>
              <a-row type="flex" justify="space-between">
                <a-col :span="5" style="margin: auto 0px">
                  <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" />
                </a-col>
                <a-col :span="13">
                  <p>Contact Form 7</p>
                  <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                  <p>作者: Team Yoast</p>
                </a-col>
                <a-col :span="4">
                  <a-button type="primary">现在安装</a-button>
                  <a-button type="link"> 更新详情 </a-button>
                </a-col>
              </a-row>
              <a-divider />
              <a-row>
                <a-col :span="12">
                  <p><a-rate :default-value="2.5" allow-half /> <span class="ant-rate-text">(122)</span></p>

                  <p>安装: 80000+次</p>
                </a-col>
                <a-col :span="12" style="text-align: right">
                  <p>最后更新: 3月前</p>
                  <p>兼容当前版本</p>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>
      <a-tab-pane key="2" tab="热门" force-render> Content of Tab Pane 2 </a-tab-pane>
      <a-tab-pane key="3" tab="推荐"> Content of Tab Pane 3 </a-tab-pane>
      <a-tab-pane key="4" tab="收藏"> Content of Tab Pane 3 </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
export default {
  name: 'PluginIndex',
  methods: {
    callback(key) {
      console.log(key);
    },
  },
};
</script>
