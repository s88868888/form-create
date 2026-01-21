/*
 * @Author       : djkloop
 * @Date         : 2020-08-15 21:39:28
 * @LastEditors  : djkloop
 * @LastEditTime : 2020-08-15 22:01:32
 * @Description  : 头部注释
 * @FilePath     : /form-create2/packages/element-ui/examples/main.js
 */
import {createApp,h, defineComponent} from 'vue'
import Info from "@element-plus/icons-vue/dist/es/info-filled.mjs"
import FormCreate from '../src'
import install from '../auto-import'
import App from './App.vue'

const app = createApp(App)

// 尝试引入 VXE Table（如果已安装）
try {
    const VxeUI = require('vxe-pc-ui');
    const VxeTable = require('vxe-table');
    require('vxe-pc-ui/lib/style.css');
    require('vxe-table/lib/style.css');
    app.use(VxeUI.default || VxeUI);
    app.use(VxeTable.default || VxeTable);
} catch (e) {
    console.warn('VXE Table not installed. FcVxeTable will use fallback mode.');
}

FormCreate.use(install);
app.use(FormCreate);
app.component('info', Info);



//todo ------------------ Demo 用 ------------------

// import VJsoneditor from 'v-jsoneditor'
import addressEffect from './addressEffect';
import wangEditor from '@form-create/component-wangeditor/src'


// app.use(VJsoneditor)
FormCreate.register(addressEffect);
FormCreate.component('wangEditor', wangEditor);

//自定义组件
FormCreate.component('testSlot', defineComponent({
    render() {
        return h('div',{}, this.$slots.test());
    }
}))

//todo ------------------ Demo 用 ------------------

app.mount('#app')
