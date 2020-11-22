<template>
  <a-card :bordered="false">
    <a-tabs default-active-key="1" @change="callback">
      <a-tab-pane key="1" tab="全部">
        <a-row :gutter="18">
          <a-col :xs="8" :sm="4" :md="6" :lg="8" :xl="8" v-for="item in rows">
            <a-card hoverable>
              <a-row type="flex" justify="space-between">
                <a-col :span="5" style="margin: auto 0px">
                  <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" />
                </a-col>
                <a-col :span="13">
                  <p>{{ item.title }}</p>
                  <p>{{ item.description }}</p>
                  <p>作者: {{ item.userName }}</p>
                </a-col>
                <a-col :span="4">
                  <a-button type="primary" @click="downloadPlugin(item.pluginId)">现在安装</a-button>
                  <a-button type="link" @click="handleOk"> 更新详情 </a-button>
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

    <a-modal v-model="visible" title="插件详情" @ok="handleOk" okText="立刻安装" cancelText="取消" :width="880">
      <a-row>
        <a-col>
          <div
            style="
              background-image: url('https://ov-blog.oss-cn-hangzhou.aliyuncs.com/blog/image-20201110093943087.png');
              width: 100%;
              height: 250px;
              text-align: center;
              color: #fff;
              font-weight: 900;
            "
          >
            <span
              style="
                background-color: #13c2c2;
                font-size: 30px;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
                padding: 0 15px;
                border-radius: 10px;
              "
              >Contact Form 7</span
            >
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-tabs>
            <a-tab-pane key="1" tab="插件描述">
              经典编辑器是由WordPress团队维护的官方插件，用以恢复较早版本（“经典”）的WordPress编辑器和“编辑文章”页面。此插件亦能供其他扩展该页、加入旧式meta
              box及其他依赖经典编辑器的插件使用。
              经典编辑器是一个WordPress官方插件，会被支持及维护到至少2022年，或视需要延长。
              总的来说，这个扩展加入了以下功能： 管理员可以为所有用户设置默认编辑器。
              管理员可以允许用户修改他们的默认编辑器。 如果允许，则用户可自由选择为每篇文章使用何种编辑器。
              无论由谁最后编辑，每篇文章都会以最后使用的编辑器打开。因为这能让编辑内容时的使用体验保持一致。
              除此之外，传统编辑器插件包含了数个过滤器，能够让其他插件控制相关设置，亦能选择每篇文章或每种文章类型的编辑器选择。
              By default, this plugin hides all functionality available in the new block editor
              (“Gutenberg”).</a-tab-pane
            >
            <a-tab-pane key="2" tab="更新日志"> Content of tab 2 </a-tab-pane>
            <a-tab-pane key="3" tab="插件预览"> Content of tab 3 </a-tab-pane>
            <a-tab-pane key="4" tab="插件评价"> Content of tab 3 </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </a-modal>
  </a-card>
</template>

<script>
import { pluginApi } from '@/includes/datas';
export default {
  name: 'PluginIndex',
  data() {
    return {
      visible: false,
      rows: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    callback(key) {
      console.log(key);
    },
    handleOk() {
      this.visible = true;
    },
    getList() {
      pluginApi.getList().then((res) => {
        console.log(res);
        this.rows = res.rows;
      });
    },
    downloadPlugin(pluginId) {
      pluginApi.downloadPlugin(pluginId).then((res) => {
        const { success } = res;
        if (success === 1) {
          this.$notification.success({
            message: '插件安装成功',
          });
        }
      });
    },
  },
};
</script>
