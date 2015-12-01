/**
 * 全局命名空间对象下挂载方法
 * @date 2015-06-08
 * UpDate 2015-10
 * @author Lipeng Wong
 */

/**
 * 处理命名空间
 * @param {string} 空间名称，可多个 
 * @return {object} 对象
 */
var NB = {
    namespace: function(ns) {
        var parts = ns.split('.'),
            object = this,
            i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            if (!object[parts[i]]) {
                object[parts[i]] = {};
            }
            object = object[parts[i]];
        }
        return object;
    }
};

// 基本方法
NB.namespace('base');

(function() {

    /**
     * 为对象进行扩展属性和方法
     * @param {object} object 对象
     * @return {bool} 是/否
     */
    NB.base.extend = function(destination, source) {
        if (destination == null) {
            destination = source
        } else {
            for (var property in source) {
                if (getParamType(source[property]).toLowerCase() === "object" &&
                    getParamType(destination[property]).toLowerCase() === "object") {
                    extend(destination[property], source[property])
                } else {
                    destination[property] = source[property];
                }
            }
        }
        return destination;
    };

    /**
     * 原型继承类
     * @param {object} object 基类
     * @return {object} 生成的子类
     */
    NB.base.cloneClass = function(object) {
        if (!isObject(object)) return object;
        if (object == null) return object;
        var F = new Object();
        for (var i in object) {
            F[i] = cloneClass(object[i]);
        }
        return F;
    }

    /**
     * 绑定上下文
     * @param {function,context} object
     * @return {object}
     */
    NB.base.bind = function(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        };
    };

    // 常用utils 方法，例如类型检验
    NB.base.extend(NB.base, {

        /**
         * 类型检验 （统一调用方法）闭包，函数curry化
         * 使用：var isNumber = isType('Number'),
         *           isArray = Array.isArray || isType('Array'),
         *           isObject = isType('Object');
         * 调用      isNumber(val); isArray(val); isObject(val)
         */
        isType: function(type) {
            return function(obj) {
                return {}.toString.call(obj) === "[object " + type + "]";
            }
        },

        isArray: function(val) {
            return Array.isArray(val) || Object.prototype.toString.call(val) === '[object Array]';
        },

        isFunction: function(fn) {
            return fn && typeof fn === 'function';
        },

        isNumber: function(val) {
            return !isNaN(val);
        },

        isObject: function(val) {
            return Object.prototype.toString.call(val) === '[object Object]';
        },

        isString: function(val) {
            return Object.prototype.toString.call(val) === '[object String]';
        },

        //update: obj allows all unkonw type
        //learn from underscore.js
        isEmptyObj: function(obj) {
            if (obj == null) {
                return true
            }
            if (this.isArray(obj) || this.isString(obj)) {
                return obj.length === 0
            }

            if (Object.keys) {
                if (Object.keys(obj).length) {
                    return false
                }
                return true
            } else {
                for (var i in obj) {
                    //if (hasOwnProperty.call(obj,i)) { //使用call
                    if (obj.hasOwnProperty(i)) {
                        return false
                    }
                }
                return true
            }
        },


        // 解析url查询字符
        // '?aa=11&ss=2' => '{aa:11, ss=2}'
        parseUrl: function(str) {
            str = decodeURI(str);
            var result = {},
                reg = /([^?#=&]+)=([^&]+)/ig,
                match;
            while ((match = reg.exec(str)) != null) {
                result[match[1]] = match[2];
            }
            return result;
        },

        // 常规版本 解析url查询字符
        parseUrl1: function(str) {
            str = decodeURI(str);
            var search = str.split('?')[1],
                params = search.split('&') || [],
                result = {},
                arr = []; //存放键值数组
            for (var i = 0, len = params.length; i < len; i++) {
                arr = params[i].split('=');
                if (!result[arr[0]]) {
                    result[arr[0]] = arr[1];
                }
            }
            return result
        },

        // 获取对象长度
        // var obj = {
        //     'aa': '122',
        //     'ss': '232334'
        // };
        // var aa = getObjLength(obj);
        // console.log(aa);
        getObjLength: function(obj) {
            if (this.isObject(obj)) {
                if (Object.keys(obj)) {
                    return Object.keys(obj).length;
                } else {
                    var arr = [];
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            arr.push(i);
                        };
                    }
                    return arr.length
                }
            }
        }
        
    });

    /**
     * 获取对象类型
     * @private
     * @param {object} object 对象
     * @return {string} 类型
     * 可判断类型：Boolean Number String Function Array Date RegExp Object
     */
    function getParamType(obj) {
        return obj == null ? String(obj) :
            Object.prototype.toString.call(obj).replace(/\[object\s+(\w+)\]/i, "$1") || "object";
    }

})();

NB.base.extend(window, NB.base);

