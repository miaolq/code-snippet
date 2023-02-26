// 生成新promise时，若前一个promise未完成，则reject前一个promise
function onlyResolveLastPromise(func, rejectValue = 'rejected') {
  let prevReject
  return function (...args) {
    if (prevReject) {
      prevReject(rejectValue)
      prevReject = null
    }
    return Promise.race([
      func.apply(this, args),
      new Promise((resolve, reject) => {
        prevReject = reject
      }),
    ])
  }
}

const queryApi = data => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data)
    }, 1000)
  })
}

const newQueryApi = onlyResolveLastPromise(queryApi)
newQueryApi(1)
  .then(res => console.log(res))
  .catch(err => console.error(err))

newQueryApi(2)
  .then(res => console.log(res))
  .catch(err => console.error(err))
