import { h, computed, resolveComponent } from 'vue';

export default {
    name: 'FcVxeTable',
    props: {
        modelValue: {
            type: Array,
            default: () => []
        },
        columns: {
            type: Array,
            default: () => []
        },
        data: {
            type: Array,
            default: () => []
        },
        border: {
            type: Boolean,
            default: true
        },
        stripe: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        align: {
            type: String,
            default: 'left'
        },
        headerAlign: {
            type: String,
            default: 'left'
        },
        showOverflow: {
            type: [Boolean, String],
            default: 'tooltip'
        },
        showHeaderOverflow: {
            type: [Boolean, String],
            default: 'tooltip'
        },
        highlightCurrentRow: {
            type: Boolean,
            default: false
        },
        highlightHoverRow: {
            type: Boolean,
            default: true
        },
        emptyText: {
            type: String,
            default: ''
        },
        resizable: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        // 表格数据
        const tableData = computed(() => {
            const result = props.modelValue && props.modelValue.length > 0 
                ? props.modelValue 
                : props.data || [];
            return result;
        });

        // 表格列配置
        const tableColumns = computed(() => {
            if (!props.columns || props.columns.length === 0) {
                return [];
            }
            return props.columns.map(col => ({
                field: col.field || col.value,
                title: col.title || col.label,
                width: col.width,
                minWidth: col.minWidth,
                align: col.align || props.align,
                sortable: col.sortable || false,
                ...col
            }));
        });

        return {
            tableData,
            tableColumns
        };
    },
    render() {
        const { tableData, tableColumns } = this;
        
        // 检查是否安装了 vxe-table
        let VxeTable, VxeColumn;
        try {
            VxeTable = resolveComponent('VxeTable');
            VxeColumn = resolveComponent('VxeColumn');
        } catch (e) {
            // 组件未注册，使用降级模式
        }
        
        if (!VxeTable || !VxeColumn) {
            // 如果没有安装 vxe-table，使用简单的表格预览
            // 计算单元格样式的辅助函数
            const getCellStyle = (col, defaultAlign) => {
                const style = {
                    padding: '12px 10px',
                    textAlign: col.align || defaultAlign,
                    boxSizing: 'border-box'
                };
                
                // 如果设置了固定宽度，使用固定宽度并禁止伸缩
                if (col.width) {
                    style.width = typeof col.width === 'number' ? col.width + 'px' : col.width;
                    style.flex = 'none';
                } 
                // 如果只设置了最小宽度，允许伸缩但有最小宽度限制
                else if (col.minWidth) {
                    style.minWidth = typeof col.minWidth === 'number' ? col.minWidth + 'px' : col.minWidth;
                    style.flex = '1';
                }
                // 如果都没设置，自动填充剩余空间
                else {
                    style.flex = '1';
                }
                
                return style;
            };
            
            return h('div', {
                class: '_fc-vxe-table-fallback',
                style: {
                    border: '1px solid #dcdfe6',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    width: '100%'
                }
            }, [
                // 表头
                this.showHeader && h('div', {
                    style: {
                        display: 'flex',
                        background: '#f5f7fa',
                        fontWeight: '500',
                        borderBottom: '1px solid #ebeef5'
                    }
                }, tableColumns.map(col => h('div', {
                    key: col.field,
                    style: getCellStyle(col, this.headerAlign)
                }, col.title))),
                // 表体
                h('div', {
                    style: {
                        minHeight: '100px'
                    }
                }, tableData.length > 0 ? tableData.map((row, idx) => 
                    h('div', {
                        key: idx,
                        style: {
                            display: 'flex',
                            borderBottom: '1px solid #ebeef5',
                            background: this.stripe && idx % 2 === 1 ? '#fafafa' : '#fff'
                        }
                    }, tableColumns.map(col => h('div', {
                        key: col.field,
                        style: getCellStyle(col, this.align)
                    }, row[col.field] || '-')))
                ) : [
                    h('div', {
                        style: {
                            padding: '40px 0',
                            textAlign: 'center',
                            color: '#909399'
                        }
                    }, this.emptyText || '暂无数据')
                ])
            ]);
        }

        // 使用真实的 vxe-table 组件，通过 VxeColumn 定义列
        const columnVNodes = tableColumns.map(col => {
            return h(VxeColumn, {
                key: col.field,
                field: col.field,
                title: col.title,
                width: col.width,
                minWidth: col.minWidth,
                align: col.align,
                sortable: col.sortable
            });
        });

        return h(VxeTable, {
            data: tableData,
            border: this.border,
            stripe: this.stripe,
            showHeader: this.showHeader,
            loading: this.loading,
            align: this.align,
            headerAlign: this.headerAlign,
            showOverflow: this.showOverflow,
            showHeaderOverflow: this.showHeaderOverflow,
            highlightCurrentRow: this.highlightCurrentRow,
            highlightHoverRow: this.highlightHoverRow,
            columnConfig: {
                resizable: this.resizable
            },
            style: {
                width: '100%'
            }
        }, {
            default: () => columnVNodes,
            empty: this.emptyText ? () => h('span', this.emptyText) : undefined
        });
    }
};
