import toArray from '@form-create/utils/lib/toarray';
import './style.css';
import {defineComponent, h} from 'vue';

// 内联 SVG 图标组件（确保打包后正常显示）
const ViewIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '1em',
    height: '1em',
    fill: 'currentColor'
}, [
    h('path', { d: 'M512 384c-70.4 0-128 57.6-128 128s57.6 128 128 128 128-57.6 128-128-57.6-128-128-128z m0 320c-105.6 0-192-86.4-192-192s86.4-192 192-192 192 86.4 192 192-86.4 192-192 192z' }),
    h('path', { d: 'M512 192C288 192 102.4 358.4 32 512c70.4 153.6 256 320 480 320s409.6-166.4 480-320c-70.4-153.6-256-320-480-320z m0 576c-176 0-332.8-128-400-256 67.2-128 224-256 400-256s332.8 128 400 256c-67.2 128-224 256-400 256z' })
]);

const DownloadIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '1em',
    height: '1em',
    fill: 'currentColor'
}, [
    h('path', { d: 'M544 684.8V192h-64v492.8l-144-144-44.8 44.8L512 806.4l220.8-220.8-44.8-44.8-144 144zM832 768H192v64h640v-64z' })
]);

const PictureIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '1em',
    height: '1em',
    fill: 'currentColor'
}, [
    h('path', { d: 'M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136V232h752v560z' }),
    h('path', { d: 'M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-112c13.2 0 24 10.8 24 24s-10.8 24-24 24-24-10.8-24-24 10.8-24 24-24z' }),
    h('path', { d: 'M214 747l235-235 108 108 168-168 115 115v180H214z' })
]);

const DocumentIcon = () => h('svg', {
    viewBox: '0 0 1024 1024',
    width: '1em',
    height: '1em',
    fill: 'currentColor'
}, [
    h('path', { d: 'M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zM224 896V128h346v230c0 17.7 14.3 32 32 32h230v506H224z' })
]);

const NAME = 'fcFileList';

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

// 获取文件图标
function getFileIcon(fileName) {
    const type = getFileType(fileName);
    if (type === 'image') return 'Picture';
    if (type === 'pdf') return 'Document';
    return 'Document';
}

