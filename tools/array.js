// 将对象数组中的元素按 key属性排序，并记录其重复次数，  适合antd table中合并单元格
export const toTableArrByKey = (arr, key) => {
  arr = [...arr]
  arr.sort((a, b) => {
    return a[key] < b[key] ? -1 : 0
  })
  const map = {}
  return arr.map(item => {
    if (!map[item[key]]) {
      map[item[key]] = item
      item.__times = 1
    } else {
      item.__times = 0
      ++map[item[key]].__times
    }
    return item
  })
}

const shuffle = function (arr) {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    const itemAtIndex = arr[randomIndex]

    arr[randomIndex] = arr[i]
    arr[i] = itemAtIndex
  }
  return arr
}
