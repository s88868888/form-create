import { h, resolveComponent } from 'vue';

export default {
    name: 'FcElTable',
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
        size: String,
        height: [String, Number],
        maxHeight: [String, Number],
        fit: {
            type: Boolean,
            default: true
        },
        highlightCurrentRow: {
            type: Boolean,
            default: false
        },
        emptyText: String,
        defaultSort: Object,
        tooltipEffect: {
            type: String,
            default: 'dark'
        },
        showSummary: {
            type: Boolean,
            default: false
        },
        sumText: String,
        summaryMethod: Function,
        rowClassName: [String, Function],
        rowStyle: [Object, Function],
        cellClassName: [String, Function],
        cellStyle: [Object, Function],
        headerRowClassName: [String, Function],
        headerRowStyle: [Object, Function],
        headerCellClassName: [String, Function],
        headerCellStyle: [Object, Function],
        showOverflowTooltip: Boolean,
        spanMethod: Function,
        selectOnIndeterminate: {
            type: Boolean,
            default: true
        },
        indent: {
            type: Number,
            default: 16
        },
        lazy: Boolean,
        load: Function,
        treeProps: {
            type: Object,
            default: () => ({
                hasChildren: 'hasChildren',
                children: 'children'
            })
        }
    },
    emits: [
        'update:modelValue',
        'select',
        'select-all',
        'selection-change',
        'cell-mouse-enter',
        'cell-mouse-leave',
        'cell-click',
        'cell-dblclick',
        'row-click',
        'row-contextmenu',
        'row-dblclick',
        'header-click',
        'header-contextmenu',
        'sort-change',
        'filter-change',
        'current-change',
        'header-dragend',
        'expand-change'
    ],
    setup(props, { emit }) {
        // 表格数据
        const tableData = () => {
            const result = props.modelValue && props.modelValue.length > 0 
                ? props.modelValue 
                : props.data || [];
            return result;
        };

        // 表格列配置
        const tableColumns = () => {
            if (!props.columns || props.columns.length === 0) {
                return [];
            }
            return props.columns.map(col => ({
                prop: col.prop || col.field,
                label: col.label || col.title,
                width: col.width,
                minWidth: col.minWidth,
                fixed: col.fixed,
                sortable: col.sortable,
                align: col.align,
                headerAlign: col.headerAlign,
                showOverflowTooltip: col.showOverflowTooltip !== undefined ? col.showOverflowTooltip : props.showOverflowTooltip,
                ...col
            }));
        };

        return {
            tableData,
            tableColumns
        };
    },
    render() {
        const { tableData, tableColumns } = this;
        
        // 检查是否安装了 element-plus
        let ElTable, ElTableColumn;
        try {
            ElTable = resolveComponent('ElTable');
            ElTableColumn = resolveComponent('ElTableColumn');
        } catch (e) {
            // 组件未注册，使用降级模式
        }
        
        if (!ElTable || !ElTableColumn) {
            // 如果没有安装 element-plus，使用简单的表格预览
            return h('div', {
                class: '_fc-el-table-fallback',
                style: {
                    border: '1px solid #EBEEF5',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }
            }, [
                // 表头
                this.showHeader && h('div', {
                    style: {
                        display: 'flex',
                        background: '#F5F7FA',
                        fontWeight: '500',
                        color: '#909399',
                        borderBottom: '1px solid #EBEEF5'
                    }
                }, tableColumns().map(col => h('div', {
                    key: col.prop,
                    style: {
                        flex: 1,
                        padding: '12px 10px',
                        textAlign: col.align || 'left',
                        width: col.width ? col.width + 'px' : 'auto',
                        minWidth: col.minWidth ? col.minWidth + 'px' : 'auto'
                    }
                }, col.label))),
                // 表体
                h('div', {
                    style: {
                        minHeight: '100px'
                    }
                }, tableData().length > 0 ? tableData().map((row, idx) => 
                    h('div', {
                        key: idx,
                        style: {
                            display: 'flex',
                            borderBottom: '1px solid #EBEEF5',
                            background: this.stripe && idx % 2 === 1 ? '#FAFAFA' : '#fff'
                        }
                    }, tableColumns().map(col => h('div', {
                        key: col.prop,
                        style: {
                            flex: 1,
                            padding: '12px 10px',
                            textAlign: col.align || 'left',
                            width: col.width ? col.width + 'px' : 'auto',
                            minWidth: col.minWidth ? col.minWidth + 'px' : 'auto'
                        }
                    }, row[col.prop] || '-')))
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

        // 使用真实的 el-table 组件
        const columnVNodes = tableColumns().map(col => {
            const columnProps = {
                key: col.prop,
                prop: col.prop,
                label: col.label,
                width: col.width,
                minWidth: col.minWidth,
                fixed: col.fixed,
                sortable: col.sortable,
                align: col.align,
                headerAlign: col.headerAlign,
                showOverflowTooltip: col.showOverflowTooltip,
                formatter: col.formatter,
                className: col.className,
                labelClassName: col.labelClassName,
                filters: col.filters,
                filterMethod: col.filterMethod,
                filteredValue: col.filteredValue,
                filterPlacement: col.filterPlacement,
                filterMultiple: col.filterMultiple,
                columnKey: col.columnKey,
                resizable: col.resizable,
                renderHeader: col.renderHeader
            };

            // 如果有自定义渲染函数
            if (col.render) {
                return h(ElTableColumn, columnProps, {
                    default: (scope) => col.render(h, scope)
                });
            }

            return h(ElTableColumn, columnProps);
        });

        // 构建 el-table 的 props
        const tableProps = {
            data: tableData(),
            border: this.border,
            stripe: this.stripe,
            showHeader: this.showHeader,
            size: this.size,
            height: this.height,
            maxHeight: this.maxHeight,
            fit: this.fit,
            highlightCurrentRow: this.highlightCurrentRow,
            emptyText: this.emptyText,
            defaultSort: this.defaultSort,
            tooltipEffect: this.tooltipEffect,
            showSummary: this.showSummary,
            sumText: this.sumText,
            summaryMethod: this.summaryMethod,
            rowClassName: this.rowClassName,
            rowStyle: this.rowStyle,
            cellClassName: this.cellClassName,
            cellStyle: this.cellStyle,
            headerRowClassName: this.headerRowClassName,
            headerRowStyle: this.headerRowStyle,
            headerCellClassName: this.headerCellClassName,
            headerCellStyle: this.headerCellStyle,
            spanMethod: this.spanMethod,
            selectOnIndeterminate: this.selectOnIndeterminate,
            indent: this.indent,
            lazy: this.lazy,
            load: this.load,
            treeProps: this.treeProps
        };

        // 绑定所有事件
        const events = {};
        this.$options.emits.forEach(event => {
            if (event !== 'update:modelValue') {
                events[`on${event.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`] = (...args) => {
                    this.$emit(event, ...args);
                };
            }
        });

        return h(ElTable, {
            ...tableProps,
            ...events
        }, {
            default: () => columnVNodes,
            empty: this.emptyText ? () => h('span', this.emptyText) : undefined
        });
    }
};
