(function ($) {
    function Cache() {
        this.cache = {}
    }

    Cache.prototype = {
        set: function (key, val) {
            this.cache[key] = val
        }, get: function (key) {
            return this.cache[key]
        }, clear: function (keys) {
            for (var i = 0; i < keys.length; i++) {
                delete this.cache[keys[i]]
            }
        }
    };
    $.Cache = new Cache()
})(jQuery);
(function () {
    function AjaxQueue() {
        this.restore()
    }

    AjaxQueue.prototype.restore = function () {
        this._queue = [];
        this._retry = 0;
        this._stopped = false
    }, AjaxQueue.prototype.addToQueue = function (func) {
        if (this._stopped) {
            return
        }
        this._queue.push(func);
        if (this._queue.length == 1) {
            this._start()
        }
    };
    AjaxQueue.prototype.retry = function (maxRetry) {
        if (this._retry < maxRetry) {
            this._retry++;
            this._queue[0]()
        } else {
            this.stop()
        }
    };
    AjaxQueue.prototype.next = function () {
        this._queue.shift();
        this._start()
    }, AjaxQueue.prototype._start = function () {
        if (this._queue.length == 0) {
            return
        }
        this._retry = 0;
        this._queue[0]()
    };
    AjaxQueue.prototype.stop = function () {
        this._queue = [];
        this._stopped = true
    };
    window.AjaxQueue = AjaxQueue
}());
(function ($) {
    var o = $({});
    $.sub = function () {
        o.on.apply(o, arguments)
    };
    $.unsub = function () {
        o.off.apply(o, arguments)
    };
    $.pub = function () {
        o.trigger.apply(o, arguments)
    }
}(jQuery));

(function ($) {
    function placeholder() {
        var isInputSupported = "placeholder" in document.createElement("input"),
            isTextareaSupported = "placeholder" in document.createElement("textarea"), placeHolder_idx = 100000,
            g = function (id) {
                return document.getElementById(id)
            };
        if (isInputSupported || isTextareaSupported) {
            return
        }
        $("[placeholder]").each(function () {
            var el = this;
            var __placeholderTimer = null;
            var placeHolderElId = "placeHolder-" + placeHolder_idx++;
            el.setAttribute("placeHolderEl", placeHolderElId);
            el.parentNode.style.position = "relative";
            var position = $(el).position();
            var holderVal = $(el).attr("placeholder");
            var inputPaddingTop = $(el).css("padding-top");
            var inputBorderTop = $(el).css("border-top-width");
            var inputPaddingLeft = $(el).css("padding-left");
            var inputFontSize = $(el).css("font-size");
            var elPlaceHolder = $('<span style="color:#999; font-size:16px; padding: 9px 4px; position:absolute; display:none;"></span>');
            elPlaceHolder.css({
                left: position.left + 1,
                top: position.top + 1,
                "padding-top": inputPaddingTop + inputBorderTop,
                "padding-left": inputPaddingLeft,
                "font-size": inputFontSize
            });
            elPlaceHolder.html(holderVal);
            elPlaceHolder.attr("id", placeHolderElId);
            el.parentNode.insertBefore(elPlaceHolder[0], el);
            if (el.value == "") {
                elPlaceHolder.show()
            }
            elPlaceHolder.on("click", function (e) {
                try {
                    el.focus()
                } catch (ex) {
                }
            });
            $(el).on("keydown", function (e) {
                var oldval = $(this).val();
                oldval = $.trim(oldval);
                var placeHolderEl = $(this).attr("placeHolderEl");
                $(g(placeHolderEl)).hide()
            }).on("blur", function (e) {
                var oldval;
                var that = $(this);
                var placeHolderEl = $(this).attr("placeHolderEl");
                clearTimeout(__placeholderTimer);
                __placeholderTimer = setTimeout(function () {
                    oldval = that.val();
                    oldval = $.trim(oldval);
                    if (oldval === "") {
                        $(g(placeHolderEl)).show()
                    }
                }, 600)
            })
        })
    }

    $.placeholder = placeholder
})(jQuery);

(function ($) {
    var _ = {};
    _.now = function () {
        return new Date().getTime()
    };
    var throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function () {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null
        };
        return function () {
            var now = _.now();
            if (!previous && options.leading === false) {
                previous = now
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null
            } else {
                if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining)
                }
            }
            return result
        }
    };
    var debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function () {
            var last = _.now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last)
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null
                }
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait)
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null
            }
            return result
        }
    };
    $.throttle = throttle;
    $.debounce = debounce
})(jQuery);
(function ($) {
    $.pwddecode = function (s) {
        return s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&#039;", "'")
    }
})(jQuery);