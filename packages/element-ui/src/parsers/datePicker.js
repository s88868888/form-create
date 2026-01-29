import {creatorFactory} from '@form-create/core/src/index';

const DEFAULT_FORMATS = {
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    week: 'YYYY-wo',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    timerange: 'HH:mm:ss',
    daterange: 'YYYY-MM-DD',
    monthrange: 'YYYY-MM',
    datetimerange: 'YYYY-MM-DD HH:mm:ss',
    year: 'YYYY'
};

const name = 'datePicker';

/**
 * 检测字符串是否为 ISO 8601 格式
 * @param {string} str - 要检测的字符串
 * @returns {boolean} 是否为 ISO 8601 格式
 */
function isISO8601(str) {
    if (typeof str !== 'string') return false;
    // 检查 ISO 8601 格式：YYYY-MM-DDTHH:mm:ss[.sss][Z|±HH:mm]
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/.test(str);
}

/**
 * 格式化日期对象为指定格式字符串
 * @param {Date} date - Date 对象
 * @param {string} format - 格式字符串（支持 YYYY, MM, DD, HH, mm, ss）
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

export default {
    name,
    maker: (function () {
        return ['year', 'month', 'date', 'dates', 'week', 'datetime', 'datetimeRange', 'dateRange', 'monthRange'].reduce((initial, type) => {
            initial[type] = creatorFactory(name, {type: type.toLowerCase()});
            return initial
        }, {});
    }()),
    mergeProp(ctx) {
        const props = ctx.prop.props;
        if (!props.valueFormat) {
            props.valueFormat = DEFAULT_FORMATS[props.type] || DEFAULT_FORMATS['date'];
        }
    },
    toFormValue(value, ctx) {
        // 任务 2.2: 输入值类型检查和早期返回
        // 处理 null、undefined 或空字符串
        if (value == null || value === '') {
            return value;
        }
        
        // 非字符串类型直接返回（可能是 Date 对象或数组）
        if (typeof value !== 'string') {
            return value;
        }
        
        // 不是 ISO 8601 格式则返回原值
        if (!isISO8601(value)) {
            return value;
        }
        
        // 任务 2.3 & 2.4: ISO 8601 格式解析和转换逻辑（带错误处理）
        try {
            // 解析 ISO 8601 字符串
            const date = new Date(value);
            
            // 检查解析结果是否有效
            if (isNaN(date.getTime())) {
                console.warn('[datePicker] Failed to parse ISO 8601 date:', value);
                return value;
            }
            
            // 获取组件的 type 属性
            const type = ctx.prop.props.type || 'date';
            
            // 根据 type 确定目标格式
            const targetFormat = DEFAULT_FORMATS[type] || DEFAULT_FORMATS['date'];
            
            // 转换为目标格式
            const formattedValue = formatDate(date, targetFormat);
            
            return formattedValue;
        } catch (error) {
            // 任务 2.4: 错误处理
            console.warn('[datePicker] Error converting ISO 8601 date:', value, error);
            return value;
        }
    }
}
