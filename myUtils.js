/**
 * 全局命名空间对象下挂载方法
 * @Author: hlp47
 * @Date:   2015-06-08
 * @Last Modified by:   Administrator
 * @Last Modified time: 2016-07-07 17:49:12
 */
//----------------------------------------------------------------------//
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

    /* 其他方法1.
     *  var a = { n: {name:'whatever'} }; 
     *  var b = JSON.parse( JSON.stringify(a) );
     */
    /* 其他方法2.
     *  var a = { n: {name:'whatever'} }; 
     *  var b = Object.create(a);
     */
    /*
     * 其他方法3
     * 通过prototype原型进行寄生组合继承...
     */
    NB.base.extend = function(destination, source) {
        if (destination == null) {
            destination = source
        } else {
            for (var property in source) {
                if (NB.base.getParamType(source[property]).toLowerCase() === "object" ||
                    NB.base.getParamType(source[property]).toLowerCase() === "array") {
                    NB.base.destination[property] = NB.base.getParamType(source[property]).toLowerCase() === "object" ? {} : [];
                    NB.base.extend(destination[property], source[property]);
                } else {
                    destination[property] = source[property];
                }
            }
        }
    };

    /**
     * 获取对象类型
     * @private
     * @param {object} object 对象
     * @return {string} 类型
     * 可判断类型：Boolean Number String Function Array Date RegExp Object
     */
    NB.base.getParamType = function(obj) {
        return obj == null ? String(obj) :
            Object.prototype.toString.call(obj).replace(/\[object\s+(\w+)\]/i, "$1") || "object";
    }

    /**
     * 原型继承类
     * @param {object} object 基类
     * @return {object} 生成的子类
     */
    NB.base.cloneClass = function(object) {
        if (!this.isObject(object)) return object;
        if (object == null) return object;
        if (Object.create) { //原生创造对象
            return Object.create(object);
        }
        var F = new Object();
        for (var i in object) {
            F[i] = NB.base.cloneClass(object[i]);
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
                return Object.prototype.toString.call(obj) === "[object " + type + "]";
            }
        },

        isArray: function(val) {
            return Array.isArray(val) || this.isType('Array')(val);
        },

        isFunction: function(fn) {
            return fn && typeof fn === 'function';
        },

        isNumber: function(val) {
            return !isNaN(val);
        },

        isObject: function(val) {
            // return Object.prototype.toString.call(val) === '[object Object]';
            return this.isType('Object')(val);
        },

        isString: function(val) {
            // return Object.prototype.toString.call(val) === '[object String]';
            return this.isType('String')(val);
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
        },

        indexOf: function(arr, ele) {
            var indexOf = Array.prototype.indexOf;
            if (indexOf) {
                return indexOf.call(arr, ele);
            }
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == ele) {
                    return i
                }
            };
            return -1
        },

        /**
         * @param{array} fArray
         * @param{array} sArray
         * merge([12, 354, 6], [689])
         */
        merge: function(fArray, sArray) {
            var f = fArray.length,
                s = sArray.length,
                i = 0;
            for (; i < s; i++) {
                fArray[f++] = sArray[i++];
            };
            fArray.length = f;

            return fArray;
        },

        autoXSS: (function() {
            var _XSS = {
                go: function(item) {
                    var rs = item;
                    if (!item) {
                        return rs;
                    }
                    var itemType = typeof(item),
                        itemObjType;
                    if (itemType == 'string') {
                        rs = this.filterHtml(item);
                    } else if (itemType == 'object') {
                        if (NB.base.isObject(item)) {
                            rs = this.parseObject(item);
                        } else if (NB.base.isArray(item)) {
                            rs = this.parseArray(item);
                        }
                        rs.autoXss = true;
                    }
                    return rs;
                },
                //the same as 'encodeHtml'
                filterHtml: function(str) {
                    str = str.replace(/\u0026/g, '&amp;')
                        .replace(/\u0022/g, '&quot;')
                        .replace(/\u003C/g, '&lt;')
                        .replace(/\u003E/g, '&gt;')
                        .replace(/\u0027/g, '&#39;');
                    return str;
                },
                parseArray: function(obj) {
                    var i = 0,
                        l = obj.length,
                        item;
                    for (; i < l; i++) {
                        obj[i] = this.go(obj[i]);
                    }
                    return obj;
                },
                parseObject: function(obj) {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            obj[key] = this.go(obj[key]);
                        }
                    }
                    return obj;
                }
            };
            return function(data) {
                return _XSS.go(data);
            }
        })()
    });

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
NB.namespace('ajax');

