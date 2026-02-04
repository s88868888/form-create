import toArray from '@form-create/utils/lib/toarray';
import { defineComponent, ref, computed, h } from 'vue';
import './fileList.css';

const NAME = 'fcFileList';

// 内联 SVG 图标组件（确保打包后正常显示）
const PhotoIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '40px',
    height: '40px',
    fill: '#1989fa',
    style: { display: 'block' }
}, [
    h('path', { d: 'M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136V232h752v560z' }),
    h('path', { d: 'M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-112c13.2 0 24 10.8 24 24s-10.8 24-24 24-24-10.8-24-24 10.8-24 24-24z' }),
    h('path', { d: 'M214 747l235-235 108 108 168-168 115 115v180H214z' })
]);

const DocumentIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '40px',
    height: '40px',
    fill: '#1989fa',
    style: { display: 'block' }
}, [
    h('path', { d: 'M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zM224 896V128h346v230c0 17.7 14.3 32 32 32h230v506H224z' })
]);

// 获取文件类型
function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExts = ['pdf'];
  
    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    return 'other';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    formCreateParser: {
        toFormValue(value) {
            return toArray(value);
        },
        toValue(formValue) {
            return formValue;
        }
    },
    props: {
        formCreateInject: Object,
        modelValue: {
            type: Array,
            default: () => []
        },
        showSize: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue', 'preview', 'download'],
    setup(props, { emit }) {
        const previewVisible = ref(false);
        const previewImages = ref([]);
        const previewStartPosition = ref(0);

        const fileList = computed(() => {
            const list = toArray(props.modelValue);
            
            // 如果列表为空，返回空数组
            if (!list || list.length === 0) {
                return [];
            }
            
            return list.map((file, index) => ({
                ...file,
                id: index,
                type: getFileType(file.name),
                sizeText: formatFileSize(file.size)
            }));
        });

        // 预览文件
        const handlePreview = (file) => {
            emit('preview', file);
      
            if (file.type === 'image') {
                // 图片预览 - 使用 Vant 的 ImagePreview
                const images = fileList.value.filter(f => f.type === 'image');
                previewImages.value = images.map(f => f.url);
                previewStartPosition.value = images.findIndex(f => f.id === file.id);
                previewVisible.value = true;
            } else if (file.type === 'pdf') {
                // 检测是否在微信小程序 webview 中
                const isWxMiniProgram = window.__wxjs_environment === 'miniprogram' || 
                                       /miniProgram/i.test(navigator.userAgent) ||
                                       !!(window.wx && window.wx.miniProgram);

                if (isWxMiniProgram && window.wx && window.wx.miniProgram) {
                    // 在微信小程序中，跳转到 PDF 预览页面
                    console.log('=== 跳转到小程序 PDF 预览页面 ===');
                    console.log('PDF URL:', file.url);
                    
                    window.wx.miniProgram.navigateTo({
                        url: `/pages/pdf-preview/index?url=${encodeURIComponent(file.url)}`
                    });
                } else {
                    // 普通浏览器环境，直接打开新窗口
                    window.open(file.url, '_blank');
                }
            }
        };

        // 下载文件（通过小程序或浏览器）
        const handleDownload = (file) => {
            console.log('=== 下载按钮被点击 ===', file);
            emit('download', file);

            // 检测是否在微信小程序 webview 中
            const isWxMiniProgram = window.__wxjs_environment === 'miniprogram' || 
                                   /miniProgram/i.test(navigator.userAgent) ||
                                   !!(window.wx && window.wx.miniProgram);

            if (isWxMiniProgram && window.wx && window.wx.miniProgram) {
                // 在微信小程序中，通过 postMessage 通知小程序下载
                try {
                    window.wx.miniProgram.postMessage({
                        data: {
                            action: 'downloadFile',
                            url: file.url,
                            fileName: file.name,
                            timestamp: Date.now()
                        }
                    });
                    console.log('✅ 已通知小程序下载文件:', file.name);
                    
                    // 显示提示并自动返回触发下载
                    if (window.confirm('文件将在返回时开始下载，是否立即返回？\n\n文件名: ' + file.name)) {
                        // 用户点击确定，立即返回触发下载
                        setTimeout(() => {
                            window.wx.miniProgram.navigateBack({ delta: 1 });
                        }, 100);
                    } else {
                        // 用户点击取消，显示提示
                        alert('已加入下载队列，返回上一页时将自动下载');
                    }
                } catch (error) {
                    console.error('❌ 通知小程序下载失败:', error);
                    alert('下载失败: ' + error.message);
                }
                return;
            }

            // 检测是否在 uni-app webview 中
            if (window.uni && window.uni.postMessage) {
                try {
                    window.uni.postMessage({
                        data: {
                            action: 'downloadFile',
                            url: file.url,
                            fileName: file.name,
                            timestamp: Date.now()
                        }
                    });
                    console.log('✅ 已通知 uni-app 下载文件:', file.name);
                    
                    // uni-app 的 postMessage 也需要返回才能触发
                    if (window.confirm('文件将在返回时开始下载，是否立即返回？\n\n文件名: ' + file.name)) {
                        setTimeout(() => {
                            window.uni.navigateBack({ delta: 1 });
                        }, 100);
                    } else {
                        alert('已加入下载队列，返回上一页时将自动下载');
                    }
                    return;
                } catch (error) {
                    console.error('❌ 通知 uni-app 下载失败:', error);
                    alert('下载失败: ' + error.message);
                }
            }

            // 普通浏览器环境，使用原有的下载逻辑
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = file.url;
            link.download = file.name || file.url.split('/').pop();

            // 如果是跨域资源，使用 fetch + blob 方式下载
            if (file.url.startsWith('http') && !file.url.startsWith(window.location.origin)) {
                fetch(file.url)
                    .then(response => response.blob())
                    .then(blob => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        link.href = blobUrl;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    })
                    .catch(() => {
                        // 如果 fetch 失败（可能是跨域），回退到直接下载
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
            } else {
                // 同源资源直接下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        // 关闭预览
        const handleClosePreview = () => {
            previewVisible.value = false;
        };

        return {
            fileList,
            previewVisible,
            previewImages,
            previewStartPosition,
            handlePreview,
            handleDownload,
            handleClosePreview
        };
    },
    render() {
        // 🔥 如果没有文件，不渲染任何内容
        if (!this.fileList || this.fileList.length === 0) {
            return null;
        }

        return (
            <div class="_fc-file-list-mobile">
                {this.fileList.map((file) => (
                    <div
                        key={file.id}
                        class="_fc-file-list-mobile-item"
                        onClick={() => this.handlePreview(file)}
                    >
                        {/* 文件图标 */}
                        <div class="_fc-file-list-mobile-icon">
                            {file.type === 'image' ? (
                                <van-image
                                    width="40"
                                    height="40"
                                    src={file.url}
                                    fit="cover"
                                    radius="4"
                                    error-icon="photo-fail"
                                    loading-icon="photo"
                                >
                                    {{
                                        error: () => h(PhotoIcon),
                                        loading: () => h(PhotoIcon)
                                    }}
                                </van-image>
                            ) : (
                                h(DocumentIcon)
                            )}
                        </div>

                        {/* 文件信息 */}
                        <div class="_fc-file-list-mobile-content">
                            <div class="_fc-file-list-mobile-name">{file.name}</div>
                            {this.showSize && (
                                <div class="_fc-file-list-mobile-size">{file.sizeText}</div>
                            )}
                        </div>

                        {/* 下载按钮 */}
                        <div
                            class="_fc-file-list-mobile-action"
                            onClick={(e) => {
                                e.stopPropagation();
                                this.handleDownload(file);
                            }}
                        >
                            <van-icon name="down" size="16" color="#969799" />
                        </div>
                    </div>
                ))}

                {/* 图片预览 */}
                <van-image-preview
                    v-model:show={this.previewVisible}
                    images={this.previewImages}
                    startPosition={this.previewStartPosition}
                    onClose={this.handleClosePreview}
                    teleport="body"
                    z-index={3000}
                />
            </div>
        );
    }
});
