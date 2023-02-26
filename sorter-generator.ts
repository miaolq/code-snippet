type SortType = 'asc' | 'desc'

export type SortFactor = {
  key: string
  order: SortType
  sort: (a: any, b: any) => number
}

export const sortGenerator = (factors: SortFactor[]) => {
  return (a: any, b: any) => {
    let res = 0

    factors.some(cur => {
      const { key, order, sort } = cur
      const valueA = a[key]
      const valueB = b[key]

      if (sort(valueA, valueB) === 0) {
        return false
      }

      if (sort(valueA, valueB) < 0) {
        if (order === 'asc') {
          res = -1
        } else if (order === 'desc') {
          res = 1
        }
      }

      if (sort(valueA, valueB) > 0) {
        if (order === 'asc') {
          res = 1
        } else if (order === 'desc') {
          res = -1
        }
      }

      return true
    })

    return res
  }
}
