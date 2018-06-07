$.fn.extend({
    locate: function (x, y) {
        if (this.css("position") == "fixed") {
            y -= $(document).scrollTop()
        }
        return this.css({left: x, top: y})
    }, locateBeside: function (el, adjustX) {
        var p = $(el).offset(), w1 = $(el).outerWidth(), w2 = this.outerWidth(), h2 = this.outerHeight(),
            x = p.left + w1 + 5 + (adjustX || 0), y = p.top;
        if ($(document).width() < x + w2) {
            x = p.left - w2 - 5 - (adjustX || 0)
        }
        if ($(document).height() < y + h2) {
            y = p.top - (y + h2 + 15 - $(document).height())
        }
        return this.locate(x, y)
    }, locateBelow: function (el, adjustY) {
        var p = $(el).offset();
        return this.locate(p.left, p.top + $(el).outerHeight() + 3 + (adjustY || 0))
    }, locateCenter: function () {
        return this.locate(($(window).width() - this.width()) / 2, ($(window).height() - this.height()) / 2 + $(document).scrollTop())
    }
});
$.selectBeautify = function (opt) {
    var opt = opt || {};
    var maxHeight = opt.maxHeight || "215px";
    var container = opt.container || "body";
    var selects = $(container).find("select.beautify");
    if (selects.length > 0) {
        if ($("#dummydata").length < 1) {
            $("body").append("<div id='dummydata' style='position:absolute; display:none'></div>")
        }
        selects.each(function (e) {
            var select = this;
            var input = $("<div class='ipt-text dummy'></div>")
                .css("width", parseInt(this.style.width) + "px")
                .css("display", this.style.display).insertAfter(this)
                .html(this.options[this.selectedIndex] && this.options[this.selectedIndex].innerHTML);
            this.style.display = "none";
            input.click(function () {
                var div = $("#dummydata").empty().attr("class", select.className);
                if ($(".panel-mask").length) {
                    div.css("z-index", parseInt($(".panel-mask").css("z-index"), 10) + 10);
                }
                $(select).hasClass("extend") ? div.css("width", "") : div.css("width", $(this).innerWidth());
                for (var i = 0; i < select.options.length; i++) {
                    var item = select.options[i];
                    var a = $("<a href='javascript:void(0);' class='nowrap'></a>").css("color", item.style.color).addClass(item.className).html("<span>" + item.innerHTML + "</span>").appendTo(div);
                    if (i == select.selectedIndex) {
                        a.addClass("selected")
                    }
                    a.click(function () {
                        var n = $(this).index();
                        select.selectedIndex = n;
                        input.html(select.options[n].innerHTML);
                        div.hide();
                        $(select).change()
                    })
                }
                var noscroll = (select.options.length < 10 || $(select).hasClass("noscroll"));
                if (/msie 6/i.test(window.navigator.userAgent)) {
                    div.css("height", noscroll ? "auto" : maxHeight).css("overflow-y", noscroll ? "hidden" : "scroll")
                } else {
                    div.css("max-height", noscroll ? "10000px" : maxHeight)
                }
                $(select).hasClass("onside") ? div.locateBeside(this, -2) : div.locateBelow(this, -4);
                if (window.activeDummySelect == select) {
                    div.slideToggle(100);
                    $(this).toggleClass("select-open-input")
                } else {
                    div.hide().slideDown(100);
                    window.activeDummySelect = select;
                    $(".dummy").removeClass("select-open-input");
                    $(this).addClass("select-open-input")
                }
                if (!select.selectedIndex > 6 && div[0].scrollHeight > div.height()) {
                    div.scrollTop((select.selectedIndex - 3) * div[0].firstChild.offsetHeight)
                }
            })
        });
        $(document).click(function (e) {
            if (!$(e.target).is(".dummy") && !$(e.target).is("#dummydata")) {
                $("#dummydata").hide();
                $(".dummy").removeClass("select-open-input")
            }
        })
    }
};