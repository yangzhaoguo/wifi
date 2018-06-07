/*!
 * valid.js version 0.1.0
 * Copyright (c) 2014 miwifi.com
 */
(function ($) {
    var g = function (el, doc) {
            if ("string" == typeof el) {
                if (el.indexOf("<") == 0) {
                    return $(el)[0]
                }
                var retEl = (doc || document).getElementById(el), els;
                if (retEl && retEl.id != el) {
                    els = (doc || document).getElementsByName(el);
                    for (var i = 0; i < els.length; i++) {
                        if (els[i].id == el) {
                            return els[i]
                        }
                    }
                    return null
                }
                return retEl
            } else {
                return (ObjectH.isWrap(el)) ? arguments.callee(el[0]) : el
            }
        }, getAttr2 = function (el, attr) {
            return el[attr] || el.getAttribute(attr) || getJsAttr(el, attr)
        }, mix = ObjectH.mix, trim = StringH.trim, tmpl = StringH.tmpl, dbc2sbc = StringH.dbc2sbc,
        byteLen = function (str) {
            var m = encodeURIComponent(str).match(/%[89ABab]/g);
            return str.length + (m ? m.length : 0)
        }, evalExp = StringH.evalExp, formatDate = QW.DateH.format, getValue = function (el) {
            return trim(g(el).value)
        }, CustEvent = QW.CustEvent;
    QW.NodeH = {g: g};
    var getJsAttr = function (el, attribute) {
        var CheckRules = Valid.CheckRules;
        if (!CheckRules) {
            return null
        }
        attribute = attribute.toLowerCase();
        el = g(el);
        var keys = [];
        if (el.id) {
            keys.push("#" + el.id)
        }
        if (el.name) {
            keys.push("@" + el.name)
        }
        keys = keys.concat(el.className.match(/\.[\w\-]+/g) || [], (el.tagName + "").toLowerCase());
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if ((key in CheckRules) && (attribute in CheckRules[key])) {
                return CheckRules[key][attribute]
            }
        }
        return null
    };
    var Valid = {
        VERSION: "0.0.1",
        EVENTS: "hint,blur,pass,fail,beforecheckall,checkall,initall".split(","),
        REQ_ATTR: "reqMsg",
        _curReqAttr: "reqMsg"
    };
    CustEvent.createEvents(Valid, Valid.EVENTS);
    mix(Valid, {
        hint: function (el) {
            Valid.fire(new CustEvent(el, "hint"))
        }, blur: function (el) {
            Valid.fire(new CustEvent(el, "blur"))
        }, pass: function (el) {
            Valid.fire(new CustEvent(el, "pass"))
        }, fail: function (el, errMsg, needFocus) {
            if (needFocus) {
                Valid.focusFailEl(el)
            }
            var ce = new CustEvent(el, "fail");
            ce.errMsg = errMsg;
            setTimeout(function () {
                Valid.fire(ce)
            }, 0)
        }, checkAll_stamp: 1, isChecking: false, checkAll: function (oForm, needFocus, opts) {
            needFocus = (needFocus != false);
            var ce = new CustEvent(oForm, "beforecheckall");
            ce.opts = opts || {};
            Valid.fire(ce);
            Valid.isChecking = true;
            var els = oForm.elements, failEls = [];
            for (var i = 0, el; el = els[i++];) {
                if (!getAttr2(el, "forceVld") && (el.disabled || el.readOnly || !el.offsetWidth)) {
                    continue
                }
                if (!Valid.check(el, false, opts)) {
                    failEls.push(el)
                }
            }
            var isOk = !failEls.length;
            var ce2 = new CustEvent(oForm, "checkall");
            ce2.result = isOk;
            ce2.failEls = failEls;
            Valid.fire(ce2);
            Valid.isChecking = false;
            Valid.checkAll_stamp++;
            if (!isOk && needFocus) {
                window.setTimeout(function () {
                    Valid.check(failEls[0], true, opts)
                }, 10)
            }
            return isOk
        }, check: function (el, needFocus, opts) {
            if (!Validators.required(el) || getAttr2(el, "datatype") && !Validators.datatype(el) || (opts && opts.myValidator && !opts.myValidator(el))) {
                if (needFocus) {
                    Valid.focusFailEl(el);
                    Valid.check(el, false, opts)
                }
                return false
            }
            return true
        }, renderResult: function (el, result, errMsg, needFocus) {
            if (result) {
                Valid.pass(el)
            } else {
                Valid.fail(el, errMsg, needFocus)
            }
        }, focusFailEl: function (el) {
            var fEl = getAttr2(el, "focusEl");
            fEl = fEl && g(fEl) || el;
            try {
                fEl.focus();
                if (!fEl.tagName) {
                    return
                }
                fEl.select()
            } catch (e) {
            }
        }, initAll: function (container) {
            if (!Valid._isInitialized) {
                Valid._isInitialized = true;
                if (document.addEventListener) {
                    document.addEventListener("focus", function (e) {
                        var el = e.target;
                        if (el && ",INPUT,SELECT,TEXTAREA,OBJECT".indexOf("," + el.tagName) > -1) {
                            Valid.hint(el)
                        }
                    }, true);
                    document.addEventListener("blur", function (e) {
                        var el = e.target;
                        if (el && ",INPUT,SELECT,TEXTAREA,OBJECT".indexOf("," + el.tagName) > -1) {
                            Valid.blur(el)
                        }
                    }, true);
                    document.addEventListener("click", function (e) {
                        var el = e.target;
                        if (el.type == "checkbox" || el.type == "radio") {
                            Valid.blur(el)
                        }
                    })
                } else {
                    document.attachEvent("onfocusin", function (e) {
                        Valid.hint(e.srcElement)
                    });
                    document.attachEvent("onfocusout", function (e) {
                        Valid.blur(e.srcElement)
                    })
                }
            }
            var els = $(container).find("input");
            for (var i = 0; i < els.length; i++) {
                Valid.initEl(els[i])
            }
            var ce = new CustEvent(container, "initall");
            Valid.fire(ce)
        }, initEl: function (el) {
            var dataType = getAttr2(el, "datatype");
            if (dataType == "d" || dataType == "daterange") {
                var nextEl = el.nextSibling;
                if (nextEl && nextEl.tagName == "IMG") {
                    return
                }
                var img = Utils.getCalendarImg().cloneNode(true);
                img.onclick = function (e) {
                    Utils.pickDate(el)
                };
                el.parentNode.insertBefore(img, nextEl)
            }
        }, resetAll: function (oForm) {
            var els = oForm.elements;
            for (var i = 0, el; el = els[i++];) {
                Valid.pass(el)
            }
        }
    });
    var Msgs = Valid.Msgs = mix(i18n.valid, {
        getMsg: function (el, msgKey) {
            return getAttr2(el, msgKey) || getAttr2(el, "errmsg") || Msgs[msgKey] || msgKey
        }
    });
    var Utils = Valid.Utils = {
        setTextValue: function (el, value) {
            if (el.createTextRange) {
                el.createTextRange().text = value
            } else {
                el.value = value
            }
        }, trimTextValue: function (el) {
            var s = trim(el.value);
            if (s != el.value) {
                Utils.setTextValue(el, s)
            }
        }, dbc2sbcValue: function (el) {
            var s = dbc2sbc(getValue(el));
            if (s != getValue(el)) {
                Utils.setTextValue(el, s)
            }
        }, prepare4Vld: function (el) {
            if (getAttr2(el, "ignoredbc")) {
                Utils.dbc2sbcValue(el)
            }
            if (el.type == "text" || el.type == "textarea") {
                Utils.trimTextValue(el)
            }
        }
    };
    var Validators = Valid.Validators = {};
    mix(Validators, [{
        required: function (el, renderResult) {
            Utils.prepare4Vld(el);
            var reqAttr = Valid._curReqAttr || Valid.REQ_ATTR;
            var sReq = getAttr2(el, reqAttr);
            if (sReq) {
                var reqlogic = getAttr2(el, "reqlogic");
                if (reqlogic) {
                    return Validators.logicrequired(el, renderResult, reqlogic)
                } else {
                    var isOk = false;
                    var msgKey = "_req_text";
                    if (el.tagName == "SELECT") {
                        isOk = (el.value != "" || el.length < 2 || (el.length == 2 && el.options[1].value == ""));
                        msgKey = "_req_select"
                    } else {
                        if (el.type == "checkbox" || el.type == "radio") {
                            var els = document.getElementsByName(el.name);
                            for (var i = 0; i < els.length; i++) {
                                if (isOk = els[i].checked) {
                                    break
                                }
                            }
                            msgKey = "_req_select"
                        } else {
                            isOk = (getValue(el) != "");
                            if (el.type == "file") {
                                msgKey = "_req_file"
                            }
                        }
                    }
                    if (renderResult != false) {
                        Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs[msgKey], [sReq]))
                    }
                    return isOk
                }
            }
            return true
        }, datatype: function (el, renderResult, datatype) {
            datatype = datatype || getAttr2(el, "datatype");
            if (!datatype) {
                Valid.pass(el, renderResult);
                return true
            }
            var dt = datatype.split("-")[0].toLowerCase(), pattern = datatype.substr(dt.length + 1),
                cb = Validators[dt];
            if (!cb) {
                throw"Unknown datatype: " + datatype
            }
            return pattern ? cb(el, renderResult, pattern) : cb(el, renderResult)
        }, n: function (el, renderResult, pattern) {
            Utils.prepare4Vld(el);
            Utils.dbc2sbcValue(el);
            var val = getValue(el);
            var isOk = (val == "");
            var msg = null;
            if (!isOk) {
                var patternArr = (pattern || getAttr2(el, "n-pattern") || "10").split(".");
                var len = patternArr[0] | 0 || 10, precision = patternArr[1] | 0;
                if (precision < 1) {
                    if ((/\D/).test(val) || val.length > len) {
                        msg = tmpl(Msgs.getMsg(el, "n_integer"), [len])
                    }
                } else {
                    var s = "^\\d{1,100}(\\.\\d{1," + precision + "})?$";
                    if (!(new RegExp(s)).test(val)) {
                        msg = tmpl(Msgs.getMsg(el, "n_format"), [(new Array(len - precision + 1)).join("X") + "." + (new Array(precision + 1)).join("X")])
                    }
                }
                if ((/^0\d/).test(val)) {
                    msg = Msgs.getMsg(el, "n_useless_zero")
                }
                if (!msg) {
                    var maxV = getAttr2(el, "maxValue") || Math.pow(10, len - precision) - Math.pow(10, -precision);
                    if (maxV && (parseFloat(val, 10) > maxV - 0)) {
                        msg = tmpl(Msgs.getMsg(el, "n_upper"), [maxV, val])
                    }
                    var minV = getAttr2(el, "minValue");
                    if (minV && parseFloat(val, 10) < minV - 0) {
                        msg = tmpl(Msgs.getMsg(el, "n_lower"), [minV, val])
                    }
                }
                if (msg) {
                    isOk = false
                } else {
                    isOk = true
                }
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, msg)
            }
            return isOk
        }, nrange: function (el, renderResult, pattern) {
            var isOk = Validators.n(el, renderResult, pattern);
            if (isOk) {
                var fromNEl = g(getAttr2(el, "fromNEl"));
                var toNEl = g(getAttr2(el, "toNEl"));
                if (fromNEl) {
                    toNEl = el
                } else {
                    if (toNEl) {
                        fromNEl = el
                    } else {
                        var els = el.parentNode.getElementsByTagName("input");
                        if (els[0] == el) {
                            fromNEl = el;
                            toNEl = els[1]
                        } else {
                            fromNEl = els[0];
                            toNEl = el
                        }
                    }
                }
                var relEl = el == fromNEl ? toNEl : fromNEl;
                var isOk2 = Validators.n(relEl, renderResult, pattern);
                if (isOk2) {
                    if (getValue(relEl) && getValue(el)) {
                        if (getValue(fromNEl) * 1 > getValue(toNEl) * 1) {
                            isOk = false;
                            if (el == fromNEl) {
                                Valid.fail(fromNEl, Msgs.getMsg(fromNEl, "nrange_from"))
                            }
                            if (el == toNEl) {
                                Valid.fail(toNEl, Msgs.getMsg(toNEl, "nrange_to"))
                            }
                        }
                    }
                }
            }
            return isOk
        }, d: function (el, renderResult) {
            Utils.prepare4Vld(el);
            Utils.dbc2sbcValue(el);
            var val = getValue(el);
            var isOk = (val == "");
            var msg = null;
            if (!isOk) {
                val = val.replace(/(^\D+)|(\D+$)/g, "").replace(/\D+/g, "/");
                if (!(/\D/).test(val)) {
                    if (val.length == 8) {
                        val = val.substr(0, 4) + "/" + val.substr(4, 2) + "/" + val.substr(6, 2)
                    }
                }
                var tempD = new Date(val);
                if (!isNaN(tempD)) {
                    var nStrs = val.split(/\D+/ig);
                    if (nStrs.length == 3 && nStrs[0].length == 4 && nStrs[2].length < 3) {
                        isOk = true;
                        if (formatDate(tempD) != getValue(el)) {
                            Utils.setTextValue(el, formatDate(tempD));
                            val = getValue(el)
                        }
                    }
                }
                if (!isOk) {
                    msg = Msgs.getMsg(el, "d_format")
                } else {
                    var maxV = getAttr2(el, "maxValue") || "2049-12-31";
                    if (tempD > new Date(maxV.replace(/\D+/g, "/"))) {
                        isOk = false;
                        msg = tmpl(Msgs.getMsg(el, "d_upper"), [maxV, val])
                    }
                    var minV = getAttr2(el, "minValue") || "1900-01-01";
                    if (tempD < new Date(minV.replace(/\D+/g, "/"))) {
                        isOk = false;
                        msg = tmpl(Msgs.getMsg(el, "d_lower"), [minV, val])
                    }
                }
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, msg)
            }
            return isOk
        }, daterange: function (el, renderResult) {
            var isOk = Validators.d(el, renderResult);
            if (isOk) {
                var fromDateEl = g(getAttr2(el, "fromDateEl"));
                var toDateEl = g(getAttr2(el, "toDateEl"));
                if (fromDateEl) {
                    toDateEl = el
                } else {
                    if (toDateEl) {
                        fromDateEl = el
                    } else {
                        var els = el.parentNode.getElementsByTagName("input");
                        if (els[0] == el) {
                            fromDateEl = el;
                            toDateEl = els[1]
                        } else {
                            fromDateEl = els[0];
                            toDateEl = el
                        }
                    }
                }
                var relEl = el == fromDateEl ? toDateEl : fromDateEl;
                var isOk2 = Validators.d(relEl, renderResult);
                if (isOk2) {
                    if (getValue(relEl) && getValue(el)) {
                        if (getValue(fromDateEl) > getValue(toDateEl)) {
                            isOk = false;
                            if (el == fromDateEl) {
                                Valid.fail(fromDateEl, Msgs.getMsg(fromDateEl, "daterange_from"))
                            }
                            if (el == toDateEl) {
                                Valid.fail(toDateEl, Msgs.getMsg(toDateEl, "daterange_to"))
                            }
                        }
                        if (getValue(fromDateEl) && getValue(toDateEl)) {
                            var maxDateSpan = getAttr2(fromDateEl, "maxDateSpan") || getAttr2(toDateEl, "maxDateSpan");
                            if (maxDateSpan && (new Date(getValue(toDateEl).replace(/-/g, "/")) - new Date(getValue(fromDateEl).replace(/-/g, "/"))) > (maxDateSpan - 1) * 24 * 3600000) {
                                Valid.fail(el, tmpl(Msgs.getMsg(el, "daterange_larger_span"), [maxDateSpan]));
                                isOk = false
                            }
                        }
                    }
                }
            }
            return isOk
        }, _checkLength: function (el, renderResult, getLengthFun, dataType) {
            Utils.prepare4Vld(el);
            var val = getValue(el);
            var isOk = (val == "");
            var msg = null;
            if (!isOk) {
                var maxLen = (getAttr2(el, "maxLength") || 1024) | 0;
                var minLen = getAttr2(el, "minLength") | 0;
                var curLen = getLengthFun(el);
                if (curLen > maxLen) {
                    msg = tmpl(Msgs[dataType + "_longer"] || Msgs.getMsg(el, "text_longer"), [maxLen, curLen])
                } else {
                    if (curLen < minLen) {
                        msg = tmpl(Msgs[dataType + "_shorter"] || Msgs.getMsg(el, "text_shorter"), [minLen, curLen])
                    } else {
                        isOk = true
                    }
                }
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, msg)
            }
            return isOk
        }, text: function (el, renderResult) {
            return Validators._checkLength(el || this, renderResult, function (a) {
                return getValue(a).length
            }, "text")
        }, bytetext: function (el, renderResult) {
            return Validators._checkLength(el || this, renderResult, function (a) {
                return byteLen(getValue(a))
            }, "bytetext")
        }, richtext: function (el, renderResult) {
            return Validators._checkLength(el || this, renderResult, function (a) {
                var s = getValue(a);
                if (getAttr2(a, "ignoreTag")) {
                    return s.replace(/<img[^>]*>/g, "a").replace(/<[^>]*>/g, "").length
                } else {
                    return s.length
                }
            }, "richtext")
        }, idnumber: function (el, renderResult) {
            Utils.prepare4Vld(el);
            Utils.dbc2sbcValue(el);
            var val = getValue(el);
            var isOk = (val == "");
            if (!isOk) {
                if ((/^\d{15}$/).test(val)) {
                    isOk = true
                } else {
                    if ((/^\d{17}[0-9xX]$/).test(val)) {
                        var vs = "1,0,x,9,8,7,6,5,4,3,2".split(","),
                            ps = "7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2".split(","), ss = val.toLowerCase().split(""),
                            r = 0;
                        for (var i = 0; i < 17; i++) {
                            r += ps[i] * ss[i]
                        }
                        isOk = (vs[r % 11] == ss[17])
                    }
                }
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_idnumber"))
            }
            return isOk
        }, cnname: function (el, renderResult) {
            Utils.prepare4Vld(el);
            var val = getValue(el);
            var isOk = (val == "");
            if (!isOk) {
                isOk = byteLen(val) <= 32 && /^[\u4e00-\u9fa5a-zA-Z.\u3002\u2022]{2,32}$/.test(val)
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_cnname"))
            }
            return isOk
        }, reconfirm: function (el, renderResult) {
            Utils.prepare4Vld(el);
            var oriEl = g(getAttr2(el, "reconfirmFor"));
            var isOk = (getValue(el) == getValue(oriEl));
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_reconfirm"))
            }
            return isOk
        }, imgfile: function (el, renderResult) {
            var val = getValue(el);
            var isOk = (val == "");
            if (!isOk) {
                var fExt = val.substring(val.lastIndexOf(".") + 1);
                isOk = (/^(jpg|jpeg|png|gif|tif|bmp)$/i).test(fExt)
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_imgfile"))
            }
            return isOk
        }, reg: function (el, renderResult, pattern, msg, ignoreDBC) {
            if (ignoreDBC) {
                Utils.dbc2sbcValue(el)
            }
            Utils.prepare4Vld(el);
            var val = getValue(el);
            var isOk = (val == "");
            if (!isOk) {
                msg = msg || "_regexp";
                pattern = pattern || getAttr2(el, "reg-pattern");
                if ("string" == typeof pattern) {
                    pattern.replace(/^\/(.*)\/([ig]*)$/g, function (a, b, c) {
                        pattern = new RegExp(b, c || "")
                    })
                }
                isOk = pattern.test(val)
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, msg))
            }
            return isOk
        }, magic: function (el, renderResult, pattern) {
            Utils.prepare4Vld(el);
            pattern = pattern || getAttr2(el, "magic-pattern");
            var isOk = (getValue(el) == "" || !pattern);
            if (!isOk) {
                var opts = {el: el, Validators: Validators};
                var sJs = pattern.replace(/(\w+)/ig, 'opts.Validators.datatype(opts.el,false,"$1")');
                isOk = evalExp(sJs, opts)
            }
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_magic"))
            }
            return isOk
        }, uv: function (el, renderResult) {
            if (el.onblur && !el.onblur()) {
                return false
            }
            return true
        }, notempty: function (el) {
            Utils.prepare4Vld(el);
            return !!getValue(el)
        }, logicrequired: function (el, renderResult, reqlogic) {
            el = el || this;
            reqlogic = reqlogic || getAttr2(el, "reqlogic");
            var reqAttr = Valid._curReqAttr || Valid.REQATTR, sReq = getAttr2(el, reqAttr),
                opts = {el: el, Validators: Validators},
                sJs = reqlogic.replace(/\$([\w\-]+)/ig, 'opts.Validators.notempty(g("$1"))').replace(/this/ig, "opts.Validators.notempty(opts.el)");
            var isOk = evalExp(sJs, opts);
            if (renderResult != false) {
                Valid.renderResult(el, isOk, !isOk && sReq.indexOf(" ") == 0 ? sReq.substr(1) : tmpl(Msgs._logicrequired, [sReq]))
            }
            return !!isOk
        }
    }, {
        time: function (el, renderResult) {
            return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/, "_time", true)
        }, minute: function (el, renderResult) {
            return Validators.reg(el, renderResult, /^(([0-1]\d)|(2[0-3])):[0-5]\d$/, "_minute", true)
        }, email: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, "_email", true)
        }, mobilecode: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^(13|15|18|14)\d{9}$/, "_mobilecode", true)
        }, phone: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}$/, "_phone", true)
        }, phonewithext: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)[1-9]\d{6,7}(-\d{1,7})?$/, "_phonewithext", true)
        }, phonezone: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^0(10|2\d|[3-9]\d\d)$/, "_phonezone", true)
        }, phonecode: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^[1-9]\d{6,7}$/, "_phonecode", true)
        }, phoneext: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^\d{1,6}$/, "_phoneext", true)
        }, zipcode: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^\d{6}$/, "_zipcode", true)
        }, vcode: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^\w{4}$/, "_vcode", true)
        }, ipaddr: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/, "_ipaddr", true)
        }, url: function (el, renderResult) {
            return Validators.reg(el || this, renderResult, /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, "_url", true)
        }
    }, {
        wifipassword: function (el, renderResult) {
            var isOk = Validators.bytetext(el, renderResult);
            if (!isOk) {
                return isOk
            } else {
                isOk = (escape(el.value).indexOf("%u") < 0);
                Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_wifipassword"), true)
            }
            return isOk
        }, ssid: function (el, renderResult) {
            var val = getValue(el), isOk = Validators.bytetext(el, renderResult);
            return isOk
        }, macaddr: function (el, renderResult) {
            var val = getValue(el),
                isOk = (/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/i.test(val) && val !== "00:00:00:00:00:00" && val !== "ff:ff:ff:ff:ff:ff");
            Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_macaddr"), true);
            return isOk
        }, weppassword: function (el, renderResult) {
            var val = getValue(el), len = val.length, isOk = false;
            var reg;
            if (len == 5 || len == 13 || len == 16) {
                isOk = true
            } else {
                if (len == 10 || len == 26 || len == 32) {
                    reg = new RegExp("[0-9A-F]{" + len + "}", "i");
                    isOk = (reg.test(val))
                } else {
                    isOk = false
                }
            }
            Valid.renderResult(el, isOk, !isOk && Msgs.getMsg(el, "_weppassword"), true);
            return isOk
        }
    }]);
    window.Valid = Valid
})(jQuery);
(function ($) {
    var Valid = window.Valid, Validators = Valid.Validators, g = QW.NodeH.g, getAttr2 = function (el, attr) {
        return $(el).attr(attr)
    }, getValue = function (el) {
        return g(el).value
    }, addClass = function (el, className) {
        $(el).addClass(className)
    }, removeClass = function (el, className) {
        $(el).removeClass(className)
    }, replaceClass = function (el, cls1, cls2) {
        $(el).removeClass(cls1);
        $(el).addClass(cls2)
    }, show = function (el) {
        $(el).show()
    }, hide = function (el) {
        $(el).hide()
    }, createElement = function (tag, opts) {
        opts = opts || {};
        var el = document.createElement(tag);
        for (var i in opts) {
            el[i] = opts[i]
        }
        return el
    };
    Valid._getHintEl = function (el) {
        var hintEl = getAttr2(el, "hintEl");
        return hintEl && g(hintEl)
    };
    Valid._getPlaceHolderEl = function (el) {
        var hintEl = getAttr2(el, "placeHolderEl");
        return hintEl && g(hintEl)
    };
    Valid._getEmEl = function (el) {
        var em = getAttr2(el, "emEl");
        if (em) {
            return g(em)
        }
        var refEls = [el, el.parentNode];
        for (var i = 0; i < 2; i++) {
            var tempEl = refEls[i];
            for (var j = 0; j < 5; j++) {
                tempEl = tempEl.nextSibling;
                if (!tempEl) {
                    break
                }
                if (tempEl.tagName == "EM") {
                    return tempEl
                }
            }
        }
        return null
    };
    Valid._getErrEmEl = function (okEm, autoCreate) {
        var errEm = okEm.nextSibling;
        if (errEm) {
            if (errEm.tagName == "EM" || !errEm.tagName && (errEm = errEm.nextSibling) && errEm.tagName == "EM") {
                return errEm
            }
        }
        if (!autoCreate) {
            return null
        }
        errEm = createElement("em", {className: "t error"});
        okEm.parentNode.insertBefore(errEm, okEm.nextSibling);
        return errEm
    };
    Valid.onhint = function (ce) {
        var el = ce.target;
        if (!el || "INPUT,TEXTAREA,SELECT,BUTTON,OBJECT".indexOf(el.tagName) == -1) {
            return
        }
        var hintEl = Valid._getHintEl(el), placeHolderEl = Valid._getPlaceHolderEl(el);
        hintEl && replaceClass(hintEl, "hint-dark", "hint");
        if (placeHolderEl) {
            clearTimeout(el.__placeholderTimer || 0);
            addClass(placeHolderEl, "placeholder-dark")
        }
        if (!Validators.required(el, false) && !getValue(el)) {
            return
        }
        if (!Validators.datatype(el, false)) {
            Validators.datatype(el, true)
        }
    };
    Valid.onblur = function (ce) {
        var el = ce.target;
        if (!el || "INPUT,TEXTAREA,SELECT,BUTTON,OBJECT".indexOf(el.tagName) == -1) {
            return
        }
        var hintEl = Valid._getHintEl(el), placeHolderEl = Valid._getPlaceHolderEl(el);
        hintEl && replaceClass(hintEl, "hint", "hint-dark");
        Validators.datatype(el, true);
        if (placeHolderEl) {
            (getValue(el) ? addClass : removeClass)(placeHolderEl, "placeholder-dark");
            clearTimeout(el.__placeholderTimer || 0);
            el.__placeholderTimer = setTimeout(function () {
                (getValue(el) ? addClass : removeClass)(placeHolderEl, "placeholder-dark")
            }, 600)
        }
    };
    Valid.onpass = function (ce) {
        var el = ce.target, okEm = Valid._getEmEl(el);
        $(el).parents(".form-item").removeClass("form-item-err");
        if (okEm) {
            if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp) {
                show(okEm);
                var errEmEl = Valid._getErrEmEl(okEm);
                errEmEl && hide(errEmEl)
            }
        }
    };
    Valid.onfail = function (ce) {
        var el = ce.target, errMsg = ce.errMsg;
        $(el).parents(".form-item").addClass("form-item-err");
        el.__vld_errMsg = errMsg;
        var okEm = Valid._getEmEl(el);
        if (okEm) {
            if ((okEm.__vld_fail_stamp | 0) != Valid.checkAll_stamp) {
                hide(okEm);
                var errEm = Valid._getErrEmEl(okEm, true);
                errEm.innerHTML = errMsg;
                show(errEm)
            }
            if (Valid.isChecking) {
                okEm.__vld_fail_stamp = Valid.checkAll_stamp
            }
        }
    };
    var placeHolder_idx = 10000;
    Valid.oninitall = function (ce) {
        setTimeout(function () {
            if ("placeholder" in document.createElement("input")) {
                return
            }
            $("input,textarea", ce.target).each(function (el) {
                var placeholder = getAttr2(el, "placeholder"), placeHolderEl = Valid._getPlaceHolderEl(el);
                if (placeholder && !placeHolderEl) {
                    var placeHolderElId = "placeHolder-" + placeHolder_idx++;
                    placeHolderEl = createElement("span", {
                        id: placeHolderElId,
                        innerHTML: placeholder,
                        className: "placeholder"
                    });
                    placeHolderEl.onclick = function () {
                        try {
                            el.focus()
                        } catch (ex) {
                        }
                    };
                    el.parentNode.insertBefore(placeHolderEl, el);
                    el.setAttribute("placeHolderEl", placeHolderElId)
                }
                if (placeHolderEl) {
                    if ((getValue(el) || "").trim() || el == document.activeElement) {
                        addClass(placeHolderEl, "placeholder-dark")
                    } else {
                        removeClass(placeHolderEl, "placeholder-dark")
                    }
                }
            })
        }, 10)
    };
    $(function () {
        Valid.initAll()
    })
})(jQuery);