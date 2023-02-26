// 防抖： 适合输入查询
function debounce(func, ms) {
  let timeout

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, ms)
  }
}

// 截流：适合跟随鼠标移动等
function throttle(func, ms) {
  let isThrottled = false
  let lastApply = null

  const wrapper = function (...args) {
    if (isThrottled) {
      lastApply = [this, args]
      return
    }
    isThrottled = true
    func.apply(this, args)

    // 更新最后一次状态
    setTimeout(() => {
      isThrottled = false
      if (lastApply) {
        wrapper.apply(...lastApply)
        lastApply = null
      }
    }, ms)
  }
  return wrapper
}