NB.ajax = function(options) {
    if (!options || typeof options != 'object') {
        return
    }
    var successFn = options.successFn,
        errorFn = options.errorFn;

    var config = {

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

    };
    NB.base.extend(config, options);

    $.ajax(config);
}

NB.namespace('array');
NB.array = {

    //数组去重
    // deleteRepeatArr([12,345,12,34])===>[12, 345, 34]
    deleteRepeatArr: function(arr) {
        var i, j,
            newArr = [],
            obj = {},
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
     * 英文首字符小写
     * 调用 NB.string.toLowerCaseFirstLetter1('Doglas')
     */
    toLowerCaseFirstLetter1: function(a) {
        if (typeof a === 'undefined' || this.isLowerCase(a.charAt(0))) {
            return a
        } else {
            var firstLetter = a.substring(0, 1).toLowerCase();
            var otherLetter = a.substring(1, a.length);
            return firstLetter + otherLetter
        }
    },

    // 简易版
    toLowerCaseFirstLetter: function(a) {
        return a.charAt(0).toLowerCase() + a.substring(1, a.length);
        // or return a.charAt(0).toLowerCase() + a.slice(1);
    },

    //html字符转义
    // '<html><script>alert(1233);</script></html>\ndfgfhgfhgfh\n5657675\ndfgfdgfgfg'
    encodeHtml: function(str) {
        if (typeof str != 'string') {
            return str;
        };
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
            "/": "&#x2F;"
        };
        var reg = /[&<>'"/]/ig;
        return str.replace(reg, function(i) {
            return entityMap[i];
        });
    },

    /**
     * 格式化
     * @param {object} obj 
     * @return obj==>str
     */
    obj2str: function(obj) {
        var str = '';
        if (Object.keys && Array.prototype.map) {
            return Object.keys(obj).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
            }).join('&')
        } else {
            for (var i in obj) {
                if (obj[i] && obj.hasOwnProperty(i)) {
                    str += i + '=' + obj[i] + '&';
                }
            };
            return str.replace(/&$/g, '')
        }
    }
};

// cookie 封装插件
NB.namespace('cookie');
NB.cookie = {
    getAllCookie: function() {
        var cookies = {},
            cookie = document.cookie,
            index = 0;
        if (cookie) {
            var objs = cookie.split(';');
            for (var i in objs) {
                index = objs[i].indexOf('=');
                cookies[objs[i].substr(0, index)] = objs[i].substr(index + 1, objs[i].length);
            }
        }
        return cookies
    },
    get: function(name) {
        return decodeURIComponent(this.getAllCookie()[name]) || null;
    },
    //options maxAge, path, domain, secure
    set: function(name, val, options) {
        var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(val);
        if (options) {
            if (options.maxAge) {
                cookie += ';max-age=' + options.maxAge;
            }
            if (options.path) {
                cookie += ';path=' + options.path;
            }
            if (options.domain) {
                cookie += ';domain=' + options.domain;
            }
            if (options.secure) {
                cookie += ';secure';
            }
        }
        document.cookie = cookie;
        //return cookie;
    },

    remove: function(name) {
        if (this.getAllCookie()[name]) {
            document.cookie = name + '=;max-age=0';
        }
    },

    removeAll: function() {
        var cookie = this.getCookie();
        for (var i in cookie) {
            document.cookie = i + '=;max-age=0';
        }
    }
};

/**
 * 获取日期和时间
 */
NB.namespace('date');

