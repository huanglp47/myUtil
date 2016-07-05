/*
 * @Author: hlp47
 * @Date:   2016-05-10 10:08:11
 * utils function(such as ES5 function) for lower browser 
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-05-10 15:43:30
 */

// 'use strict';
(function() {

var prototype = Array.prototype,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    forEach = prototype.forEach,
    map = prototype.map,
    filter = prototype.filter,
    some = prototype.some,
    every = prototype.every;

if (typeof forEach != 'function') {
    forEach = function(fn, context) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (typeof fn == 'function' && hasOwnProperty.call(this, i)) {
                fn.call(context, this[i], i, this);
            }
        }
    }
};
// var arrySpecial = [];
// var sum = 0;
// var obj = {
//     fn: function(element, index, array) {
//         console.log('element is:' + element);
//         console.log('index is:' + index);
//         console.log('array is:' + array);
//     },
//     fn1: function(ele, index, array) {
//         if (ele % 3 == 0) {
//             arrySpecial.push(ele);
//             return
//         }
//     },
//     fn2: function(ele, index, array) {
//         sum += ele;
//     }
// };
// var arr = [12, 34, 56, 24];

// arr.forEach(obj.fn, obj);

// arr.forEach(obj.fn1, obj);
// console.log(arrySpecial)parseArray;


// arr.forEach(obj.fn2, obj);
// console.log(sum);


if (typeof map != 'function') {
    map = function(fn, context) {
        var _arr = [];
        for (var i = 0, len = this.length; i < len; i++) {
            _arr.push(fn.call(context, this[i], i, this));
        }
        return _arr;
    }
};

// var mapArr = [{
//     'name': '张三',
//     'email': 'zhangsan@163.com'
// }, {
//     'name': '李四',
//     'email': 'lisi@163.com'
// }];
// var newMapArr = [];
// var mapResult = mapArr.map(function(ele, index, array) {
//     newMapArr.push(ele.email);
// });
// console.log(newMapArr); //["zhangsan@163.com", "lisi@163.com"]

if (typeof filter != 'function') {
    filter = function(fn, context) {
        var arr = [];
        for (var i = 0, len = this.length; i < len; i++) {
            fn.call(context, this[i], i, this) && arr.push(this[i]);
        }
        return arr;
    }
};

// var filterArr = [4, 44, 5, 89, 52];
// var filterA = filterArr.filter(function(ele, index, array) {
//     return ele > 10
// });
// console.log(filterA);


if (typeof some != 'function') {
    some = function(fn, context) {
        var returnVal = false;
        for (var i = 0; i < this.length; i++) {
            if (returnVal == true) {
                break
            }
            returnVal = !!fn.call(context, this[i], i, this);
        }
        return returnVal
    }
}
if (typeof every != 'function') {
    every = function (fn, context) {
        var returnVal = true;
        for (var i = 0; i < this.length; i++) {
            if (returnVal == false) {
                break
            }
            returnVal = !!fn.call(context, this[i], i, this);
        }
        return returnVal
    }
    //}
    // var sorces = [4, 8, 5, 9, 25, 41];
    // // var current = 20;
    // var current = 200;

    // var aaSome = sorces.some(function(ele) {
    //     return ele > current
    // });
    // console.log(aaSome);

    // var aaEvery = sorces.some(function(ele) {
    //     return ele > 200
    // });
    // console.log(aaEvery);
}
})();
