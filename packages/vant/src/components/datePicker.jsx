import {computed, defineComponent, ref, toRef} from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const NAME = 'fcDatePicker';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        disabled: Boolean,
        clearable: Boolean,
        placeholder: String,
        modelValue: [String, Number, Date],
        minDate: [String, Date],
        maxDate: [String, Date],
        format: String,
        valueFormat: String,
        hideArrow: Boolean,
        disabledNoGray: Boolean,
    },
    emits: ['update:modelValue', 'fc.el', 'change'],
    setup(props, _) {
        const show = ref(false);
        const modelValue = toRef(props, 'modelValue');

        // Parse date value from various formats including ISO 8601
        const parseDate = (value) => {
            if (!value) return null;

            // Try parsing as Date object
            if (value instanceof Date) {
                return dayjs(value);
            }

            // Try parsing with dayjs (supports ISO 8601 and common formats)
            let date = dayjs(value);

            // If parsing failed and valueFormat is provided, try with custom format
            if (!date.isValid() && props.valueFormat) {
                date = dayjs(value, props.valueFormat);
            }

            return date.isValid() ? date : null;
        };

        // Convert modelValue to array format for van-date-picker
        const formValue = computed(() => {
            const date = parseDate(modelValue.value);
            if (!date) {
                return [];
            }
            return [
                date.year().toString(),
                (date.month() + 1).toString().padStart(2, '0'),
                date.date().toString().padStart(2, '0')
            ];
        });

        // Display value formatted according to format prop
        const displayValue = computed(() => {
            const date = parseDate(modelValue.value);
            if (!date) {
                return '';
            }

            // Use format prop if provided, otherwise use default format
            if (props.format) {
                return date.format(props.format);
            }

            return date.format('YYYY-MM-DD');
        });

        const dateRange = computed(() => {
            return {
                minDate: props.minDate ? dayjs(props.minDate).toDate() : undefined,
                maxDate: props.maxDate ? dayjs(props.maxDate).toDate() : undefined,
            }
        })

        const onInput = (val) => {
            _.emit('update:modelValue', val);
            _.emit('change', val);
        }

        return {
            show,
            formValue,
            displayValue,
            dateRange,
            open() {
                if (props.disabled) {
                    return;
                }
                show.value = true;
            },
            confirm({selectedValues}) {
                // selectedValues is an array like ['2026', '01', '27']
                const dateStr = selectedValues.join('-');
                const date = dayjs(dateStr, 'YYYY-MM-DD');

                // Format output according to valueFormat prop
                const formattedValue = props.valueFormat
                    ? date.format(props.valueFormat)
                    : dateStr;

                onInput(formattedValue);
                show.value = false;
            },
            clear(e) {
                e.stopPropagation();
                onInput('');
            }
        }
    },
    render() {
        const clearIcon = () => {
            return this.$props.clearable && this.modelValue ?
                <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear"
                    onClick={this.clear}></i> : undefined;
        }
        
        const classNames = [
            '_fc-date-picker',
            this.$props.hideArrow ? '_fc-date-picker--hide-arrow' : '',
            this.$props.disabledNoGray ? '_fc-date-picker--disabled-no-gray' : ''
        ].filter(Boolean).join(' ');
        
        return <div class={classNames}>
            <van-field ref="el" placeholder={this.placeholder} readonly disabled={this.$props.disabled}
                onClick={this.open}
                model-value={this.displayValue} border={false} isLink={!this.$props.hideArrow} v-slots={{
                    'right-icon': clearIcon
                }}/>
            <van-popup show={this.show} onUpdate:show={(v) => this.show = v} round position="bottom">
                <van-date-picker
                    columnsType={['year', 'month', 'day']}
                    {...{...this.$attrs, ...this.dateRange}}
                    modelValue={this.formValue}
                    onConfirm={this.confirm}
                    onCancel={() => this.show = false}
                />
            </van-popup>
        </div>
    },
    mounted() {
        this.$emit('fc.el', this.$refs.el);
    }
});
