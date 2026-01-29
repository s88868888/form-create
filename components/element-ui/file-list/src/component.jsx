import toArray from '@form-create/utils/lib/toarray';
import './style.css';
import {defineComponent, h} from 'vue';
import {Download, Picture, Document, View} from '@element-plus/icons-vue';

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
            return toArray(this.modelValue).map((file, index) => ({
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
    // 全选/取消全选
        handleSelectAll(val) {
            this.selectedFiles = val ? this.fileList.map(f => f.id) : [];
        },
        // 单选
        handleSelectionChange(selection) {
            this.selectedFiles = selection.map(f => f.id);
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
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        // 批量下载
        handleBatchDownload() {
            const selectedFileList = this.fileList.filter(f => this.selectedFiles.includes(f.id));
            selectedFileList.forEach(file => {
                setTimeout(() => this.handleDownload(file), 100);
            });
        },
        // 下载全部
        handleDownloadAll() {
            this.fileList.forEach(file => {
                setTimeout(() => this.handleDownload(file), 100);
            });
        },
        // 关闭预览
        handleClosePreview() {
            this.previewVisible = false;
            this.previewUrl = '';
            this.previewType = '';
        }
    },
    render() {
        if (!this.hasFiles) {
            return (
                <div class="_fc-file-list-empty">
                    <ElEmpty description="暂无附件" />
                </div>
            );
        }

        return (
            <div class="_fc-file-list">
                {/* 操作栏 */}
                {(this.showBatchDownload || this.showDownloadAll) && (
                    <div class="_fc-file-list-toolbar">
                        {this.showBatchDownload && (
                            <ElButton
                                type="primary"
                                size="small"
                                disabled={!this.hasSelection}
                                onClick={this.handleBatchDownload}
                            >
                                <ElIcon>{h(Download)}</ElIcon>
                                <span>批量下载 ({this.selectedFiles.length})</span>
                            </ElButton>
                        )}
                        {this.showDownloadAll && (
                            <ElButton
                                type="primary"
                                size="small"
                                onClick={this.handleDownloadAll}
                            >
                                <ElIcon>{h(Download)}</ElIcon>
                                <span>下载全部</span>
                            </ElButton>
                        )}
                    </div>
                )}

                {/* 文件列表 */}
                <ElTable
                    data={this.fileList}
                    stripe
                    onSelectionChange={this.handleSelectionChange}
                >
                    <ElTableColumn
                        type="selection"
                        width="55"
                        v-show={this.showBatchDownload}
                    />
                    <ElTableColumn
                        label="文件名"
                        minWidth="200"
                        v-slots={{
                            default: ({row}) => (
                                <div class="_fc-file-list-name">
                                    <ElIcon size={20}>{h(row.icon === 'Picture' ? Picture : Document)}</ElIcon>
                                    <span class="_fc-file-list-name-text" title={row.name}>
                                        {row.name}
                                    </span>
                                </div>
                            )
                        }}
                    />
                    {this.showSize && (
                        <ElTableColumn
                            label="大小"
                            width="100"
                            prop="sizeText"
                        />
                    )}
                    <ElTableColumn
                        label="操作"
                        width="150"
                        v-slots={{
                            default: ({row}) => (
                                <div class="_fc-file-list-actions">
                                    <ElButton
                                        type="primary"
                                        link
                                        size="small"
                                        onClick={() => this.handlePreview(row)}
                                    >
                                        <ElIcon>{h(View)}</ElIcon>
                                        <span>预览</span>
                                    </ElButton>
                                    {this.showDownload && (
                                        <ElButton
                                            type="primary"
                                            link
                                            size="small"
                                            onClick={() => this.handleDownload(row)}
                                        >
                                            <ElIcon>{h(Download)}</ElIcon>
                                            <span>下载</span>
                                        </ElButton>
                                    )}
                                </div>
                            )
                        }}
                    />
                </ElTable>

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
