class Promise {
    constructor(excutor){
        //promise的状态
        this.status = 'pending';
        //成功后的结果
        this.value = "";
        //失败的原因
        this.reason = "";
        //成功后回调函数集合
        this.onResolvedCallbacks = [];
        //失败后回调函数集合
        this.onRejectedCallbacks = [];
        
        //成功时excutor参数的函数参数
        const resolve = (value)=> {
            //当前状态为等待时候
            if(this.status === "pending"){
                //改变成功参数
                this.value = value;
                //改变状态
                this.status = "fulfilled";
                //遍历成功回调执行
                this.onResolvedCallbacks.forEach((fn) => {
                    fn();
                });
            }
        };
        //失败时excutor参数的函数参数
        const reject = (reason) => {
            //当前状态为等待时候
            if(this.status === "pending"){
                //改变成功参数
                this.reason = reason;
                //改变状态
                this.status = "rejected";
                //遍历失败回调执行
                this.onRejectedCallbacks.forEach((fn) => {
                    fn();
                });
            }
        };
        //当执行excutor发生错误的时候直接拒绝抛出异常
        try {
            excutor(resolve,reject);  
        }catch(e){
            reject(e);
        }
    }
    //onRejected失败回调，onFulfilled成功回调
    then(onFulfilled,onRejected){
        //判断成功参数类型，返回结果
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled:function (data) {
            return data;
        }
        //判断失败参数类型，抛出异常
        onRejected = typeof onRejected === 'function' ? onRejected:function (err) {
            throw err;
        }
        // 这个promise2 就是我们每次调用then后返回的新的promise
        const promise2;
        promise2 = new Promise((resolve,reject) => {
            //如果是成功状态
            if(this.status = "fulfilled"){
                //要异步执行代码 以便在promise2有返回值之后正确执行
                setTimeout(() => {
                    try{
                        //成功回调会返回结果传入的this.value是resolve后的传入值
                        const x = onFulfilled(this.value);
                         // 判断promise2 和 x 也是then函数返回的结果和promise2的关系 如果x 是普通值 那就让promise2成功 如果 是一个失败的promise那就让promise2 失败
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e){
                        reject(e);
                    }
                },0);
            }
            //如果是失败状态
            if(this.status = "rejected"){
                //要异步执行代码 以便在promise2有返回值之后正确执行
                setTimeout(() => {
                    try{
                        //成功回调会返回结果传入的this.reason是reject后的传入值
                        const x = onRejected(this.reason);
                         // 判断promise2 和 x 也是then函数返回的结果和promise2的关系 如果x 是普通值 那就让promise2成功 如果 是一个失败的promise那就让promise2 失败
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e){
                        reject(e);
                    }
                },0);
            }
            //等待状态
            if(this.status = "pending"){
                //把成功回调放入数组
                this.onResolvedCallbacks.push(() => {
                    //异步获取返回值
                    setTimeout(() => {
                        try{
                            const x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        }catch(e){
                            reject(e);
                        }
                    },0);
                });
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            const x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        }catch(e){
                            reject(e);
                        }
                    },0);
                });
            }
        });
        return promise2;
    }
    static catch(){
        return this.then(null, onRejected);
    }
    static reject(reason){
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    }
    static resolve(value){
        return new Promise((resolve, reject) => {
            resolve(value);
        })
    }
    static finally(cb){
        return this.then((data) => {
            cb();
            return data;
        }, (err) => {
            cb();
            throw err;
        });
    }
    static all(promises){
        return new Promise((resolve, reject) => {
            const arr = [];
            // 处理数据的方法
            const i = 0;
            function processData(index, data) {
              arr[index] = data; //数组的索引和长度的关系
              if (++i === promises.length) { // 当数组的长度 和promise的个数相等时 说明所有的promise都执行完成了
                resolve(arr);
              }
            }
            for (const i = 0; i < promises.length; i++) {
                const promise = promises[i];
                //如果是一个then方法
              if (typeof promise.then == 'function') {
                promise.then((data) => {
                    processData(i, data); // 把索引和数据 对应起来 方便使用
                }, reject);
              } else {
                processData(i, promise);
              }
            }
        });
    }
    static race(promises){
        return new Promise((resolve, reject) => {
            for (const i = 0; i < promises.length; i++) {
                const promise = promises[i];
                if (typeof promise.then == 'function') {
                    promise.then(resolve, reject)
                } else {
                    resolve(promise);
                } 
            }
        })
    }
}
// 核心方法 处理 成功或者失败执行的返回值 和promise2的关系
function resolvePromise(promise2,x,resolve,reject) {
    // 这个处理函数 需要处理的逻辑韩式很复杂的
    // 有可能这个x 是一个promise  但是这个promise并不是我自己的
    if(promise2 === x){
        throw new TypeError('TypeError: Chaining cycle detected for promise #<Promise>')
    }
    // 不单单需要考虑自己 还要考虑 有可能是别人的promise
    const called; // 文档要求 一旦成功了 不能调用失败
    if((x!=null&&typeof x=== 'object') || typeof x === 'function'){
      // 这样只能说 x 可能是一个promise
        try{
        // x = {then:function(){}}
            const then = x.then; // 取then方法
            if(typeof then === 'function'){
                then.call(x, (y) => { // resolve(new Promise)
                if(!called){called = true;} else{ return;}
                resolvePromise(x,y,resolve,reject); //  递归检查promise
            },(r) => {
                if (!called) { called = true; } else { return; }
                reject(r);
            });
            }else{ // then方法不存在
                resolve(x); // 普通值
            }
        }catch(e){ // 如果取then方法出错了，就走失败
            if (!called) { called = true; } else { return; }
            reject(e);
        }
    }else{
        resolve(x);
    }
}
module.exports = Promise;