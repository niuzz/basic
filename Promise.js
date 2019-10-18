const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function Promise(executor) {
  let self  = this;
  self.status = PENDING;
  self.value = null; // 成功的值
  self.reason = null; // 失败的原因
  self.onFulfilled = []; // 成功的回调
  self.onRejected = []; // 失败的回调

  function resolve(value) {
    if (self.status === PENDING) {
      self.status = FULFILLED;
      self.value = value;
      self.onFulfilled.forEach(fn => fn());
    }
  }

  function reject(reason) {
    if (self.status === PENDING) {
      self.status = REJECTED;
      self.reason = reason;
      self.onRejected.forEach(fn => fn());
    }
  }

  executor(resolve, reject);
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
  let self = this;
  let newPromise;

  newPromise = new Promise((resolve, reject) => {
    if (self.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          resolvePromise(newPromise, x, resolve, reject)
        } catch (e) {
          reject(e);
        }
      })
    }
    if (self.status === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          resolvePromise(newPromise, x, resolve, reject)
        }catch (e) {
          reject(e);
        }
      })
    }
    if (self.status === PENDING) {
      self.onFulfilled.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(newPromise, x, resolve, reject)
          }catch (e) {
            reject(e)
          }
        })
      });
      self.onRejected.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            resolvePromise(newPromise, x, resolve, reject)
          }catch (e) {
            reject(e)
          }
        })
      })
    }
  });
  return newPromise;
};

/**
 * 解决过程 需要输入一个promise 和一个值
 * @param newPromise
 * @param x
 * @param resolve
 * @param reject
 */
function resolvePromise(newPromise, x, resolve, reject) {
  let self = this;
  if (newPromise === x) {
    reject(new TypeError('chaining cycle'));
  }

  if (x && typeof x === 'object' || typeof x === 'function') {
    let used;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行[[Resolve]](promise, y)
          y => {
            if (used) return;
            used = true;
            resolvePromise(newPromise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
      }else{
        if (used) return;
        used = true;
        resolve(x);
      }
    }catch (e) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

try {
  module.exports = Promise
} catch (e) {
}
