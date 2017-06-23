$tc.fn.tcEmbedAds = function (id, options) {
    var $ = $tc || $;
    var $context = $(this);
    var rand = Math.floor((Math.random() * 10000) + 1);
    var feedUrl = (options.url || "https://12place.com") + "/?x=";
    var embedAds = this;
    var hideTimer = {timer: 0};
    this.feeds = {overlay: {feedLoaded: null}, preroll: {feedLoaded: null}};
    var dict = {
        "Close ad": "Закрыть рекламу",
        "Advertisement": "Реклама"
    };
    var status = {preroll: "", overlay: ""};

    options = $.extend({
        "feeds": {
            "preRoll": "",
            "overlay": ""
        },

        "adFontColor": "#eee",
        "adTarget": "_blank",
        "adTitle": "ads by tubecontext",
        "adUrl": "http://tubecontext.com/",
        "linkHoverColor": "#06f",
        "backgroundColor": "#000000",
        "bgOpacity": 75,
        "borderColor": "#ccc",
        "fontColor": "#eee",
        "titleFontSize": "15px",
        "descFontSize": "12px",
        "prepareTime": 20,
        "hiddenTime": 20,
        "rotateTime": 15,
        "show": 1,
        "showTime": 20,
        "isWatermark": false
    }, options);

    function t(msg) {
        if (dict[msg] == null)
            return "";
        var lg = navigator.language;
        return (lg == "ru" || lg == "ru-RU") ? dict[msg] : msg;
    }

    var analyse = function() {
        var clicks = 0;
        var w = $(window).width();
        var h = $(window).height();
        var x = -1;
        var y = -1;
        var iframe = (window.location != window.top.location) ? 1 : 0;
        var page = encodeURIComponent(location.href);
        var ref = encodeURIComponent(document.referrer);

        $(document).on("click", function() {
           clicks++;
        });

        $(document).mousemove(function(e) {
            x = e.pageX;
            y = e.pageY;
        });

        this.params = function() {
            return "w=" + w + "&h=" + h + "&x=" + x + "&y=" + y + "&i=" + iframe + "&page=" + page + "&r=" + ref;
        };

        return this;
    };

    var overlay = function() {
        var timeAfterCloseMs = 20000;
        var loadCount = 0;

        var buttons = {
            close: null,
            expand: null
        };

        var containers = {
            block: null,
            blockCnt: null,
            blockTools: null,
            blockBkg: null,
            blockCopy: null
        };

        var isStart = false;
        var isInit = false;

        function init() {
            embedAds.feeds.overlay.feedLoaded = feedLoaded;

            if (isStart && isInit)
                return;

            if (options.feeds.overlay == undefined || options.feeds.overlay.length < 1)
                return;

            status.overlay = "init";

            if (!isStart) {
                $("<div />")
                .css({
                    'position': 'absolute',
                    'z-index': '9000',
                    'width': '100%',
                    'height': '100%',
                    'top': 0,
                    'left': 0,
                    'background': '#fff',
                    'opacity': 0.01
                })
                .addClass("starter_" + rand)
                .on("mousemove", function () {
                    $(this).remove();
                    loadFeed(options.prepareTime * 1000);
                })
                .prependTo($context);

                isStart = true;
                return;
            }

            cssInit();

            var html =
                '<div class="block_' + rand + '">' +
                    '<div class="block_cnt_' + rand + '"></div>' +
                    '<div class="block_tools_' + rand + '">' +
                        '<span class="bttn close" title="' + t("Close ad") + '"><span data-icon="">&times;</span></span>' +
//                      '<span class="bttn next"><span data-icon="">&raquo;</span></span>' +
//                      '<span class="bttn prev"><span data-icon="">&laquo;</span></span>' +
                    '</div>' +
                    '<div class="bttn expand"><span data-icon="">&#9650;</span></div>' +
                    '<div class="block_bg_' + rand + '"></div>' +
                        '<a class="tc_copy_' + rand + '" href="'+ options.adUrl + '" target="' + options.adTarget + '">' +
                            options.adTitle +
                        '</a>' +
                    '</div>' +
                '</div>'
                ;

            $context.prepend(html);
            containers.block = find("block");
            containers.blockCnt = find("block_cnt");
            containers.blockTools = find("block_tools");
            containers.blockBkg = find("block_bg");
            containers.blockCopy = find("tc_copy");
            buttons.close = containers.blockTools.find(".close");
            buttons.expand = $context.find(".expand");
            buttons.close.on("click", hide);
            buttons.expand.on("click", show);

            isInit = true;
        }

        function loadFeed(delay) {
            if (loadCount > 3 || status.overlay == "loading")
                return;
delay = 0;
            status.overlay = "loading";

            var f = function() {
                callDelay(function() {

                    $.ajax({
                        type: "GET",
                        url: feedUrl + options.feeds.overlay + "&blockid=" + id + "&" + analyse.params(),
                        dataType: "script",
                        scriptCharset: "utf-8"
                    }).done(function () {
                        status.overlay = "loaded";
                    })
                    .fail(function () {
                        status.overlay = "error";
                    });

                }, delay);
            };

            if (prerollIsFree()) {
                f();
            }
            else {
                var waitPreroll = setInterval(function () {
                    if (prerollIsFree()) {
                        clearInterval(waitPreroll);
                        f();
                    }
                }, 100);
            }
        }

        function prerollIsFree() {
            return (status.preroll == "" || status.preroll == "error" || status.preroll == "closed");
        }

        function open () {
            status.overlay = "opened";

            containers.block.hide().css("visibility", "visible");
            containers.blockCnt.show();
            containers.blockTools.show();
            containers.blockBkg.show();

            if (options.isWatermark)
                containers.blockCopy.show();

            buttons.expand.hide();
            containers.block.slideToggle();
            hide(timeAfterCloseMs);
        }

        function close(delay) {
            status.overlay = "closed";

            callDelay(function() {
                clearTimeout(hideTimer.timer);
                containers.block.slideToggle();
                loadFeed(timeAfterCloseMs);
            }, delay);
        }

        function show() {
            status.overlay = "showed";

            clearTimeout(hideTimer.timer);
            containers.block.slideToggle();
            containers.blockCnt.show();
            containers.blockTools.show();
            containers.blockBkg.show();

            if (options.isWatermark)
                containers.blockCopy.show();

            buttons.expand.hide();
            containers.block.slideToggle();
            hide(timeAfterCloseMs);
            close(timeAfterCloseMs * loadCount);
        }

        function hide(delay) {
            status.overlay = "hided";
            clearTimeout(hideTimer.timer);

            callDelay(function() {
                containers.block.slideToggle(function() {
                    containers.blockCnt.hide();
                    containers.blockTools.hide();
                    containers.blockBkg.hide();
                    containers.blockCopy.hide();
                    buttons.expand.show();
                    containers.block.slideToggle();
                });
            }, delay, hideTimer);
        }

        function feedLoaded(data) {
            var ads = data.ads || [];

            if (data.ads.length == 0)
                return;

            loadCount++;

            if (data.adUrl != undefined && data.adUrl.length > 0)
                options.isWatermark = true;

            options = $.extend({}, options, data);
            init();

            for (var i = 0; i < ads.length && i < 1; i++) {
                var ad = ads[i];

                var img = new Image();
                img.src = ad.src;

                var $link = $("<a />")
                    .prop({"href": "javascript:void(0);", "target": "_blank"})
                    .addClass('adv_link_' + rand)
                    .append(
                        $("<img />").prop("src", ad.src)
                    );

                if (ad.title.length > 1 || ad.description.length > 1) {
                    var $txt = $("<div />");

                    if (ad.title.length > 1)
                        $txt.append($("<span />").addClass("title_" + rand).html(ad.title));

                    if (ad.description.length > 1)
                        $txt.append($("<span />").addClass("descr_" + rand).html(ad.description));

                    $link.append($txt);
                }

                var $adv = $("<div>").addClass("adv_" + rand).append($link);
                containers.blockCnt.html("").append($adv);

                var adUrl = ad.url;

                $link.on("click", function () {
                   $(this).prop("href", adUrl + "&" + analyse.params());
                   close();
                });

                open();
            }
        }

        function cssInit() {
            var css =
                '#tcAdv' + id + ' .block_' + rand + ' {' +
                    'visibility: hidden;' +
                    'position: absolute !important;' +
                    'z-index: 2;' +
                    'top: auto !important;' +
                    'right: 83px !important;' +
                    'bottom: 46px !important;' +
                    'left: 83px !important;' +
                "}\n" +

                '#tcAdv' + id + '.olShow .block_' + rand + ', #' + id + '.olHide .block_' + rand + ' {' +
                    'visibility: visible;' +
                "}\n" +

                '#tcAdv' + id + ' .block_cnt_' + rand + ' {' +
                    'position: relative;' +
                    'z-index: 2;' +
                    'overflow: hidden;' +
                "}\n" +

                '#tcAdv' + id + '.olHide .block_cnt_' + rand + ' {' +
                    'display: none;' +
                "}\n" +


                '#tcAdv' + id + ' .adv_' + rand + ' {' +
                    'position: relative;' +
                    'padding-bottom: ' + (options.isWatermark ? '12px' : '0px') + ';' +
                "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a.adv_link_' + rand + '{ ' +
                    'position: relative;' +
                    'display: block;' +
                    'padding: 2px;' +
                    'max-height: 80px;' +
                    'color: ' + options.fontColor + ' !important;' +
                    'text-decoration: none;' +
                    'overflow: hidden;' +
                "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a img {' +
                    'float: left;' +
                    'border: 0;' +
                    'max-height: 80px;' +
                    'max-width: 100%;' +
                "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a div {' +
                    'display: block;' +
                "}\n" +

//            '#tcAdv' + id + ' .adv_' + rand + ' a div.toolspace {' +
//                'display: block;' +
//                'margin: 0px;' +
//                'padding: 0;' +
//                'float: right;' +
//                'width: 52px;' +
//                'height: 15px;' +
//            "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a div span {' +
                    'display: block;' +
                    'padding: 4px 4px 4px 10px;' +
                "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a div span.title_' + rand + ' {' +
                    'min-height: 18px;' +
                    'overflow: hidden;' +
                    'text-overflow: ellipsis;' +
                    'white-space: nowrap;' +
                    'font-size: ' + options.titleFontSize + ' !important;' +
                    'color: ' + options.fontColor + ' !important;' +
                    'text-decoration: underline;' +
                "}\n" +

//            '#tcAdv' + id + ' .adv_' + rand + ' a:hover div span.title_' + rand + ' {' +
//                'color: ' + options.adFontColor + ';' +
//            "}\n" +

                '#tcAdv' + id + ' .adv_' + rand + ' a div span.descr_' + rand + ' {' +
                    'font-size: ' + options.descFontSize + ';' +
                    'color: ' + options.fontColor + ';' +
                    'overflow: hidden;' +
                "}\n" +


                '#tcAdv' + id + ' .tc_copy_' + rand + ' {' +
                    'display: ' + (options.isWatermark ? 'block' : 'none') + ';' +
                    'position: absolute;' +
                    'z-index: 20;' +
                    'bottom: -15px;' +
                    'right: -14px;' +
                    'padding: 18px 21px;' +
                    'line-height: 10px;' +
                    'font-size: 10px;' +
                    'color: ' + options.adFontColor + ' !important;' +
                    'text-decoration: none;' +
                    'font-style: italic;' +
                "}\n" +

                '#tcAdv' + id + ' .tc_copy_' + rand + ':hover {' +
                    'color: ' + options.adFontColor + ' !important;' +
                    'text-decoration: underline' +
                "}\n" +

                '#tcAdv' + id + '.olHide .tc_copy_' + rand + ' {' +
                    'display: none;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' {' +
                    'position: absolute;' +
                    'z-index: 3;' +
                    'top: -12px;' +
                    'right: -12px;' +
    //                'padding: 14px;' +
                    'font-weight: bold;' +
                    'font-size: 18px;' +
                    'line-height: 18px;' +
                    'margin-bottom: 1px;' +
                    'background-color: ' + options.backgroundColor + ';' +
                    cssOpacity(75) +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ':hover {' +
                    cssOpacity(100) +
                "}\n" +

                '#tcAdv' + id + '.olHide .block_tools_' + rand + ' {' +
                    'display: none;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .bttn {' +
                    'position: relative;' +
                    'float: right;' +
                    'padding: 0px 0px;' +
                    'margin-left: -1px;' +
                    'width: 18px;' +
                    'height: 18px;' +
                    'cursor: pointer;' +
                    'text-align: center;' +
                    'background: transparent;' +
                    'color: ' + options.borderColor + ';' +
                    'border: 1px solid ' + options.borderColor + ';' +
                    'overflow: hidden;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .close {' +
                    'color: ' + options.fontColor + ';' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .bttn:hover {' +
                    'color: #333;' +
                    'border: 1px solid #000;' +
                    'outline: 1px solid #fff;' +
                    'background: #eee;' +
                    'z-index: 2;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .bttn:active {' +
                    'color: #333;' +
                    'border: 1px solid #000;' +
                    'outline: 1px solid #000;' +
                    'background: #ccc;' +
                    'z-index: 2;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .close:hover {' +
                    'color: #000;' +
                    'background: #fff;' +
                "}\n" +

                '#tcAdv' + id + ' .block_tools_' + rand + ' .close:active {' +
                    'background: #ccc;' +
                "}\n" +

                '#tcAdv' + id + ' [data-icon] {' +
                    'position: relative;' +
                    '-webkit-font-smoothing: antialiased;' +
                    '-moz-osx-font-smoothing: grayscale;' +
                    'content: attr(data-icon);' +
                    'speak: none;' +
                    'position: relative;' +
                    'font-variant: normal;' +
                    'text-transform: none;' +
                    'line-height: 18px;' +
                "}\n" +

                '#tcAdv' + id + ' .next [data-icon], #' + id + ' .prev [data-icon]  {' +
                    'top: -1px;' +
                "}\n" +

                '#tcAdv' + id + ' .expand {' +
                    'display: none;' +
                    'position: absolute;' +
                    'width: 50px;' +
                    'height: 16px;' +
                    'overflow: hidden;' +
                    'left: 50%;' +
                    'cursor: pointer;' +
                    'margin-left: -25px;' +
                    'border-radius: 5px 5px 0px 0px;' +
                    'bottom: 100%;' +
                    'color: #333;' +
                    'text-align: center;' +
                    'background: #fff;' +
                    'z-index: 30;' +
                    cssOpacity(30) +
                "}\n" +

                '#tcAdv' + id + ' .expand [data-icon] {' +
                    'position: relative;' +
                    'top: -2px;' +
                    '-webkit-font-smoothing: antialiased;' +
                    '-moz-osx-font-smoothing: grayscale;' +
                    'content: attr(data-icon);' +
                    'speak: none;' +
                    'position: relative;' +
                    'font-variant: normal;' +
                    'text-transform: none;' +
                    'line-height: 24px;' +
                "}\n" +

                '#tcAdv' + id + ' .expand:hover [data-icon] {' +
                    'text-decoration: underline;' +
                "}\n" +

                '#tcAdv' + id + '.olShow .expand {' +
                    'display: none !important;' +
                "}\n" +

                '#tcAdv' + id + ' .expand:hover {' +
                    'text-decoration: underline;' +
                    'height: 24px;' +
                    cssOpacity(100) +
                "}\n" +

                '#tcAdv' + id + ' .block_bg_' + rand + ' {' +
                    'position: absolute !important;' +
                    'z-index: -1;' +
                    'right: 0px !important;' +
                    'bottom: 0px !important;' +
                    'top: 0px !important;' +
                    'left: 0px !important;' +
                    'border: 1px solid ' + options.borderColor + ';' +
                    'background-color: ' + options.backgroundColor + ' !important;' +
                    cssOpacity(options.bgOpacity) +
                "}\n" +

                '#tcAdv' + id + ':hover .block_bg_' + rand + ' {' +
                    cssOpacity(100) +
                "}\n" +

                '#tcAdv' + id + '.olHide .block_bg_' + rand + ' {' +
                    'display: none;' +
                "}\n" +

                '#tcAdv' + id + ' .starter_' + rand + ' {' +
                    'position: absolute;' +
                    'z-index: 9000;' +
                    'width: 100%;' +
                    'height: 100%;' +
                    'top: 0px;' +
                    'left: 0px;' +
                    'background: rgba(0,0,0,0);' +
                "}\n" +

                '#tcAdv' + id + ' .starter' + rand + ' {' +
                    'background: #fff;' +
                    cssOpacity(1) +
                "}\n";

            $("head").append($('<style type="text/css" />').html(css));
        }

        init();
        return this;
    };

    var preroll = function() {
        var buttons = {
            close: null,
            closePlay: null
        };

        var containers = {
            preroll: null,
            cntMain: null
        };

        var init = function() {
            var lg = navigator.language;
            if (lg == "ru" || lg == "ru-RU")
                return true;

            status.preroll = "init";
            loadFeed();
        };

        var prepare = function() {
            initCss();
            var html =
                    '<div class="preroll_' + rand + '">' +
                        '<div class="preroll_name_' + rand + '">' + t("Advertisement") + ' <div class="pre_bg"></div> </div>' +
                        '<div class="preroll_cnt_' + rand + '">' +
                        '<div class="cnt_' + rand + '">' +
                        '<div class="cnt_main_' + rand + '"></div>' +
                        '<div class="pre_bg"></div>' +
                        '</div>' +
                        '<div class="close_bttn_' + rand + '">&times;<div class="pre_bg"></div></div>' +
                        '<div class="close_str_' + rand + '"><span>' + t("Close ad") + '<div class="pre_bg"></div></span></div>' +
                        '</div>' +
                        '</div>'
                ;
            $context.prepend(html);
            buttons.close = find("close_bttn");
            buttons.closePlay = find("close_str");
            containers.preroll = find("preroll");
            containers.cntMain = find("cnt_main");

            buttons.close.on("click", close);
            buttons.closePlay.on("click", close);
        };

        var close = function() {
            status.preroll = "closed";
            containers.preroll.remove();
        };

        var open = function() {
            status.preroll = "opened";
            containers.preroll.css("visibility", "visible");
        };

        var loadFeed = function() {
            prepare();
            var $html = $("<div/>");
            containers.cntMain.append($html);
            open();
            status.preroll = "loaded";
        };
/*
        var feedLoaded = function(data) {
            var ads = data.ads || [];

            if (data.ads.length == 0)
                return;

            var ad = ads[0];
            prepare();

            var $link = $("<a />")
                .prop({"href": "javascript:void(0);", "target": "_blank"})
                .addClass('adv_link_' + rand)
                .css({
                    display: 'block',
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                });

            if (ad.desc) {
                $link.append(
                    $('<div />')
                        .text(ad.desc)
                        .addClass('tc_tDesc' + rand)
                        .append($('<div />').addClass('tc_tDesc_bg' + rand))
                );
            }

            var img = new Image();
            img.onload = function() {
                img.ratio = img.width / img.height;
                var $context = containers.cntMain;
                var $image = $(img);
                $link.append($image);
                $image.css({
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    zIndex: 5
                });

                if (img.ratio <= $context.width() / $context.height()) {
                    $image
                        .height($context.width() / img.ratio)
                        .width($context.width());
                } else {
                    $image
                        .height($context.height())
                        .width($context.height() * img.ratio);
                }

                $image.css({
                    marginTop: -$image.height() / 2,
                    marginLeft: -$image.width() / 2
                });


                containers.cntMain.append($link);

                var adUrl = ad.url;

                $link.on("click", function () {
                    $(this).prop("href", adUrl + "&" + analyse.params());
                    close();
                });

                open();
            };
            img.src = ad.src;
        };
*/
        var initCss = function() {
            var css =
                '#tcAdv' + id + ' .preroll_' + rand + ' {' +
                    'position: absolute;' +
                    'z-index: 9010;' +
                    'width: 100%;' +
                    'height: 100%;' +
                    'top: 0px;' +
                    'left: 0px;' +
                    'background: rgba(0,0,0,0);' +
                    'visibility: hidden;' +
                "}\n" +

                '#tcAdv' + id + ' .pre_bg {' +
                    'position: absolute;' +
                    'z-index: -1;' +
                    'width: 100%;' +
                    'height: 100%;' +
                    'top: 0px;' +
                    'left: 0px;' +
                    'background: #000;' +
                    cssOpacity(75) +
                "}\n" +

                '#tcAdv' + id + ' .preroll_name_' + rand + ' {' +
                    'position: absolute;' +
                    'top: 0;' +
                    'font-size: 0.8em;' +
                    'left: 0;' +
                    'padding: 0.5em 1em;' +
                    'letter-spacing: 0.05em;' +
                    'color: #ccc;' +
                    'background: rgba(0,0,0,0);' +
                "}\n" +

                    '#tcAdv' + id + ' .preroll_name_' + rand + ' .pre_bg {' +
                    'border-radius: 0 0.3em 0.3em 0;' +
                "}\n" +

                '#tcAdv' + id + ' .preroll_cnt_' + rand + ' {' +
                    'position: absolute;' +
                    'top: 50%;' +
                    'left: 50%;' +
                    'width: 300px;' +
                    'height: 300px;' +
                    'margin-top: -140px;' +
                    'margin-left: -150px;' +
                    'background: rgba(0,0,0,0);' +
                    "}\n" +

                '#tcAdv' + id + ' .preroll_cnt_' + rand + ' .cnt_' + rand + ' .pre_bg {' +
                    'border-radius: 0.3em;' +
                    'height: auto;' +
                    'width: auto;' +
                    'top: -0.5em;' +
                    'left: -0.5em;' +
                    'right: -0.5em;' +
                    'bottom: -0.5em;' +
                "}\n" +

                '#tcAdv' + id + ' .cnt_' + rand + ' {' +
                    'position: relative;' +
                    'width: 300px;' +
                    'height: 250px;' +
                    'background: rgba(0,0,0,0);' +
                "}\n" +

                '#tcAdv' + id + ' .cnt_main_' + rand + ' {' +
                    'position: relative;' +
                    'width: 300px;' +
                    'height: 250px;' +
                    'overflow: hidden;' +
                    'background: #000;' +
                "}\n" +

                '#tcAdv' + id + ' .close_bttn_' + rand + ' {' +
                    'position: absolute;' +
                    'font-size: 2em;' +
                    'font-weight: bold;' +
                    'line-height: 1.06em;' +
                    'width: 1.06em;' +
                    'vertical-align: middle;' +
                    'text-align: center;' +
                    'color: #ccc;' +
                    'bottom: 100%;' +
                    'left: 100%;' +
                    'cursor: pointer;' +
                    'background: rgba(0,0,0,0);' +
                "}\n" +

                '#tcAdv' + id + ' .close_bttn_' + rand + ':hover {' +
                    'color: #fff;' +
                    "}\n" +

                '#tcAdv' + id + ' .close_bttn_' + rand + ' .pre_bg {' +
                    'border-radius: 1em;' +
                    'background: #222;' +
                "}\n" +

                '#tcAdv' + id + ' .close_bttn_' + rand + ':hover .pre_bg {' +
                    'border-radius: 1em;' +
                    'background: #000;' +
                "}\n" +

                '#tcAdv' + id + ' .close_str_' + rand + ' {' +
                    'margin-top: 1em;' +
                    'position: relative;' +
                    'text-align: center;' +
                    'color: #ccc;' +
                    'cursor: pointer;' +
                    'font-size: 0.9em;' +
                "}\n" +

                    '#tcAdv' + id + ' .close_str_' + rand + ':hover {' +
                    'color: #fff;' +
                "}\n" +

                '#tcAdv' + id + ' .close_str_' + rand + ' span{' +
                    'position: relative;' +
                    'width: 18em;' +
                    'padding: 0.5em;' +
                    'display: block;' +
                    'margin: 0 auto;' +
                "}\n" +

                '#tcAdv' + id + ' .close_str_' + rand + ' .pre_bg {' +
                    'border-radius: 0.3em;' +
                    'background: #222;' +
                    "}\n" +

                '#tcAdv' + id + ' .close_str_' + rand + ':hover .pre_bg {' +
                    'background: #000;' +
                "}\n" +

                '#tcAdv' + id + ' .tc_tDesc' + rand + '{' +
                    'position:absolute;z-index:10;' +
                    'left:0;right:0;bottom:0;' +
                    'text-align:center;' +
                    'padding:0.5em 0.5em 1em;' +
                    'color:#fff;' +
                "}\n" +

                '#tcAdv' + id + ' .tc_tDesc_bg' + rand + '{' +
                    'position:absolute;z-index:-1;' +
                    'left:0;right:0;bottom:0;top:0;' +
                    '-khtml-opacity:.4;' +
                    '-moz-opacity:.4;' +
                    '-ms-filter:alpha(opacity=40);' +
                    'filter:alpha(opacity=40);' +
                    'opacity:.4;' +
                    'background:#000' +
                "}\n" +

                '#tcAdv' + id + ' .cnt_main_' + rand + ':hover .tc_tDesc_bg' + rand + '{' +
                    '-khtml-opacity:.75;' +
                    '-moz-opacity:.75;' +
                    '-ms-filter:alpha(opacity=75);' +
                    'filter:alpha(opacity=75);' +
                    'opacity:.75' +
                "}\n";

            $tc("head").append($tc('<style type="text/css" />').html(css));
        };

        init();
        return this;
    };

    function find(className) {
        return $context.find("." + className + '_' + rand);
    }

    var cssOpacity = function(num) {
        var pnum = num / 100.0;
        var css =
            'opacity: ' + pnum + ';' +
            '-moz-opacity: ' + pnum + ';' +
            '-khtml-opacity: ' + pnum + ';' +
            '-ms-filter: progid:DXImageTransform.Microsoft.Alpha(opacity=' + num + ');' +
            'filter: alpha(opacity=' + num + ');'
            ;
        return css;
    };

    function callDelay(func, delay, timer) {
        if (delay) {
            if (timer) {
                timer.timer = setTimeout(func, delay);
            }
            else {
                setTimeout(func, delay);
            }
        } else {
            func();
        }
    }

    /*init*/
    {
        switch ($context.tagName) {
            case "embed":
                if ($context.attr("wmode") != "opaque" /*@todo && this is firefox*/) {
                    var $p = $context.clone(true).attr("wmode", "opaque");
                    $context.replaceWith($p);
                    $context = $p;

                    if ("console" in window)
                        console.warn("Param wmode=opaque not found in flash object");
                }
                break;
        }

        var css =
            '#tcAdv' + id + ' {' +
                'position: relative;' +
                'height: ' + $context.height() + 'px;' +
                'width: ' + $context.width() + 'px;' +
                'font-family: Arial, sans serif;' +
                'font-size: 14px;' +
                'color: ' + options.adFontColor + ';' +
                'overflow: hidden;' +
                'text-align: left;' +
                'margin: auto;' +
                "}\n" +

                '#tcAdv' + id + ' * {' +
                '-webkit-user-select: none;' +
                '-moz-user-select: none;' +
                '-ms-user-select: none;' +
                '-o-user-select: none;' +
                'user-select: none;' +
                "}\n" +

                '#tcAdv' + id + ' iframe {' +
                'position: absolute;' +
                'z-index: 1;' +
                'overflow: hidden;' +
                'left: 0;' +
                'top: 0;' +
                "}\n";

        $("head").append($('<style type="text/css" />').html(css));

        var $wrap = $("<div />").prop({id: "tcAdv" + id});
        $context.wrap($wrap);
        $context = $("#tcAdv" + id);

        analyse = new analyse;
        preroll = new preroll;
        overlay = new overlay;
    }

    return this;
};
