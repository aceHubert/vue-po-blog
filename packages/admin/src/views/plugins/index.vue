<template>
    <a-card :bordered="false">
        <a-tabs default-active-key="1" @change="callback">
            <a-tab-pane key="1" tab="全部">
                <a-row :gutter="18">
                    <a-col :xs="8" :sm="4" :md="6" :lg="8" :xl="8">
                            <a-row style="border: 1px solid #ccc;padding: 15px" >
                                <a-col span="7">
                                    <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" width="128" height="128">
                                </a-col>
                                <a-col span="13">
                                    <p>Contact Form 7</p>
                                    <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                                    <p>作者: Team Yoast</p>
                                </a-col>
                                <a-col span="3">
                                    <a-button type="primary" >现在安装</a-button>
                                    <a-button type="link">
                                        更新详情
                                    </a-button>
                                </a-col>
                            </a-row>
                    </a-col>
                    <a-col :xs="8" :sm="16" :md="12" :lg="8" :xl="8">
                        <a-row style="border: 1px solid #ccc;padding: 15px">
                            <a-col span="7">
                                <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" width="128" height="128">
                            </a-col>
                            <a-col span="13">
                                <p>Contact Form 7</p>
                                <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                                <p>作者: Team Yoast</p>
                            </a-col>
                            <a-col span="3">
                                <a-button type="primary" >现在安装</a-button>
                                <a-button type="link">
                                    更新详情
                                </a-button>
                            </a-col>
                        </a-row>
                    </a-col>
                    <a-col :xs="8" :sm="4" :md="6" :lg="8" :xl="8">
                        <a-row style="border: 1px solid #ccc;padding: 15px">
                            <a-col span="7">
                                <img src="https://ps.w.org/contact-form-7/assets/icon.svg?rev=2339255" width="128" height="128">
                            </a-col>
                            <a-col span="13">
                                <p>Contact Form 7</p>
                                <p>如何强化您的WordPress SEO：写出更好的内容并且使用Yoast SEO插件全面优化您的WordPress站点。</p>
                                <p>作者: Team Yoast</p>
                            </a-col>
                            <a-col span="3">
                                <a-button type="primary" >现在安装</a-button>
                                <a-button type="link">
                                    更新详情
                                </a-button>
                            </a-col>
                        </a-row>
                    </a-col>
                </a-row>
            </a-tab-pane>
            <a-tab-pane key="2" tab="热门" force-render>
                Content of Tab Pane 2
            </a-tab-pane>
            <a-tab-pane key="3" tab="推荐">
                Content of Tab Pane 3
            </a-tab-pane>
            <a-tab-pane key="4" tab="收藏">
                Content of Tab Pane 3
            </a-tab-pane>
        </a-tabs>
    </a-card>
</template>

<script>
import ARow from "ant-design-vue/es/grid/Row";
import ACol from "ant-design-vue/es/grid/Col";
export default {
    name: "Plugins",
    components: {ACol, ARow},
    methods: {
        callback(key) {
            console.log(key);
        },
    },
}
</script>

<style scoped>

</style>