// 下载文件（真正的下载，不是打开新窗口）
function downloadFile(url, fileName) {
    // 创建一个隐藏的 a 标签
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = fileName || url.split('/').pop();
    
    // 如果是跨域资源，使用 fetch + blob 方式下载
    if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
        fetch(url)
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
        modelValue: {
            type: Array,
            default: () => []
        },
        showSize: {
            type: Boolean,
            default: true
        },
        showDownload: {
            type: Boolean,
            default: true
        },
        showBatchDownload: {
            type: Boolean,
            default: true
        },
        showDownloadAll: {
            type: Boolean,
            default: true
        },
        showActions: {
            type: Boolean,
            default: true
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        doubleClickPreview: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'preview', 'download'],
    data() {
        return {
            selectedFiles: [],
            previewVisible: false,
            previewUrl: '',
            previewType: ''
        };
    },
    computed: {
        fileList() {
            const list = toArray(this.modelValue);
            
            // 🔥 如果列表为空，返回三条假数据
            if (!list || list.length === 0) {
                return [
                    {
                        name: '屏幕截图 2025-06-17 215830.png',
                        url: 'https://via.placeholder.com/800x600.png?text=Image+1',
                        size: 87720,
                        id: 0,
                        type: 'image',
                        icon: 'Picture',
                        sizeText: '85.66 KB'
                    },
                    {
                        name: '屏幕截图 2025-05-22 155321.png',
                        url: 'https://via.placeholder.com/800x600.png?text=Image+2',
                        size: 156800,
                        id: 1,
                        type: 'image',
                        icon: 'Picture',
                        sizeText: '153.13 KB'
                    },
                    {
                        name: '招标书.pdf',
                        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        size: 294700,
                        id: 2,
                        type: 'pdf',
                        icon: 'Document',
                        sizeText: '287.79 KB'
                    }
                ];
            }
            
            return list.map((file, index) => ({
                ...file,
                id: index,
                type: getFileType(file.name),
                icon: getFileIcon(file.name),
                sizeText: formatFileSize(file.size)
            }));
        },
        hasFiles() {
            return this.fileList.length > 0;
        },
        hasSelection() {
            return this.selectedFiles.length > 0;
        }
    },
    methods: {
        // 选择变化
        handleSelectionChange({records}) {
            this.selectedFiles = records;
        },
        // 双击行预览
        handleRowDblClick({row}) {
            if (this.doubleClickPreview) {
                this.handlePreview(row);
            }
        },
        // 预览文件
        handlePreview(file) {
            this.$emit('preview', file);
      
            if (file.type === 'image') {
                this.previewUrl = file.url;
                this.previewType = 'image';
                this.previewVisible = true;
            } else if (file.type === 'pdf') {
                window.open(file.url, '_blank');
            } else {
                this.handleDownload(file);
            }
        },
        // 下载单个文件
        handleDownload(file) {
            this.$emit('download', file);
            downloadFile(file.url, file.name);
        },
        // 批量下载
        handleBatchDownload() {
            if (!this.hasSelection) {
                this.$message.warning('请先选择要下载的文件');
                return;
            }
            
            this.selectedFiles.forEach((file, index) => {
                // 延迟下载，避免浏览器拦截
                setTimeout(() => {
                    downloadFile(file.url, file.name);
                }, index * 200);
            });
            
            this.$message.success(`开始下载 ${this.selectedFiles.length} 个文件`);
        },
        // 下载全部
        handleDownloadAll() {
            this.fileList.forEach((file, index) => {
                // 延迟下载，避免浏览器拦截
                setTimeout(() => {
                    downloadFile(file.url, file.name);
                }, index * 200);
            });
            
            this.$message.success(`开始下载 ${this.fileList.length} 个文件`);
        },
        // 关闭预览
        handleClosePreview() {
            this.previewVisible = false;
            this.previewUrl = '';
            this.previewType = '';
        },
        // 双击行预览
        handleRowDblClick({row}) {
            if (this.doubleClickPreview) {
                this.handlePreview(row);
            }
        }
    },
    render() {
        // 🔥 移除空状态判断，让假数据也能显示
        return (
            <div class="_fc-file-list">
                {/* 顶部操作栏 */}
                {this.showHeader && (
                    <div class="_fc-file-list-header">
                        {/* 右侧：批量下载和下载全部按钮 */}
                        <div class="_fc-file-list-header-right">
                        {this.showBatchDownload && (
                            <ElButton
                                class="_fc-batch-download-btn"
                                size="small"
                                disabled={!this.hasSelection}
                                onClick={this.handleBatchDownload}
                            >
                                <span class="_fc-btn-icon">{h(DownloadIcon)}</span>
                                批量下载 ({this.selectedFiles.length})
                            </ElButton>
                        )}
                        {this.showDownloadAll && (
                            <ElButton
                                type="primary"
                                size="small"
                                onClick={this.handleDownloadAll}
                            >
                                <span class="_fc-btn-icon">{h(DownloadIcon)}</span>
                                下载全部
                            </ElButton>
                        )}
                    </div>
                </div>
                )}

                {/* VXE Table 文件列表 */}
                <vxe-table
                    ref="tableRef"
                    data={this.fileList}
                    border="none"
                    stripe
                    auto-resize
                    row-config={{keyField: 'id', isHover: true}}
                    column-config={{resizable: true}}
                    checkbox-config={{
                        checkField: 'checked',
                        trigger: 'cell',
                        highlight: true
                    }}
                    onCheckboxChange={this.handleSelectionChange}
                    onCheckboxAll={this.handleSelectionChange}
                    onCellDblclick={this.handleRowDblClick}
                >
                    {/* 复选框列 */}
                    <vxe-column 
                        type="checkbox" 
                        width="50" 
                        align="center"
                        fixed="left"
                    />
                    
                    {/* 文件名列 - 不使用自定义 slot，直接显示字段值 */}
                    <vxe-column
                        field="name"
                        title="文件名"
                        min-width="300"
                        show-overflow
                    />
                    
                    {/* 大小列 */}
                    {this.showSize && (
                        <vxe-column
                            field="sizeText"
                            title="大小"
                            width="100"
                            align="center"
                        />
                    )}
                    
                    {/* 操作列 */}
                    {this.showActions && (
                        <vxe-column
                            title="操作"
                            width="120"
                            align="center"
                            class-name="_fc-file-list-action-column"
                        >
                            {{
                                default: ({row}) => {
                                    if (!row) return null;
                                    return (
                                        <div class="_fc-file-list-row-actions">
                                            <button
                                                class="_fc-action-btn"
                                                title="预览"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handlePreview(row);
                                                }}
                                            >
                                                {h(ViewIcon)}
                                            </button>
                                            {this.showDownload && (
                                                <button
                                                    class="_fc-action-btn"
                                                    title="下载"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        this.handleDownload(row);
                                                    }}
                                                >
                                                    {h(DownloadIcon)}
                                                </button>
                                            )}
                                        </div>
                                    );
                                }
                            }}
                        </vxe-column>
                    )}
                </vxe-table>

                {/* 图片预览对话框 */}
                <ElDialog
                    modelValue={this.previewVisible}
                    title="图片预览"
                    width="800px"
                    onClose={this.handleClosePreview}
                >
                    {this.previewType === 'image' && (
                        <div class="_fc-file-list-preview">
                            <img src={this.previewUrl} alt="预览" />
                        </div>
                    )}
                </ElDialog>
            </div>
        );
    }
});
