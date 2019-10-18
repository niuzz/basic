//Promise 的三种状态  (满足要求 -> Promise的状态)
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(fn) {
    //当前状态
    this.state = PENDING;
    //resolve值
    this.value = null;
    //reject原因
    this.reason = null;
    //成功态回调队列
    this.onFulfilledCallbacks = [];
    //拒绝态回调队列
    this.onRejectedCallbacks = [];

    //成功态回调
    const resolve = value => {
      // 如果没有 setTimeout 传入了同步任务，则因为同步执行，而then还没执行到，回调还没注册上
      // 使用 setTimeout 包裹，则被加入异步队列，等主线程then方法后再去执行，就可以支持传入同步方法
      setTimeout(() => {
        if (this.state === PENDING) {
          // pending(等待态)迁移至 fulfilled(执行态),保证调用次数不超过一次。
          this.state = FULFILLED;
          // 终值
          this.value = value;
          this.onFulfilledCallbacks.map(cb => {
            this.value = cb(this.value);
          });
        }
      });
    };
    //拒绝态回调
    const reject = reason => {
      setTimeout(() => {
        if (this.state === PENDING) {
          // pending(等待态)迁移至 fulfilled(拒绝态),保证调用次数不超过一次。
          this.state = REJECTED;
          //拒因
          this.reason = reason;
          this.onRejectedCallbacks.map(cb => {
            this.reason = cb(this.reason);
          });
        }
      });
    };
    try {
      //执行promise
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    typeof onFulfilled === 'function' && this.onFulfilledCallbacks.push(onFulfilled);
    typeof onRejected === 'function' && this.onRejectedCallbacks.push(onRejected);
    // 返回this支持then 方法可以被同一个 promise 调用多次
    return this;
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
      resolve(100)
    }, 1000
  );
})
  .then(res => {
    console.log(res);
    return res + 1;
  })
  .then(res => {
    console.log(res)
  });

