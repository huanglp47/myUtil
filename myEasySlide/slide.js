;
/**
 * Author: hlp 
 * Date: 2015-11-30 
 * options just like below:	
 * new Slide({
 *	    autoPlay: true, // default true
 *	    dom: document.getElementById('categoryList'), // outer ul
 *	    sliderDot: document.getElementById('sliderUl'), // dot ul
 *		interval: 2000 //interval time for slide, millisecond
 *	});
 */
(function() {
    function Slider(opts) {
        this.ul = opts.dom;
        this.sliderDot = opts.sliderDot;
        this.autoPlay = opts.autoPlay || true; // 默认自动播放
        this.interval = opts.interval || 3000; // 默认每隔3S滑动

        this.idx = 0; // 当前索引
        this.scaleW = window.innerWidth; //判断移动距离、屏幕比例
        this.init();
        if (this.autoPlay) {
            this.start();
        }
    };
    Slider.prototype = {

        div: null, // 样式嗅探

        transformName: '', // like -webkit-transform

        transform: '', // like WebkitTransform

        transition: '',

        transitionName: '',

        start: function() {
            this.clear();
            var itemsLen = this.getItems().length;
            if (itemsLen > 1) { // 小于1个li时，不切换不定时
                this.run();
            }
        },
        clear: function() {
            clearInterval(this.slideTimer);
            this.slideTimer = null;
        },
        run: function() {
            var me = this,
                currentIndex;
            this.slideTimer = setInterval(function() {
                currentIndex = me.getContext(me.idx).active;
                me.slide(parseInt(currentIndex, 10) + 1);
            }, this.interval);
        },
        init: function() {
            this.getStyle();
            this.bindEventForTouch();
            this.bindEventForDot();
        },

        supportTransform3d: function() {
            this.div = this.createDiv();
            this.div.style[this.transform] = '';
            this.div.style[this.transform] = 'rotateY(90deg)';
            return this.div.style[this.transform] !== '';
        },

        getStyle: function() {
            var obj_transform = this.checkDiffStyle('transform'),
                obj1_transition = this.checkDiffStyle('transition');
            this.transform = obj_transform._cssProp;
            this.transformName = obj_transform._cssName;

            this.transition = obj1_transition._cssProp;
            this.transitionName = obj1_transition._cssName;

            //检验是否支持translate3d动画
            //alert(this.supportTransform3d());
        },

        createDiv: function() {
            return document.createElement('div');
        },
        //(`transition` => `WebkitTransition`)
        checkDiffStyle: function(prop) {
            this.div = this.createDiv();
            var arr = ['Webkit', 'Moz', 'ms', 'O'],
                prop_ = prop.charAt(0).toUpperCase() + prop.substr(1),
                vendorProp = '';
            for (var i = 0; i < arr.length; i++) {
                vendorProp = arr[i] + prop_; // like WebkitTransition
                if (vendorProp in this.div.style) {
                    return {
                        _cssProp: vendorProp,
                        _cssName: '-' + (arr[i]).toLowerCase() + '-' + prop
                    }
                }
            }
        },
        getAllIndex: function() {
            return this.ul.getElementsByTagName('li').length - 1;
        },
        getContext: function(n) {
            var cidx = n,
                prev = 0,
                next = 0;
            var len = this.getAllIndex();
            if (cidx > len) {
                cidx = 0;
            } else if (cidx < 0) {
                cidx = len;
            };
            this.idx = cidx;
            prev = cidx - 1 < 0 ? len : cidx - 1;
            next = cidx + 1 > len ? 0 : cidx + 1;
            return {
                active: cidx,
                next: next,
                prev: prev
            }
        },
        getItems: function() {
            return this.ul.getElementsByTagName('li');
        },
        slide: function(n) {
            var statusPosition = this.getContext(n);

            var cidx = statusPosition.active,
                prev = statusPosition.prev,
                next = statusPosition.next,
                transition = this.transition,
                transform = this.transform,
                transformName = this.transformName;
            var lis = this.getItems();

            //改变过渡的方式，从无动画变为有动画
            lis[cidx].style[transition] = transformName + ' 0.2s ease-out';
            lis[prev] && (lis[prev].style[transition] = transformName + ' 0.2s ease-out');
            lis[next] && (lis[next].style[transition] = transformName + ' 0.2s ease-out');

            //改变动画后所应该的位移值
            lis[cidx].style[transform] = 'translate3d(0, 0, 0)';
            lis[prev] && (lis[prev].style[transform] = 'translate3d(-' + this.scaleW + 'px, 0, 0)');
            lis[next] && (lis[next].style[transform] = 'translate3d(' + this.scaleW + 'px, 0, 0)');

            //修改选中的小点
            this.slectDot(cidx);

            this.div = null;
        },
        slectDot: function(cidx) {
            var dotLi = this.sliderDot.getElementsByTagName('li');
            $(dotLi[cidx]).addClass('active').siblings().removeClass('active');
        },
        onTouchStart: function(e) {
            var itemsLen = this.getItems().length;
            if (itemsLen <= 1) { // 小于1个li时，不切换不定时
                return;
            }
            this.clear();
            this.startTime = new Date() * 1;
            this.startX = e.touches[0].pageX;
            this.offsetX = 0;
        },
        onTouchMove: function(e) {
            //在andorid下不触发touchend解决方案 FUCKKKK
            e.preventDefault();

            var lis = this.ul.getElementsByTagName('li');
            this.offsetX = e.touches[0].pageX - this.startX;
            //起始索引
            var i = this.idx - 1;
            //结束索引
            var m = i + 3;
            var transition = this.transition,
                transform = this.transform,
                transformName = this.transformName;

            //最小化改变DOM属性
            for (i; i < m; i++) {
                lis[i] && (lis[i].style[transition] = transformName + ' 0s ease-out');
                lis[i] && (lis[i].style[transform] = 'translate3d(' + ((i - this.idx) * this.scaleW + this.offsetX) + 'px, 0, 0)');
            }
        },
        onTouchEnd: function(e) {
            var itemsLen = this.getItems().length;
            if (itemsLen <= 1) { // 小于1个li时，不切换不定时
                return;
            }
            //边界就翻页值
            var boundary = this.scaleW / 6;
            //手指抬起的时间值
            var endTime = new Date() * 1;
            if (endTime - this.startTime > 300) {
                if (this.offsetX >= boundary) {
                    this.slide(this.idx - 1);
                } else if (this.offsetX < 0 && this.offsetX < -boundary) {
                    this.slide(this.idx + 1);
                } else {
                    this.slide(0);
                }
            } else {
                if (this.offsetX > 50) {
                    this.slide(this.idx - 1);
                } else if (this.offsetX < -50) {
                    this.slide(this.idx + 1);
                } else {
                    this.slide(0);
                }
            }
            this.reStartStatus();
        },
        reStartStatus: function() {
            if (this.autoPlay) {
                this.start();
            }
        },
        bindEventForTouch: function() {
            var me = this;
            this.ul.addEventListener('touchstart', function(e) {
                me.onTouchStart(e);
            }, false);
            this.ul.addEventListener('touchmove', function(e) {
                me.onTouchMove(e);
            }, false);
            this.ul.addEventListener('touchend', function(e) {
                me.onTouchEnd(e);
            }, false);
        },
        bindEventForDot: function() {
            var me = this;
            $(this.sliderDot)
            .on('mouseover', 'li', function() {
                me.clear();
            })
            .on('mouseout', 'li', function() {
                me.reStartStatus();
            })
            .on('click', 'li', function() {
                var index = $(this).index();
                me.slide(index);
            });
        }
    };
    /**
     * dom 滑动li外层ul
     * sliderDot 下方小圆点外层ul
     */
    new Slider({
        dom: document.getElementById('silderUl'),
        sliderDot: document.getElementById('dotUl')
    })
}())
