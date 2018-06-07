/*!
	Copyright (c) Baidu Youa Wed QWrap
	version: 1.1.5 2013-02-28 released
	author: QWrap 月影、JK、屈屈
*/
(function () {
    var QW = {
        VERSION: "1.1.5", RELEASE: "2013-02-28", PATH: (function () {
            var sTags = document.getElementsByTagName("script");
            return sTags[sTags.length - 1].src.replace(/(^|\/)[^\/]+\/[^\/]+$/, "$1")
        }()), namespace: function (sSpace, root) {
            var arr = sSpace.split("."), i = 0, nameI;
            if (sSpace.indexOf(".") == 0) {
                i = 1;
                root = root || QW
            }
            root = root || window;
            for (; nameI = arr[i++];) {
                if (!root[nameI]) {
                    root[nameI] = {}
                }
                root = root[nameI]
            }
            return root
        }, noConflict: (function () {
            var _previousQW = window.QW;
            return function () {
                window.QW = _previousQW;
                return QW
            }
        }()), loadJs: function (url, callback, options) {
            options = options || {};
            var head = document.getElementsByTagName("head")[0] || document.documentElement,
                script = document.createElement("script"), done = false;
            script.src = url;
            if (options.charset) {
                script.charset = options.charset
            }
            if ("async" in options) {
                script.async = options.async || ""
            }
            script.onerror = script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    done = true;
                    if (callback) {
                        callback()
                    }
                    script.onerror = script.onload = script.onreadystatechange = null;
                    head.removeChild(script)
                }
            };
            head.insertBefore(script, head.firstChild)
        }, loadJsonp: (function () {
            var seq = new Date() * 1;
            return function (url, callback, options) {
                options = options || {};
                var funName = "QWJsonp" + seq++, callbackReplacer = options.callbackReplacer || /%callbackfun%/ig;
                window[funName] = function (data) {
                    if (callback) {
                        callback(data)
                    }
                    window[funName] = null
                };
                if (callbackReplacer.test(url)) {
                    url = url.replace(callbackReplacer, funName)
                } else {
                    url += (/\?/.test(url) ? "&" : "?") + "callback=" + funName
                }
                QW.loadJs(url, options.oncomplete, options)
            }
        }()), loadCss: function (url) {
            var head = document.getElementsByTagName("head")[0] || document.documentElement,
                css = document.createElement("link");
            css.rel = "stylesheet";
            css.type = "text/css";
            css.href = url;
            head.insertBefore(css, head.firstChild)
        }, error: function (obj, type) {
            type = type || Error;
            throw new type(obj)
        }
    };
    window.QW = QW
}());
(function () {
    var StringH = {
        trim: function (s) {
            return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "")
        }, mulReplace: function (s, arr) {
            for (var i = 0; i < arr.length; i++) {
                s = s.replace(arr[i][0], arr[i][1])
            }
            return s
        }, format: function (s, arg0) {
            var args = arguments;
            return s.replace(/\{(\d+)\}/ig, function (a, b) {
                var ret = args[(b | 0) + 1];
                return ret == null ? "" : ret
            })
        }, tmpl: (function () {
            var sArrName = "sArrCMX", sLeft = sArrName + '.push("';
            var tags = {
                js: {tagG: "js", isBgn: 1, isEnd: 1, sBgn: '");', sEnd: ";" + sLeft},
                "if": {tagG: "if", isBgn: 1, rlt: 1, sBgn: '");if', sEnd: "{" + sLeft},
                elseif: {tagG: "if", cond: 1, rlt: 1, sBgn: '");} else if', sEnd: "{" + sLeft},
                "else": {tagG: "if", cond: 1, rlt: 2, sEnd: '");}else{' + sLeft},
                "/if": {tagG: "if", isEnd: 1, sEnd: '");}' + sLeft},
                "for": {tagG: "for", isBgn: 1, rlt: 1, sBgn: '");for', sEnd: "{" + sLeft},
                "/for": {tagG: "for", isEnd: 1, sEnd: '");}' + sLeft},
                "while": {tagG: "while", isBgn: 1, rlt: 1, sBgn: '");while', sEnd: "{" + sLeft},
                "/while": {tagG: "while", isEnd: 1, sEnd: '");}' + sLeft}
            };
            return function (sTmpl, opts) {
                var N = -1, NStat = [];
                var ss = [[/\{strip\}([\s\S]*?)\{\/strip\}/g, function (a, b) {
                    return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "")
                }], [/\\/g, "\\\\"], [/"/g, '\\"'], [/\r/g, "\\r"], [/\n/g, "\\n"], [/\{[\s\S]*?\S\}/g, function (a) {
                    a = a.substr(1, a.length - 2);
                    for (var i = 0; i < ss2.length; i++) {
                        a = a.replace(ss2[i][0], ss2[i][1])
                    }
                    var tagName = a;
                    if (/^(.\w+)\W/.test(tagName)) {
                        tagName = RegExp.$1
                    }
                    var tag = tags[tagName];
                    if (tag) {
                        if (tag.isBgn) {
                            var stat = NStat[++N] = {tagG: tag.tagG, rlt: tag.rlt}
                        }
                        if (tag.isEnd) {
                            if (N < 0) {
                                throw new Error("Unexpected Tag: " + a)
                            }
                            stat = NStat[N--];
                            if (stat.tagG != tag.tagG) {
                                throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName)
                            }
                        } else {
                            if (!tag.isBgn) {
                                if (N < 0) {
                                    throw new Error("Unexpected Tag:" + a)
                                }
                                stat = NStat[N];
                                if (stat.tagG != tag.tagG) {
                                    throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName)
                                }
                                if (tag.cond && !(tag.cond & stat.rlt)) {
                                    throw new Error("Unexpected Tag: " + tagName)
                                }
                                stat.rlt = tag.rlt
                            }
                        }
                        return (tag.sBgn || "") + a.substr(tagName.length) + (tag.sEnd || "")
                    } else {
                        return '",(' + a + '),"'
                    }
                }]];
                var ss2 = [[/\\n/g, "\n"], [/\\r/g, "\r"], [/\\"/g, '"'], [/\\\\/g, "\\"], [/\$(\w+)/g, 'opts["$1"]'], [/print\(/g, sArrName + ".push("]];
                for (var i = 0; i < ss.length; i++) {
                    sTmpl = sTmpl.replace(ss[i][0], ss[i][1])
                }
                if (N >= 0) {
                    throw new Error("Lose end Tag: " + NStat[N].tagG)
                }
                sTmpl = sTmpl.replace(/##7b/g, "{").replace(/##7d/g, "}").replace(/##23/g, "#");
                sTmpl = "var " + sArrName + "=[];" + sLeft + sTmpl + '");return ' + sArrName + '.join("");';
                var fun = new Function("opts", sTmpl);
                if (arguments.length > 1) {
                    return fun(opts)
                }
                return fun
            }
        }()), contains: function (s, subStr) {
            return s.indexOf(subStr) > -1
        }, dbc2sbc: function (s) {
            return StringH.mulReplace(s, [[/[\uff01-\uff5e]/g, function (a) {
                return String.fromCharCode(a.charCodeAt(0) - 65248)
            }], [/\u3000/g, " "], [/\u3002/g, "."]])
        }, byteLen: function (s) {
            return s.replace(/[^\x00-\xff]/g, "--").length
        }, subByte: function (s, len, tail) {
            if (StringH.byteLen(s) <= len) {
                return s
            }
            tail = tail || "";
            len -= StringH.byteLen(tail);
            return s.substr(0, len).replace(/([^\x00-\xff])/g, "$1 ").substr(0, len).replace(/[^\x00-\xff]$/, "").replace(/([^\x00-\xff]) /g, "$1") + tail
        }, capitalize: function (s) {
            return s.slice(0, 1).toUpperCase() + s.slice(1)
        }, camelize: function (s) {
            return s.replace(/\-(\w)/ig, function (a, b) {
                return b.toUpperCase()
            })
        }, decamelize: function (s) {
            return s.replace(/[A-Z]/g, function (a) {
                return "-" + a.toLowerCase()
            })
        }, encode4Js: function (s) {
            return StringH.mulReplace(s, [[/\\/g, "\\u005C"], [/"/g, "\\u0022"], [/'/g, "\\u0027"], [/\//g, "\\u002F"], [/\r/g, "\\u000A"], [/\n/g, "\\u000D"], [/\t/g, "\\u0009"]])
        }, escapeChars: function (s) {
            return StringH.mulReplace(s, [[/\\/g, "\\\\"], [/"/g, '\\"'], [/\r/g, "\\r"], [/\n/g, "\\n"], [/\t/g, "\\t"]])
        }, encode4Http: function (s) {
            return s.replace(/[\u0000-\u0020\u0080-\u00ff\s"'#\/\|\\%<>\[\]\{\}\^~;\?\:@=&]/g, function (a) {
                return encodeURIComponent(a)
            })
        }, encode4Html: function (s) {
            var el = document.createElement("pre");
            var text = document.createTextNode(s);
            el.appendChild(text);
            return el.innerHTML
        }, encode4HtmlValue: function (s) {
            return StringH.encode4Html(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;")
        }, decode4Html: function (s) {
            var div = document.createElement("div");
            div.innerHTML = StringH.stripTags(s);
            return div.childNodes[0] ? div.childNodes[0].nodeValue || "" : ""
        }, stripTags: function (s) {
            return s.replace(/<[^>]*>/gi, "")
        }, evalJs: function (s, opts) {
            return new Function("opts", s)(opts)
        }, evalExp: function (s, opts) {
            return new Function("opts", "return (" + s + ");")(opts)
        }, queryUrl: function (url, key) {
            url = url.replace(/^[^?=]*\?/ig, "").split("#")[0];
            var json = {};
            url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key, value) {
                try {
                    key = decodeURIComponent(key)
                } catch (e) {
                }
                try {
                    value = decodeURIComponent(value)
                } catch (e) {
                }
                if (!(key in json)) {
                    json[key] = /\[\]$/.test(key) ? [value] : value
                } else {
                    if (json[key] instanceof Array) {
                        json[key].push(value)
                    } else {
                        json[key] = [json[key], value]
                    }
                }
            });
            return key ? json[key] : json
        }, decodeURIJson: function (url) {
            return StringH.queryUrl(url)
        }
    };
    QW.StringH = StringH
}());
(function () {
    var escapeChars = QW.StringH.escapeChars;

    function getConstructorName(o) {
        if (o != null && o.constructor != null) {
            return Object.prototype.toString.call(o).slice(8, -1)
        } else {
            return ""
        }
    }

    var ObjectH = {
        isString: function (obj) {
            return getConstructorName(obj) == "String"
        }, isFunction: function (obj) {
            return getConstructorName(obj) == "Function"
        }, isArray: function (obj) {
            return getConstructorName(obj) == "Array"
        }, isArrayLike: function (obj) {
            return !!obj && typeof obj == "object" && obj.nodeType != 1 && typeof obj.length == "number"
        }, isObject: function (obj) {
            return obj !== null && typeof obj == "object"
        }, isPlainObject: function (obj) {
            return getConstructorName(obj) == "Object"
        }, isWrap: function (obj, coreName) {
            return !!(obj && obj[coreName || "core"])
        }, isElement: function (obj) {
            return !!obj && obj.nodeType == 1
        }, set: function (obj, prop, value) {
            if (ObjectH.isArray(prop)) {
                for (var i = 0; i < prop.length; i++) {
                    ObjectH.set(obj, prop[i], value[i])
                }
            } else {
                if (ObjectH.isPlainObject(prop)) {
                    for (i in prop) {
                        ObjectH.set(obj, i, prop[i])
                    }
                } else {
                    if (ObjectH.isFunction(prop)) {
                        var args = [].slice.call(arguments, 1);
                        args[0] = obj;
                        prop.apply(null, args)
                    } else {
                        var keys = prop.split(".");
                        i = 0;
                        for (var obj2 = obj, len = keys.length - 1; i < len; i++) {
                            obj2 = obj2[keys[i]]
                        }
                        obj2[keys[i]] = value
                    }
                }
            }
            return obj
        }, get: function (obj, prop, nullSensitive) {
            if (ObjectH.isArray(prop)) {
                var ret = [], i;
                for (i = 0; i < prop.length; i++) {
                    ret[i] = ObjectH.get(obj, prop[i], nullSensitive)
                }
            } else {
                if (ObjectH.isFunction(prop)) {
                    var args = [].slice.call(arguments, 1);
                    args[0] = obj;
                    return prop.apply(null, args)
                } else {
                    var keys = prop.split(".");
                    ret = obj;
                    for (i = 0; i < keys.length; i++) {
                        if (!nullSensitive && ret == null) {
                            return
                        }
                        ret = ret[keys[i]]
                    }
                }
            }
            return ret
        }, mix: function (des, src, override) {
            if (ObjectH.isArray(src)) {
                for (var i = 0, len = src.length; i < len; i++) {
                    ObjectH.mix(des, src[i], override)
                }
                return des
            }
            if (typeof override == "function") {
                for (i in src) {
                    des[i] = override(des[i], src[i], i)
                }
            } else {
                for (i in src) {
                    if (override || !(des[i] || (i in des))) {
                        des[i] = src[i]
                    }
                }
            }
            return des
        }, dump: function (obj, props) {
            var ret = {};
            for (var i = 0, len = props.length; i < len; i++) {
                if (i in props) {
                    var key = props[i];
                    if (key in obj) {
                        ret[key] = obj[key]
                    }
                }
            }
            return ret
        }, map: function (obj, fn, thisObj) {
            var ret = {};
            for (var key in obj) {
                ret[key] = fn.call(thisObj, obj[key], key, obj)
            }
            return ret
        }, keys: function (obj) {
            var ret = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret.push(key)
                }
            }
            return ret
        }, values: function (obj) {
            var ret = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret.push(obj[key])
                }
            }
            return ret
        }, create: function (proto, props) {
            var ctor = function (ps) {
                if (ps) {
                    ObjectH.mix(this, ps, true)
                }
            };
            ctor.prototype = proto;
            return new ctor(props)
        }, stringify: function (obj) {
            if (obj == null) {
                return "null"
            }
            if (typeof obj != "string" && obj.toJSON) {
                return obj.toJSON()
            }
            var type = getConstructorName(obj).toLowerCase();
            switch (type) {
                case"string":
                    return '"' + escapeChars(obj) + '"';
                case"number":
                    var ret = obj.toString();
                    return /N/.test(ret) ? "null" : ret;
                case"boolean":
                    return obj.toString();
                case"date":
                    return "new Date(" + obj.getTime() + ")";
                case"array":
                    var ar = [];
                    for (var i = 0; i < obj.length; i++) {
                        ar[i] = ObjectH.stringify(obj[i])
                    }
                    return "[" + ar.join(",") + "]";
                case"object":
                    if (ObjectH.isPlainObject(obj)) {
                        ar = [];
                        for (i in obj) {
                            ar.push('"' + escapeChars(i) + '":' + ObjectH.stringify(obj[i]))
                        }
                        return "{" + ar.join(",") + "}"
                    }
            }
            return "null"
        }, encodeURIJson: function (json) {
            var s = [];
            for (var p in json) {
                if (json[p] == null) {
                    continue
                }
                if (json[p] instanceof Array) {
                    for (var i = 0; i < json[p].length; i++) {
                        s.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p][i]))
                    }
                } else {
                    s.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]))
                }
            }
            return s.join("&")
        }
    };
    QW.ObjectH = ObjectH
}());
(function () {
    var isArray = QW.ObjectH.isArray;
    var ArrayH = {
        map: function (arr, callback, pThis) {
            var len = arr.length;
            var rlt = new Array(len);
            for (var i = 0; i < len; i++) {
                if (i in arr) {
                    rlt[i] = callback.call(pThis, arr[i], i, arr)
                }
            }
            return rlt
        }, forEach: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr) {
                    callback.call(pThis, arr[i], i, arr)
                }
            }
        }, filter: function (arr, callback, pThis) {
            var rlt = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                if ((i in arr) && callback.call(pThis, arr[i], i, arr)) {
                    rlt.push(arr[i])
                }
            }
            return rlt
        }, some: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr && callback.call(pThis, arr[i], i, arr)) {
                    return true
                }
            }
            return false
        }, every: function (arr, callback, pThis) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (i in arr && !callback.call(pThis, arr[i], i, arr)) {
                    return false
                }
            }
            return true
        }, indexOf: function (arr, obj, fromIdx) {
            var len = arr.length;
            fromIdx |= 0;
            if (fromIdx < 0) {
                fromIdx += len
            }
            if (fromIdx < 0) {
                fromIdx = 0
            }
            for (; fromIdx < len; fromIdx++) {
                if (fromIdx in arr && arr[fromIdx] === obj) {
                    return fromIdx
                }
            }
            return -1
        }, lastIndexOf: function (arr, obj, fromIdx) {
            var len = arr.length;
            fromIdx |= 0;
            if (!fromIdx || fromIdx >= len) {
                fromIdx = len - 1
            }
            if (fromIdx < 0) {
                fromIdx += len
            }
            for (; fromIdx > -1; fromIdx--) {
                if (fromIdx in arr && arr[fromIdx] === obj) {
                    return fromIdx
                }
            }
            return -1
        }, contains: function (arr, obj) {
            return (ArrayH.indexOf(arr, obj) >= 0)
        }, clear: function (arr) {
            arr.length = 0
        }, remove: function (arr, obj) {
            var idx = -1;
            for (var i = 1; i < arguments.length; i++) {
                var oI = arguments[i];
                for (var j = 0; j < arr.length; j++) {
                    if (oI === arr[j]) {
                        if (idx < 0) {
                            idx = j
                        }
                        arr.splice(j--, 1)
                    }
                }
            }
            return idx
        }, unique: function (arr) {
            var rlt = [], oI = null, indexOf = Array.indexOf || ArrayH.indexOf;
            for (var i = 0, len = arr.length; i < len; i++) {
                if (indexOf(rlt, oI = arr[i]) < 0) {
                    rlt.push(oI)
                }
            }
            return rlt
        }, reduce: function (arr, callback, initial) {
            var len = arr.length;
            var i = 0;
            if (arguments.length < 3) {
                var hasV = 0;
                for (; i < len; i++) {
                    if (i in arr) {
                        initial = arr[i++];
                        hasV = 1;
                        break
                    }
                }
                if (!hasV) {
                    throw new Error("No component to reduce")
                }
            }
            for (; i < len; i++) {
                if (i in arr) {
                    initial = callback(initial, arr[i], i, arr)
                }
            }
            return initial
        }, reduceRight: function (arr, callback, initial) {
            var len = arr.length;
            var i = len - 1;
            if (arguments.length < 3) {
                var hasV = 0;
                for (; i > -1; i--) {
                    if (i in arr) {
                        initial = arr[i--];
                        hasV = 1;
                        break
                    }
                }
                if (!hasV) {
                    throw new Error("No component to reduceRight")
                }
            }
            for (; i > -1; i--) {
                if (i in arr) {
                    initial = callback(initial, arr[i], i, arr)
                }
            }
            return initial
        }, expand: function (arr, shallow) {
            var ret = [], i = 0, len = arr.length;
            for (; i < len; i++) {
                if (isArray(arr[i])) {
                    ret = ret.concat(shallow ? arr[i] : ArrayH.expand(arr[i]))
                } else {
                    ret.push(arr[i])
                }
            }
            return ret
        }, toArray: function (arr) {
            var ret = [];
            for (var i = 0; i < arr.length; i++) {
                ret[i] = arr[i]
            }
            return ret
        }, wrap: function (arr, constructor) {
            return new constructor(arr)
        }
    };
    QW.ArrayH = ArrayH
}());
(function () {
    var contains = QW.ArrayH.contains;
    var HashsetH = {
        union: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr2.length; i < len; i++) {
                if (!contains(arr, arr2[i])) {
                    ra.push(arr2[i])
                }
            }
            return arr.concat(ra)
        }, intersect: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr2.length; i < len; i++) {
                if (contains(arr, arr2[i])) {
                    ra.push(arr2[i])
                }
            }
            return ra
        }, minus: function (arr, arr2) {
            var ra = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                if (!contains(arr, arr2[i])) {
                    ra.push(arr[i])
                }
            }
            return ra
        }, complement: function (arr, arr2) {
            return HashsetH.minus(arr, arr2).concat(HashsetH.minus(arr2, arr))
        }
    };
    QW.HashsetH = HashsetH
}());
(function () {
    var DateH = {
        format: function (d, pattern) {
            pattern = pattern || "yyyy-MM-dd";
            var y = d.getFullYear().toString(),
                o = {M: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), m: d.getMinutes(), s: d.getSeconds()};
            pattern = pattern.replace(/(y+)/ig, function (a, b) {
                return y.substr(4 - Math.min(4, b.length))
            });
            for (var i in o) {
                pattern = pattern.replace(new RegExp("(" + i + "+)", "g"), function (a, b) {
                    return (o[i] < 10 && b.length > 1) ? "0" + o[i] : o[i]
                })
            }
            return pattern
        }
    };
    QW.DateH = DateH
}());
(function () {
    var FunctionH = {
        methodize: function (func, attr) {
            if (attr) {
                return function () {
                    return func.apply(null, [this[attr]].concat([].slice.call(arguments)))
                }
            }
            return function () {
                return func.apply(null, [this].concat([].slice.call(arguments)))
            }
        }, mul: function (func, opt) {
            var getFirst = opt == 1, joinLists = opt == 2, getFirstDefined = opt == 3;
            if (getFirst) {
                return function () {
                    var list = arguments[0];
                    if (!(list instanceof Array)) {
                        return func.apply(this, arguments)
                    }
                    if (list.length) {
                        var args = [].slice.call(arguments);
                        args[0] = list[0];
                        return func.apply(this, args)
                    }
                }
            }
            return function () {
                var list = arguments[0];
                if (list instanceof Array) {
                    var moreArgs = [].slice.call(arguments), ret = [], i = 0, len = list.length, r;
                    for (; i < len; i++) {
                        moreArgs[0] = list[i];
                        r = func.apply(this, moreArgs);
                        if (joinLists) {
                            if (r != null) {
                                ret = ret.concat(r)
                            }
                        } else {
                            if (getFirstDefined) {
                                if (r !== undefined) {
                                    return r
                                }
                            } else {
                                ret.push(r)
                            }
                        }
                    }
                    return getFirstDefined ? undefined : ret
                } else {
                    return func.apply(this, arguments)
                }
            }
        }, rwrap: function (func, wrapper, opt, keepReturnValue) {
            if (opt == null) {
                opt = 0
            }
            return function () {
                var ret = func.apply(this, arguments);
                if (keepReturnValue && ret !== undefined) {
                    return ret
                }
                if (opt >= 0) {
                    ret = arguments[opt]
                } else {
                    if (opt == "this" || opt == "context") {
                        ret = this
                    }
                }
                return wrapper ? new wrapper(ret) : ret
            }
        }, hook: function (func, where, handler) {
            if (where == "before") {
                return function () {
                    var args = [].slice.call(arguments);
                    if (false !== handler.call(this, args, func, where)) {
                        return func.apply(this, args)
                    }
                }
            } else {
                if (where == "after") {
                    return function () {
                        var args = [].slice.call(arguments);
                        var ret = func.apply(this, args);
                        return handler.call(this, ret, func, where)
                    }
                } else {
                    throw new Error("unknow hooker:" + where)
                }
            }
        }, bind: function (func, obj) {
            var slice = [].slice, args = slice.call(arguments, 2), nop = function () {
            }, bound = function () {
                return func.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)))
            };
            nop.prototype = func.prototype;
            bound.prototype = new nop();
            return bound
        }, lazyApply: function (fun, thisObj, argArray, ims, checker) {
            checker = checker || function () {
                return true
            };
            var timer = function () {
                var verdict = checker();
                if (verdict == 1) {
                    fun.apply(thisObj, argArray || [])
                }
                if (verdict == 1 || verdict == -1) {
                    clearInterval(timerId)
                }
            }, timerId = setInterval(timer, ims);
            return timerId
        }
    };
    QW.FunctionH = FunctionH
}());
(function () {
    var mix = QW.ObjectH.mix, create = QW.ObjectH.create;
    var ClassH = {
        createInstance: function (cls) {
            var p = create(cls.prototype);
            cls.apply(p, [].slice.call(arguments, 1));
            return p
        }, extend: function (cls, p) {
            function comboParents(parents) {
                var T = function () {
                };
                T.prototype = parents[0].prototype;
                for (var i = 1; i < parents.length; i++) {
                    var P = parents[i];
                    mix(T.prototype, P.prototype)
                }
                return new T()
            }

            var cp = cls.prototype;
            cls.prototype = comboParents([].slice.call(arguments, 1));
            cls.$super = p;
            mix(cls.prototype, cp, true);
            return cls
        }
    };
    QW.ClassH = ClassH
}());
(function () {
    var FunctionH = QW.FunctionH, create = QW.ObjectH.create, isPlainObject = QW.ObjectH.isPlainObject,
        Methodized = function () {
        };
    var HelperH = {
        rwrap: function (helper, wrapper, wrapConfig) {
            var ret = create(helper);
            wrapConfig = wrapConfig || "operator";
            for (var i in helper) {
                var wrapType = wrapConfig, fn = helper[i];
                if (fn instanceof Function) {
                    if (typeof wrapType != "string") {
                        wrapType = wrapConfig[i] || ""
                    }
                    if ("queryer" == wrapType) {
                        ret[i] = FunctionH.rwrap(fn, wrapper, "returnValue")
                    } else {
                        if ("operator" == wrapType) {
                            if (helper instanceof Methodized) {
                                ret[i] = FunctionH.rwrap(fn, wrapper, "this")
                            } else {
                                ret[i] = FunctionH.rwrap(fn, wrapper, 0)
                            }
                        } else {
                            if ("gsetter" == wrapType) {
                                if (helper instanceof Methodized) {
                                    ret[i] = FunctionH.rwrap(fn, wrapper, "this", true)
                                } else {
                                    ret[i] = FunctionH.rwrap(fn, wrapper, 0, true)
                                }
                            }
                        }
                    }
                }
            }
            return ret
        }, gsetter: function (helper, gsetterConfig) {
            var ret = create(helper);
            gsetterConfig = gsetterConfig || {};
            for (var i in gsetterConfig) {
                ret[i] = (function (config, extra) {
                    return function () {
                        var offset = arguments.length;
                        offset -= extra;
                        if (isPlainObject(arguments[extra])) {
                            offset++
                        }
                        return ret[config[Math.min(offset, config.length - 1)]].apply(this, arguments)
                    }
                }(gsetterConfig[i], helper instanceof Methodized ? 0 : 1))
            }
            return ret
        }, mul: function (helper, mulConfig) {
            var ret = create(helper);
            mulConfig = mulConfig || {};
            var getAll = 0, getFirst = 1, joinLists = 2, getFirstDefined = 3;
            for (var i in helper) {
                var fn = helper[i];
                if (fn instanceof Function) {
                    var mulType = mulConfig;
                    if (typeof mulType != "string") {
                        mulType = mulConfig[i] || ""
                    }
                    if ("getter" == mulType || "getter_first" == mulType || "getter_first_all" == mulType) {
                        ret[i] = FunctionH.mul(fn, getFirst)
                    } else {
                        if ("getter_all" == mulType) {
                            ret[i] = FunctionH.mul(fn, getAll)
                        } else {
                            if ("gsetter" == mulType) {
                                ret[i] = FunctionH.mul(fn, getFirstDefined)
                            } else {
                                ret[i] = FunctionH.mul(fn, joinLists)
                            }
                        }
                    }
                    if ("getter" == mulType || "getter_first_all" == mulType) {
                        ret[i + "All"] = FunctionH.mul(fn, getAll)
                    }
                }
            }
            return ret
        }, methodize: function (helper, attr, preserveEveryProps) {
            var ret = new Methodized();
            for (var i in helper) {
                var fn = helper[i];
                if (fn instanceof Function) {
                    ret[i] = FunctionH.methodize(fn, attr)
                } else {
                    if (preserveEveryProps) {
                        ret[i] = fn
                    }
                }
            }
            return ret
        }
    };
    QW.HelperH = HelperH
}());
(function () {
    QW.JSON = {
        parse: function (text) {
            if (/^[[\],:{}\s0]*$/.test(text.replace(/\\\\|\\"|\\'|\w+\s*\:|null|true|false|[+\-eE.]|new Date(\d*)/g, "0").replace(/"[^"]*"|'[^']*'|\d+/g, "0"))) {
                return new Function("return (" + text + ");")()
            }
            throw"Invalid JSON format in executing JSON.parse"
        }, stringify: function (value) {
            return QW.ObjectH.stringify(value)
        }
    }
}());
(function () {
    QW.NumberH = {
        toFixed: function (num, len) {
            var s, temp, tempNum = 0, s1 = num + "", start = s1.indexOf(".");
            if (s1.substr(start + len + 1, 1) >= 5) {
                tempNum = 1
            }
            var temp = Math.pow(10, len);
            s = Math.floor(this * temp) + tempNum;
            return s / temp
        }
    }
}());
(function () {
    var mix = QW.ObjectH.mix, indexOf = QW.ArrayH.indexOf;
    var CustEvent = function (target, type, eventArgs) {
        this.target = target;
        this.type = type;
        mix(this, eventArgs || {})
    };
    mix(CustEvent.prototype, {
        target: null,
        currentTarget: null,
        type: null,
        returnValue: undefined,
        preventDefault: function () {
            this.returnValue = false
        }
    });
    var CustEventTargetH = {
        on: function (target, sEvent, fn) {
            var cbs = target.__custListeners && target.__custListeners[sEvent];
            if (!cbs) {
                CustEventTargetH.createEvents(target, sEvent);
                cbs = target.__custListeners && target.__custListeners[sEvent]
            }
            if (indexOf(cbs, fn) > -1) {
                return false
            }
            cbs.push(fn);
            return true
        }, un: function (target, sEvent, fn) {
            var cbs = target.__custListeners && target.__custListeners[sEvent];
            if (!cbs) {
                return false
            }
            if (fn) {
                var idx = indexOf(cbs, fn);
                if (idx < 0) {
                    return false
                }
                cbs.splice(idx, 1)
            } else {
                cbs.length = 0
            }
            return true
        }, fire: function (target, sEvent, eventArgs) {
            if (sEvent instanceof CustEvent) {
                var custEvent = mix(sEvent, eventArgs);
                sEvent = sEvent.type
            } else {
                custEvent = new CustEvent(target, sEvent, eventArgs)
            }
            var cbs = target.__custListeners && target.__custListeners[sEvent];
            if (!cbs) {
                CustEventTargetH.createEvents(target, sEvent);
                cbs = target.__custListeners && target.__custListeners[sEvent]
            }
            if (sEvent != "*") {
                cbs = cbs.concat(target.__custListeners["*"] || [])
            }
            custEvent.returnValue = undefined;
            custEvent.currentTarget = target;
            var obj = custEvent.currentTarget;
            if (obj && obj["on" + custEvent.type]) {
                var retDef = obj["on" + custEvent.type].call(obj, custEvent)
            }
            for (var i = 0; i < cbs.length; i++) {
                cbs[i].call(obj, custEvent)
            }
            return custEvent.returnValue !== false && (retDef !== false || custEvent.returnValue !== undefined)
        }, createEvents: function (target, types) {
            types = types || [];
            if (typeof types == "string") {
                types = types.split(",")
            }
            var listeners = target.__custListeners;
            if (!listeners) {
                listeners = target.__custListeners = {}
            }
            for (var i = 0; i < types.length; i++) {
                listeners[types[i]] = listeners[types[i]] || []
            }
            listeners["*"] = listeners["*"] || [];
            return target
        }
    };
    var CustEventTarget = function () {
        this.__custListeners = {}
    };
    var methodized = QW.HelperH.methodize(CustEventTargetH);
    mix(CustEventTarget.prototype, methodized);
    CustEvent.createEvents = function (target, types) {
        CustEventTargetH.createEvents(target, types);
        return mix(target, methodized)
    };
    QW.CustEvent = CustEvent;
    QW.CustEventTargetH = CustEventTargetH;
    QW.CustEventTarget = CustEventTarget
}());
(function () {
    var methodize = QW.HelperH.methodize, mix = QW.ObjectH.mix;
    mix(Object, QW.ObjectH);
    mix(QW.ArrayH, QW.HashsetH);
    mix(Array, QW.ArrayH);
    mix(Array.prototype, methodize(QW.ArrayH));
    mix(QW.FunctionH, QW.ClassH);
    mix(Function, QW.FunctionH);
    mix(Date, QW.DateH);
    mix(Date.prototype, methodize(QW.DateH));
    mix(String, QW.StringH);
    mix(String.prototype, methodize(QW.StringH));
    mix(Number, QW.NumberH);
    mix(Number.prototype, methodize(QW.NumberH))
}());
QW.ObjectH.mix(window, QW);