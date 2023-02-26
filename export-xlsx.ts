// 基于 https://github.com/SheetJS/sheetjs

type ColumnsType = {
  title: string
  render: string | ((row: any) => any)
  numberFormat?: string // 设置xlsx的数字格式, 比如$#,##0.00
  wpx?: number // 根据px设置列宽度
  wch?: number // 根据字符数设置列宽度
  hidden?: boolean
}[]

export const exportXLSX = (
  data: any[],
  columns: ColumnsType,
  sheetName: string,
  fileName?: string
) => {
  const innerTransForm = (value: any) => {
    if (value === null || value === undefined) {
      return ''
    }
    return value
  }

  columns = columns.filter(column => !column.hidden)
  const header = columns.map(column => column.title)

  const body = data.map(obj => {
    return columns.map(column => {
      const { render } = column
      let value
      if (typeof render === 'function') {
        value = render(obj)
      } else if (typeof render === 'string') {
        value = obj[render]
      }
      value = innerTransForm(value)
      return value
    })
  })

  const { XLSX } = window // XLSX library
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body])

  worksheet['!cols'] = columns.map(column => {
    const { wpx, wch } = column
    if (wch) {
      return { wch }
    }
    if (wpx) {
      return { wpx }
    }
    return {}
  })

  type NumberFormatColumns = { columnIndex: number; format: string }[]

  const numberFormatColumns = columns.reduce((pre, curColumn, columnIndex) => {
    return curColumn.numberFormat
      ? [...pre, { columnIndex, format: curColumn.numberFormat }]
      : pre
  }, [] as NumberFormatColumns)

  //  * cellKey: !ref or A2, B2 ...
  //  * cellObj: 'A1:C4' or { t: 's', v: 'value'}
  Object.keys(worksheet).forEach(cellKey => {
    const cellObj = worksheet[cellKey]
    if (typeof cellObj !== 'object') {
      return
    }
    const cell = XLSX.utils.decode_cell(cellKey)
    numberFormatColumns.forEach(nfc => {
      if (nfc.columnIndex === cell.c) {
        cellObj.z = nfc.format
      }
    })
  })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${fileName || sheetName}.xlsx`)
}