(function() {

    NB.date = {

        // getFormatTime: function() {
        //     var d = new Date();
        //     var year = this.isBelowTen(d.getFullYear());
        //     var month = this.isBelowTen(d.getMonth() + 1);
        //     var day = this.isBelowTen(d.getDate());
        //     var hour = this.isBelowTen(d.getHours());
        //     var minute = this.isBelowTen(d.getMinutes());
        //     var second = this.isBelowTen(d.getSeconds());

        //     var dd = year + '' + month + day + hour + minute + second;
        //     return dd
        // },

        /**
         * 格式化时间
         * @param {string} split 分隔符
         * @param {boolean} days 是否只返回年月日
         * @param {string} time 时间戳
         * @return {string} 时间 '20160401'or '201604011200'...
         */
        getFormatTime: function(split, days, time) {
            var str = split ? split : '';
            var d = (time && new Date(time)) || new Date(),
                year = this.isBelowTen(d.getFullYear()),
                month = this.isBelowTen(d.getMonth() + 1),
                day = this.isBelowTen(d.getDate()),
                hour = this.isBelowTen(d.getHours()),
                minute = this.isBelowTen(d.getMinutes()),
                second = this.isBelowTen(d.getSeconds());
            var result = null;
            if (days) {
                result = year + str + month + str + day;
            } else {
                result = year + str + month + str + day + " " + hour + ":" + minute + ":" + second;
            }
            return result;
        },

        //根据日期获取前N天(默认7天)，time时间戳 n表示提前多少天
        getFormatTimeYesterday: function(time, n) {
            var t = 7 * 24 * 60 * 60 * 1000;
            if (n) {
                t = n * 24 * 60 * 60 * 1000;
            }
            var now = this.getNow();
            var d = (time && new Date(time - t)) || new Date(now - t)
            year = this.isBelowTen(d.getFullYear()),
                month = this.isBelowTen(d.getMonth() + 1),
                day = this.isBelowTen(d.getDate()),
                hour = this.isBelowTen(d.getHours()),
                minute = this.isBelowTen(d.getMinutes()),
                second = this.isBelowTen(d.getSeconds());
            return year + '' + month + '' + day;
        },

        // 时间数字低于10补0，如：9转化为09
        isBelowTen: function(n) {
            if (!NB.base.isNumber(n)) {
                throw new Error('only number!')
            }
            return n < 10 ? '0' + n : n;
        },

        /**
         * 格式化金额为小数点后两位
         * @param {number} num
         * @return {string} format2Percent('0.8578')===>85.78%
         */
        format2Percent: function(num) {
            if (num === 0 || num === '0') {
                return '0.00%';
            };
            if (!num || isNaN(num)) {
                return
            }
            num = parseFloat(num);
            num = Math.round(10000 * num) / 100 + '';
            num += (num.indexOf('.') == -1) ? '.00' : '00';

            var result = num.split('.'),
                i = result[1].substring(0, 2);
            return result[0] + '.' + i + '%';
        },
        // 获取当前时间戳
        getNow: function() {
            return +new Date();
            // return (new Date()).getTime();
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

NB.namespace('json');

//json方法拓展 2016-03-18 //
NB.base.extend(NB.json, {
    parse: function(str) {
        return $.parseJSON(str);
    }
});

// get: NB.localStorage('aa');
// set: NB.localStorage('aa','123');
// remove: NB.removeStorage('aa');

NB.namespace('localStorage');
NB.localStorage = function(key, val) {
    if ('localStorage' in window && window['localStorage'] != null) { //
        if (arguments.length == 2) {
            localStorage.setItem(key, val);
        } else {
            return localStorage.getItem(key);
        }
    } else { //cookie
        return $.cookie(key, val, {
            expires: 30,
            path: '/'
        });
    }
};
NB.removeStorage = function(key) {
    if ('localStorage' in window && window['localStorage'] != null) { //
        localStorage.removeItem(key);
    } else { //cookie
        return $.cookie(key, '', {
            expires: '-1',
            path: '/'
        });
    }
};

//文件操作相关方法
NB.namespace('file');
NB.file = {

    isImage: function(url) {
        var url = url.split(/[?#]/)[0];
        return (/\.(png|jpg|jpeg|gif|bmp)$/i).test(url);
    },

    // test.txt, aaa.min.js
    getFileExtension: function(filename) {
        var ext = null;
        var tempArr = filename.split('.');
        if (tempArr.length == 1 || tempArr[0] === "" && tempArr.length == 2) {
            ext = '';
        } else {
            ext = tempArr.pop().toLowerCase();
        }
        return ext
    }
};


NB.namespace('event');

//弹出层等
NB.namespace("UI");


// 页面小插件
NB.namespace('widget');
(function() {

    NB.widget = {

        // @param {number} time为时间间隔
        gotoTop: function(time) {
            $('html,body').animate({
                scrollTop: '0px'
            }, time - 0);
        }

    }

})();