//ajax
// options = {
//     url:'',
//     dataType: 'json',
//     type: 'post',
//     successFn: function(){},
//     errorFn: function(){}    
// };
NB.namespace('ajaxMethod');
NB.ajaxMethod = function(options) {
    if (!options || typeof options != 'object') {
        return
    }
    var config = {},
        successFn = options.successFn,
        errorFn = options.errorFn,

        config = NB.base.extend({

            beforeSend: function() {},

            success: function(d) {
                if (d.resultCode == 200) {
                    successFn && NB.base.isFunction(successFn) && successFn();
                } else {
                    console.log(d.errorMsg);
                }
            },

            error: function() {
                errorFn && NB.base.isFunction(errorFn) && errorFn();
            }

        }, options);

    $.ajax(config); // 后续替换成不依赖jQuery，原生JavaScript TODO....
}

NB.namespace('array');
NB.array = {

    //数组去重
    deleteRepeatArr: function(arr) {
        var i, j,
            newArr = [],
            obj = [],
            len = arr.length;
        for (i = 0; i < len; i++) {
            if (!obj[arr[i]]) {
                newArr.push(arr[i]);
                obj[arr[i]] = 1;
            }
        }
        return newArr;
    },

    // from: node>qs module>utils 
    array2Object: function(arr) {
        if (!NB.base.isArray(arr)) {
            console.log('Array is required!');
            return
        }
        var obj = {};
        for (var i = 0, len = arr.length; i < len; i++) {
            if (typeof arr[i] !== 'undefined') { // 注意不要写成if(!arr[i]);
                obj[i] = arr[i];
            }
        };
        return obj
    }

}

NB.namespace('dom');

/**
 * 查找字符串的字节长度;截取字符串;去掉字符串左右两边的非空字符
 * HTML编码过滤，表单验证正则
 */
NB.namespace('string');
NB.string = {

    /**
     * 文字过长 ,使用省略号...
     * @param str
     * @param len
     * @returns {*}
     */
    charEllipsis: function(str, len) {
        if (str.length > len) {
            str = str.substr(0, len) + '...';
        }
        return str;
    },

    /**
     * 倒转字符串
     * NB.string.reverseStr('123456789abcdefg-=');
     */
    reverseStr: function(str) {
        return str.split("").reverse().join('');
    },

    /**
     * 去除左右空白
     */
    trim: function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    //是否小写英文
    isLowerCase: function(str) {
        return /^[a-z]+$/.test(str)
    },
    /**
     * 英文首字符大写
     * 调用 NB.string.toLowerCaseFirstLetter('Doglas')
     */
    // toLowerCaseFirstLetter: function(a){
    //     if(typeof a === 'undefine' || this.isLowerCase(a.charAt(0))){
    //         return a
    //     }else{
    //         var firstLetter = a.substring(0,1).toLowerCase();
    //         var otherLetter = a.substring(1, a.length);
    //         return firstLetter + otherLetter
    //     }
    // }
    // 简易版
    toLowerCaseFirstLetter: function(a) {
        return a.charAt(0).toLowerCase() + a.substring(1, a.length);
    }

}

NB.namespace('cookie');

/**
 * 获取日期和时间
 */
NB.namespace('date');

(function() {

    NB.date = {

        // getFormatTime: function() {
        //     var d = new Date();
        //     var year = isbelowTen(d.getFullYear());
        //     var month = isbelowTen(d.getMonth() + 1);
        //     var day = isbelowTen(d.getDate());
        //     var hour = isbelowTen(d.getHours());
        //     var minute = isbelowTen(d.getMinutes());
        //     var second = isbelowTen(d.getSeconds());

        //     var dd = year + '' + month + day + hour + minute + second;
        //     return dd
        // },

        //增强版
        getFormatTime: function(split) {
            var d = new Date(),
                year = isbelowTen(d.getFullYear()),
                month = isbelowTen(d.getMonth() + 1),
                day = isbelowTen(d.getDate()),
                hour = isbelowTen(d.getHours()),
                minute = isbelowTen(d.getMinutes()),
                second = isbelowTen(d.getSeconds());
            var str = split ? split : '-';
            var dd = year + str + month + str + day + " " + hour + ":" + minute + ":" + second;
            return dd
        },

        // 时间数字低于10补0，如：9转化为09
        isBelowTen: function(n) {
            if (!NB.base.isNumber(n)) {
                throw new Error('only number!')
            }
            return n < 10 ? '0' + n : n;
        }
    }

})();


NB.namespace('number');

(function() {

    NB.number = {

        // 随机数
        getRandom: function(n) {
            return Math.floor(Math.random() * n + 1);
        }
    }

})();


NB.namespace('event');

//弹出层等
NB.namespace("UI");


// 页面小插件
NB.namespace('widget');
(function() {

    NB.widget = {
        gotoTop: function() {}
    }

})();
