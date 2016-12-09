 // XSS过滤函数
 // 使用：
 // XSS.go('<h1>Xss攻击</h1>');
 // XSS.go('<script>alert("hello")</script>');
 (function(){
   var _XSS = {

     isType: function(type) {
         return function(obj) {
             return Object.prototype.toString.call(obj) === "[object " + type + "]";
         }
     },

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
             if (this.isType('Object')(item)) {
                 rs = this.parseObject(item);
             } else if (this.isType('Array')(item)) {
                 rs = this.parseArray(item);
             }
             rs.autoXss = true;
         }
         return rs;
     },

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
 window.XSS = _XSS;
 })();

//测试
 XSS.go('<script>alert("hello")</script>');
 XSS.go(['<script>alert("hello")</script>','<script>alert("hello")</script>']);
 
