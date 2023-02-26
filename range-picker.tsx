import { DatePicker, Select } from 'antd'
import React, { ComponentProps, FC, useEffect, useState } from 'react'

import moment, { Moment } from 'moment'
import styled from '@emotion/styled'

type SelectProps = ComponentProps<typeof Select>
type RangeProps = ComponentProps<typeof DatePicker.RangePicker>
type RangeParam1Type = Parameters<NonNullable<RangeProps['onChange']>>[0]
export type OptionType = { label: string; value: [Moment, Moment] }

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
`

export const CUSTOM = 'CUSTOM'
const format = 'MM/DD/YYYY'

export type GrubRangePickerProps = {
  selectProps?: Omit<SelectProps, 'onChange' | 'options' | 'value' | 'defaultValue'>
  pickerProps?: Omit<RangeProps, 'onChange' | 'value' | 'defaultValue'>
  onChange: (val: RangeParam1Type) => void
  options: OptionType[]
  dateRange: { from: string; to: string }
}

const GrubRangePicker: FC<GrubRangePickerProps> = (props) => {
  const { onChange, options, selectProps, pickerProps, dateRange } = props
  const { from, to } = dateRange

  const [visible, setVisible] = useState<boolean>(false)
  const [selectVal, setSelectVal] = useState<string>()

  const _onChange: SelectProps['onChange'] = (val) => {
    if (val === CUSTOM) {
      setVisible(true)
      return
    }
    const selected = options.find((op) => op.label === val) as OptionType
    onChange(selected.value)
  }

  const _rangeChange: RangeProps['onChange'] = (dates) => {
    onChange(dates)
  }

  useEffect(() => {
    const option = options.find((item) => {
      const { value } = item
      return value[0].format(format) === from && value[1].format(format) === to
    })
    if (option) {
      setSelectVal(option.label)
      setVisible(false)
    } else {
      setSelectVal(CUSTOM)
      setVisible(true)
    }
  }, [from, to, options])

  return (
    <StyledDiv>
      <Select {...selectProps} onChange={_onChange} value={selectVal}>
        {options.map((op) => {
          return (
            <Select.Option key={op.label} value={op.label}>
              {op.label}
            </Select.Option>
          )
        })}
        <Select.Option key={CUSTOM} value={CUSTOM}>
          Custom Date Range
        </Select.Option>
      </Select>
      {visible && (
        <DatePicker.RangePicker
          {...pickerProps}
          onChange={_rangeChange}
          value={[moment(from, 'MM/DD/YYYY'), moment(to, 'MM/DD/YYYY')]}
        />
      )}
    </StyledDiv>
  )
}

export default GrubRangePicker
