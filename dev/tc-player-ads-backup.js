/*!
 * TcEx Jquery Plugins
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */

/**
 * BASE FOR PREROLL POSTROLL
 * @param options
 * @param $player
 * @returns {*|HTMLElement}
 */
$tc.fn.basePreroll = function(options, $player) {
    function close() {
        $player.off("play playing", close);
        $containerPreroll.remove();
        setStatus("closed");
    }

    function closeAndPlay() {
        close();
        $player.play();
    }

    function open() {
        $containerPreroll.css("visibility", "visible");
        setStatus("opened");
        $player.pause();
        $player.on("play playing", close);
    }

    function createDiv(className) {
        return $("<div />").addClass(className + "_" + id);
    }

    function createDivBg() {
        return $("<div />").addClass("pre_bg");
    }

    function applyContainers() {
        $context.prepend([
            $containerPreroll = createDiv("preroll")
                .append([
                    createDiv("preroll_name")
                        .append([
                            $$.dict.t("Advertisement"),
                            createDivBg()
                        ]),
                    createDiv("preroll_cnt")
                        .append([
                            createDiv("cnt")
                                .append([
                                    $containerMain = createDiv("cnt_main"),
                                    createDivBg()
                                ]),

                            $buttonClose = createDiv("close_bttn")
                                .append([
                                    "&times;", createDivBg()
                                ]),
                            $buttonClosePlay = createDiv("close_str")
                                .append([
                                    $("<span />")
                                        .append([
                                            $$.dict.t(isPreroll ? "Skip ad & Play" : "Close ad & Replay"),
                                            createDivBg()
                                        ])
                                ])
                        ])
                ])
        ]);
    }

    function create(data) {
        var ads = data.ads || [];

        if (data.ads.length == 0) {
            setStatus("error");
            $$.log("ads empty");
            return;
        }

        applyContainers();
        $buttonClose.click(closeAndPlay);
        $buttonClosePlay.click(closeAndPlay);

        var ad = ads[0];

        var $link = $("<a />")
            .prop({href: "javascript:void(0);", "target": "_blank"})
            .addClass('adv_link_' + id)
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
                    .addClass('tc_tDesc' + id)
                    .append($('<div />').addClass('tc_tDesc_bg' + id))
            );
        }

        $$.image().prop("src", ad.src).on("done", function() {
            $$.log("loaded", ad.src);
            var $img = $(this);
            var ratio = this.width / this.height;

            $link.append($img);
            $img.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: 5
            });

            if (ratio <= $containerMain.width() / $containerMain.height()) {
                $img.height($containerMain.width() / ratio).width($containerMain.width());
            } else {
                $img.height($containerMain.height()).width($containerMain.height() * ratio);
            }

            $img.css({
                marginTop: -this.height / 2,
                marginLeft: -this.width / 2
            });

            $containerMain.append($link);

            var adUrl = ad.url;

            $link.on("click", function () {
                $(this).prop("href", adUrl + "&" + $$.analyse.params());
                closeAndPlay();
            });

            open();
        });

        setStatus("created");
    }

    function setStatus(st) {
        status = st;
        $context.data("preroll.status", st);
        $context.trigger("changeStatus", ["preroll", status]);
    }

    function register() {
        window[AD_TYPE + id] = function(data) {
            $$.log("loaded " + feedUrl);
            setStatus("loaded");

            if (typeof data != 'object' || data.ads == undefined)
                return;

            setStatus("creating");
            create(data);
        };
    }

    function loadFeed() {
        $$.log(feedUrl, status);
        $player.off(startEvents, loadFeed);
        if (status != "init")
            return;

        register();
        setStatus("loading");
        var url = feedUrl + "&t=" + AD_TYPE + "&blockid=" + id + "&" + $$.analyse.params();
        url += "&p=" + ($player.name || "") + "&v=" + ($player.version || "");

        $$.log("get preroll feed", "#" + url);
        $$.getScript(url);

        if (isPreroll)
            $player.pause();
    }

    var $ = $tc;
    var $$ = $tc.tcEx;
    var context = this;
    var $context = $(context);
    var config = $.extend({}, options.ads);
    var id = config.id;
    var url = (config.url || "http://xf.tubecontext.com");
    var isPreroll = ((config.type || "preroll") == "preroll");
    var feedUrl = url + "/?x=" + ((isPreroll) ? config.preroll : config.postroll);
    var startEvents = isPreroll ? "loadstart canplay ready" : "ended stop";
    var AD_TYPE = isPreroll ? "InVideoPreRoll" : "InVideoPostRoll";
    var status = "init";

    var $buttonClose,
        $buttonClosePlay,
        $containerPreroll,
        $containerMain;

    $$.dict.addRange({
        "Skip ad & Play": "Пропустить рекламу",
        "Close ad & Replay": "Закрыть рекламу и повторить",
        "Advertisement": "Реклама"
    });

    if (isPreroll)
        loadFeed();
    else
        $player.on(startEvents, loadFeed);

    return this;
};
/**
 * PREROLL
 * @param options
 * @param $player
 * @returns {*}
 */
$tc.fn.preroll = function(options, $player) {
    options.ads.type = 'preroll';
    $tc.fn.basePreroll.apply(this, arguments);
    return this;
};
$tc.extend($tc.fn.preroll, $tc.fn.basePreroll);
/**
 * POSTROLL
 * @param options
 * @param $player
 * @returns {*}
 */
$tc.fn.postroll = function(options, $player) {
    options.ads.type = 'postroll';
    $tc.fn.basePreroll.apply(this, arguments);
    return this;
};
$tc.extend($tc.fn.postroll, $tc.fn.basePreroll);

/**
 * OVERLAY
 * @param options
 * @param $player
 * @returns {*|HTMLElement}
 */
$tc.fn.overlay = function(options, $player) {
    function close() {
        if (!$block)
            return;

        if (closed)
            return;

        $$.log("close");
        $blockTools.slideUp();
        $block.slideUp(function() {
            $blockCnt.hide();
            $blockTools.hide();
            $blockBg.hide();
            $buttonExpand.hide();
            $blockCnt.html("");
        });

        setStatus("closed");
        closed = true;
        paused = false;
        shown = false;
        prevShown = false;
        $buttonClose.off("click", hideAndReload);
        $buttonExpand.off("click", show);
    }

    function show() {
        if (!$block)
            return;

        $$.log("show");
        $block.slideUp(function() {
            $blockCnt.show();
            $blockBg.show();
            $buttonExpand.hide();
            $blockTools.slideDown();
            $block.slideDown();
        });

        toggleWatermark(true);
        setStatus("showed");
        shown = true;

        setTimeout(reload, 20000);
    }

    function reload() {
        if (loadCount > MAX_LOAD_COUNT)
            return;

        $$.log("reload");
        loadFeed(timeAfterCloseMs * (loadCount + 3));
    }

    function hideAndReload() {
        hide();
        reload();
    }

    function hide() {
        if (!$block)
            return;

        $$.log("hide");

        $blockTools.slideUp();
        $block.slideUp(function() {
            $blockCnt.hide();
            $blockTools.hide();
            $blockBg.hide();

            $buttonExpand.show();
            $block.slideDown();
        });

        toggleWatermark(false);
        setStatus("hided");
        shown = false;
    }

    function toggleWatermark(close) {
        if ($player.toggleWatermark) {
            $player.toggleWatermark(close);
        }
    }

    function createDiv(className) {
        return $("<div />").addClass(className + "_" + id);
    }

    function createSpan(className) {
        return $("<span />").addClass(className + "_" + id);
    }

    function createButton(className) {
        return $("<span />").addClass("bttn").addClass(className)
            .css({
                "color": config.borderColor,
                "background-color": config.backgroundColor,
                "border-color": config.borderColor
            });
    }

    function applyContainers() {
        var cssBkg = {"background-color": config.backgroundColor, "border-color": config.borderColor};

        $context.prepend([
            $block = createDiv("block")
                .append([
                    $blockCnt = createDiv("block_cnt"),
                    $blockTools = createDiv("block_tools").css(cssBkg)
                        .append([
                            $buttonClose = createButton("close").prop("title", $$.dict.t("Close ad"))
                                .append($('<span data-icon="" />').html("&times;")),
//                            createButton("next").prop("title", $$.dict.t("Next ad")).append($('<span data-icon="" />').html("&raquo;")),
//                            createButton("prev").prop("title", $$.dict.t("Prev ad")).append($('<span data-icon="" />').html("&laquo;")),
                            $blockCopy = createButton("copy").html(config.adTitle).css("color", config.borderColor)
                        ]),
                    $buttonExpand = createButton("expand").append($('<span data-icon="" />').html("&#9650;")),
                    $blockBg = createDiv("block_bg").css(cssBkg)
                ])
        ]);
    }

    function create(data) {
        var ads = data.ads || [];

        if (data.ads.length == 0) {
            setStatus("error");
            $$.log("ads empty");
            return;
        }

        loadCount++;

        if ((data.adUrl || "").length > 0) {
            config.isWatermark = true;
        }

        $.extend(config, config, data);

        if (loadCount == 1) {
            applyContainers();

            if (config.isWatermark) {
                $blockCopy.html("").append(
                    $("<a />").prop({"href": data.adUrl, "target": "_blank"}).html(data.adTitle)
                        .css("color", config.borderColor)
                );
            } else {
                $blockCopy.html("").html(data.adTitle);
            }
        }

        $block.hide();

        for (var i = 0; i < ads.length && i < 1; i++) {
            var ad = ads[i];

            $$.image().prop("src", ad.src).on("done", function() {
                var $img = this;
                var $link = $("<a />")
                    .prop({"href": "javascript:void(0);", "target": "_blank"})
                    .addClass('adv_link_' + id)
                    .append($img);

                var blockW = 960;

                if (ad.title.length > 1 || ad.description.length > 1) {
                    var $txt = $("<div />");

                    if (ad.title.length > 1)
                        createSpan("title").html(ad.title).css("color", config.fontColor)
                            .appendTo($txt);

                    if (ad.description.length > 1)
                        createSpan("descr").html(ad.description).css("color", config.fontColor)
                            .appendTo($txt);

                    $link.append($txt);

                    var scale = 1;
                    var margin = 166;
                    var playerW = $player.width();
                    var max = (playerW - margin) / scale;

                    blockW = playerW - margin;

                    if (blockW > 960)
                        blockW = 960;

                    if (blockW > max) {
                        blockW = max;
                    }
                }
                else {
                    blockW = $img.width;
                }

                $block.css({
                    "width": blockW + "px",
                    "margin-left": (blockW / -2) + "px"
                });
                $blockCnt.html("").append(createDiv("adv").append($link));

                var adUrl = ad.url;

                $link.on("click", function (event) {
                    $(this).prop("href", adUrl + "&" + $$.analyse.params());
                    close();
                });

                if (paused) {
                    hide();
                    prevShown = true;
                } else {
                    show();
                }

                $block.css({
                    "left": "50%",
                    "margin-left": ($block.width() / -2) + "px",
                    "right": 0,
                    "width": $block.width()
                });
            });
        }

        $buttonClose.on("click", hideAndReload);
        $buttonExpand.on("click", show);
        closed = false;
        setStatus("created");
    }

    function setStatus(st) {
        $$.log("overlay.status=" + st);
        status = st;
        $context.data("overlay.status", st);
        $context.trigger("changeStatus", ["overlay", status]);
    }

    function loadFeed(delay) {
        if (loadFeedTimer) {
            return;
        }

        setStatus("loading");

        var loadF = function() {
            var url = feedUrl + "&t=" + AD_TYPE + "&blockid=" + id + "&" + $$.analyse.params();
            url += "&p=" + ($player.name || "") + "&v=" + ($player.version || "");

            $$.log("get overlay feed", url);
            $$.getScript(url);
        };

        var currentTime = playTimeMs;

        loadFeedTimer = setInterval(function() {
            if (paused || (playTimeMs - currentTime < delay && delay > 0))
                return;

            loadF();
            clearInterval(loadFeedTimer);
            loadFeedTimer = 0;
        }, 1000);
    }

    function preLoadFeed() {
        $$.log("overlay", feedUrl, status);
        $player.off("playing play", preLoadFeed);
        $context.off("changeStatus", changeStatus);

        if (status != "init")
            return;

        loadFeed(DELAY_AFTER_PLAY);
    }

    function pause() {
        clearInterval(timeUpdateTimer);
        timeUpdateTimer = 0;

        if (closed)
            return;

        setStatus("paused");
        paused = true;
        prevShown = shown;
        hide();
    }

    function resume() {
        timeUpdateTimer = setInterval(function() {
            playTimeMs += 1000;
        }, 1000);

        if (closed)
            return;

        setStatus("resumed");
        paused = false;

        if (prevShown && !shown)
            show();
    }

    var $ = $tc;
    var $$ = $tc.tcEx;
    var context = this;
    var $context = $(context);
    var config = $.extend({}, options.ads);
    var id = config.id;
    var url = (config.url || "http://xf.tubecontext.com");
    var feedUrl = url + "/?x=" + config.overlay;
    var loadCount = 0;
    var status = "init";
    var loadFeedTimer = 0;
    var timeAfterCloseMs = 600000;
    var MAX_LOAD_COUNT = 3;
    var DELAY_AFTER_PLAY = 300000;
    var AD_TYPE = "InVideoOverlay";
    var shown = false;
    var prevShown = false;
    var paused = false;
    var timeUpdateTimer = 0;
    var playTimeMs = 0;
    var closed = false;

    var $buttonClose,
        $buttonExpand,
        $block,
        $blockCnt,
        $blockTools,
        $blockBg,
        $blockCopy = null;

    $$.dict.addRange({
        "Close ad": "Закрыть рекламу"
    });

    window[AD_TYPE + id] = function(data) {
        $$.log("loaded overlay " + feedUrl);
        setStatus("loaded");

        if (typeof data != 'object' || data.ads == undefined)
            return;

        setStatus("creating");
        create(data);
    };

    function changeStatus(event, type, status) {
        if (!type || !status || type != "preroll")
            return;

        if (status == "closed" || status == "error") {
            preLoadFeed();
        }
    }

    $context.on("changeStatus", changeStatus);
    $player.on("playing play", preLoadFeed).on("playing play", resume).on("ended pause stop", pause);

    return this;
};
/**
 * PAUSEROLL
 * @param options
 * @param $player
 * @returns {*|HTMLElement}
 */
$tc.fn.pauseroll = function(options, $player, modules) {
    function close() {
        if ($containerPauseroll)
            $containerPauseroll.hide();

        shown = false;
        setStatus("closed");
    }

    function open() {
        $containerAdv1.prop({href: "javascript:void(0);"});
        $containerAdv2.prop({href: "javascript:void(0);"});
        $containerPauseroll.fadeIn();
        shown = true;
        setStatus("opened");
    }

    function createDiv(className) {
        return $("<div />").addClass(className + "_" + id);
    }

    function applyContainers() {
        $context.prepend([
            $containerPauseroll = createDiv("pauseroll")
                .append([
                    $containerAdv1 = $("<a />").prop({href: "javascript:void(0);", "target": "_blank"}).addClass("adv_" + id).addClass("adv1"),
                    $containerAdv2 = $("<a />").prop({href: "javascript:void(0);", "target": "_blank"}).addClass("adv_" + id).addClass("adv2")
                ])
        ]);
    }

    function createAdv($adv, url, src, title) {
        $adv.prop({href: "javascript:void(0);"}).off("click").on("click", function() {
            $(this).prop("href", url + "&" + $$.analyse.params());
            close();
        }).css("border-color", config.borderColor);

        var $img = $$.image().addClass("img_" + id).on("done", imageReady).prop("src", src);
        var $span = $("<span />").addClass("span_" + id).html(title).css("color", config.fontColor);

        $adv.html("").append(createDiv("adv-bg").css("background-color", config.backgroundColor), $img, $span);

    }

    function create(data) {
        var ads = data.ads || [];

        if (data.ads.length != 2) {
            setStatus("error");
            return;
        }

        loadCount++;

        $.extend(config, config, data);

        if (loadCount == 1) {
            applyContainers();
        }

        var ad1 = ads[0];
        createAdv($containerAdv1, ad1.url, ad1.src, ad1.title);
        var ad2 = ads[1];
        createAdv($containerAdv2, ad2.url, ad2.src, ad2.title);

        setStatus("created");
    }

    function imageReady() {
        $$.log("ready image " + $(this).prop("src"));
        var w = $(this)[0].width;
        var h = $(this)[0].height;

        if (w == h) {
            $(this).width(160).height(160);
        } else { //@todo resize

        }

        open();
    }

    function setStatus(v) {
        $$.log("pauseroll.status=" + v);
        status = v;
        $context.data("pauseroll.status", v);
        $context.trigger("changeStatus", {ad: "pauseroll", status: v});
    }

    function loadFeed() {
//        if ($player.currentTime && $player.duration && $player.duration - $player.currentTime < 10) {
//            return;
//        }

        if (shown)
            return;

        setStatus("loading");
        var url = feedUrl + "&t=" + AD_TYPE + "&blockid=" + id + "&" + $$.analyse.params();
        url += "&p=" + ($player.name || "") + "&v=" + ($player.version || "");

        $$.log("get pauseroll feed", url);
        $$.getScript(url);
    }

    var $ = $tc;
    var $$ = $tc.tcEx;
    var context = this;
    var $context = $(context);
    var config = $.extend({}, options.ads);
    var id = config.id;
    var url = (config.url || "http://xf.tubecontext.com");
    var feedUrl = url + "/?x=" + config.pauseroll;
    var status = "init";
    var AD_TYPE = "InVideoPauseRoll";
    var loadCount = 0;
    var shown = false;

    var $containerPauseroll,
        $containerAdv1,
        $containerAdv2 = null;

    window[AD_TYPE + id] = function(data) {
        $$.log("loaded " + feedUrl);
        setStatus("loaded");

        if (typeof data != 'object' || data.ads == undefined)
            return;

        setStatus("creating");
        create(data);
    };

    $player.on("pause", loadFeed);
    $player.on("play playing error ended", close);

    return this;
};
/**
 * ADS
 * @param options
 * @param $player
 * @returns {*|HTMLElement}
 */
$tc.fn.tcPlayerAds = function(options, $player) {
    var $ = $tc;
    var $$ = $tc.tcEx;
    var context = this;
    var $context = $(context);
    var modules = {
        preroll: null,
        postroll: null,
        overlay: null,
        pauseroll: null
    };

    if ($player.width() < 400 || $$.detect.device.mobile())
        return $context;

    $.extend(options.ads, {
        "backgroundColor": "#000000",
        "borderColor": "#333333",
        "fontColor": "#FFFFFF",
        "id": Math.floor((Math.random() * 10000) + 1)
    });

    var config = options.ads;
    var id = config.id;
    var $containerAdArea = null;
    var $vobject = null;

    (function(){
        var advId = "#tcAdv" + id;

        var css =
            advId + ' {' +
                'position: absolute;' +
                'height: auto !important;' +
                'width: 100%;' +
                'font-family: Arial, sans serif;' +
                'font-size: 24px !important;' +
                'overflow: hidden;' +
                'text-align: left;' +
                'margin: 0 !important;' +
                'top:0;left:0;bottom:0;right:0;' +
                'display: block;' +
                'pointer-events: none;' +
                'bottom: 2.2em !important;' +
                "}\n" +

                advId + '.scale {' +
                'bottom: 3.3em !important;' +
                "}\n" +

                advId + ' * {' +
                '-webkit-user-select: none;' +
                '-moz-user-select: none;' +
                '-ms-user-select: none;' +
                '-o-user-select: none;' +
                'user-select: none;' +
                'display: block;' +
                'pointer-events: auto;' +
                "}\n" +

                advId + ' iframe {' +
                'position: absolute;' +
                'z-index: 1;' +
                'overflow: hidden;' +
                'left: 0;' +
                'top: 0;' +
                "}\n" +

                advId + '.scale .preroll_' + id + ',' +
                advId + '.scale .pauseroll_' + id + ',' +
                advId + '.scale .block_' + id +
                ' { ' +
                    $$.css.scale(1.5) +
                "}\n" +

                advId + '.scale .block_' + id +
                    ' { ' +
                    $$.css.origin('center', 'bottom') +
                "}\n";

        $$.appendCss(css);

        $containerAdArea = $context.find("div[rel=adv]:eq(0)");

        if ($containerAdArea.length > 0) {
            id = +$containerAdArea.prop("id").match(/\d+/g);
        } else {
            $containerAdArea = $("<div />").prop("id", "tcAdv" + id).attr("rel", "adv");

            $vobject = $context.find("video");

            if ($vobject.length == 0)
                $vobject = $context.find("object");

            if ($vobject.length == 0)
                $vobject = $context.find("embed");

            if ($vobject.length > 0)
                $vobject.after($containerAdArea);

            $containerAdArea = $("#tcAdv" + id);
        }

        $containerAdArea.unbind("click");
    }());

    function applyPrerollCss() {
        var advId = "#tcAdv" + id;

        var css =
            advId + ' .preroll_' + id + ' {' +
                'position: absolute;' +
                'z-index: 9010;' +
                'width: 100%;' +
                'height: 100%;' +
                'top: 0px;' +
                'left: 0px;' +
                'background: rgba(0,0,0,0);' +
                'visibility: hidden;' +
                'font-size: 14px !important;' +
                "}\n" +

                advId + ' .pre_bg {' +
                'position: absolute;' +
                'z-index: -1;' +
                'width: 100%;' +
                'height: 100%;' +
                'top: 0px;' +
                'left: 0px;' +
                'background: #000;' +
                $$.css.opacity(75) +
                "}\n" +

                advId + ' .preroll_name_' + id + ' {' +
                'position: absolute;' +
                'top: 0;' +
                'font-size: 0.8em;' +
                'left: 0;' +
                'padding: 0.5em 1em;' +
                'letter-spacing: 0.05em;' +
                'color: #ccc;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .preroll_name_' + id + ' .pre_bg {' +
                'border-radius: 0 0.3em 0.3em 0;' +
                "}\n" +

                advId + ' .preroll_cnt_' + id + ' {' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 50%;' +
                'width: 300px;' +
                'height: 300px;' +
                'margin-top: -140px;' +
                'margin-left: -150px;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .preroll_cnt_' + id + ' .cnt_' + id + ' .pre_bg {' +
                'border-radius: 0.3em;' +
                'height: auto;' +
                'width: auto;' +
                'top: -0.5em;' +
                'left: -0.5em;' +
                'right: -0.5em;' +
                'bottom: -0.5em;' +
                "}\n" +

                advId + ' .cnt_' + id + ' {' +
                'position: relative;' +
                'width: 300px;' +
                'height: 250px;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .cnt_main_' + id + ' {' +
                'position: relative;' +
                'width: 300px;' +
                'height: 250px;' +
                'overflow: hidden;' +
                'background: #000;' +
                "}\n" +

                advId + ' .close_bttn_' + id + ' {' +
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

                advId + ' .close_bttn_' + id + ':hover {' +
                'color: #fff;' +
                "}\n" +

                advId + ' .close_bttn_' + id + ' .pre_bg {' +
                'border-radius: 1em;' +
                'background: #222;' +
                "}\n" +

                advId + ' .close_bttn_' + id + ':hover .pre_bg {' +
                'border-radius: 1em;' +
                'background: #000;' +
                "}\n" +

                advId + ' .close_str_' + id + ' {' +
                'margin-top: 1em;' +
                'position: relative;' +
                'text-align: center;' +
                'color: #ccc;' +
                'cursor: pointer;' +
                'font-size: 0.9em;' +
                "}\n" +

                advId + ' .close_str_' + id + ':hover {' +
                'color: #fff;' +
                "}\n" +

                advId + ' .close_str_' + id + ' span{' +
                'position: relative;' +
                'width: 18em;' +
                'padding: 0.5em;' +
                'display: block;' +
                'margin: 0 auto;' +
                "}\n" +

                advId + ' .close_str_' + id + ' .pre_bg {' +
                'border-radius: 0.3em;' +
                'background: #222;' +
                "}\n" +

                advId + ' .close_str_' + id + ':hover .pre_bg {' +
                'background: #000;' +
                "}\n" +

                advId + ' .tc_tDesc' + id + '{' +
                'position:absolute;z-index:10;' +
                'left:0;right:0;bottom:0;' +
                'text-align:center;' +
                'padding:0.5em 0.5em 1em;' +
                'color:#fff;' +
                "}\n" +

                advId + ' .tc_tDesc_bg' + id + '{' +
                'position:absolute;z-index:-1;' +
                'left:0;right:0;bottom:0;top:0;' +
                $$.css.opacity(40) +
                'background:#000' +
                "}\n" +

                advId + ' .cnt_main_' + id + ':hover .tc_tDesc_bg' + id + '{' +
                $$.css.opacity(75) +
                "}\n";

        $$.appendCss(css);
    }

    function applyPauserollCss() {
        var pauseroll = '#tcAdv' + id + ' .pauseroll_' + id;
        var css =
                pauseroll + ' {' +
                'position: absolute;' +
                'width: 100%;' +
                'height: 100%;' +
                'display: none;' +
                "}\n" +

                pauseroll + ' .adv_' + id + ' {' +
                'width: 174px;' +
                'height: 230px;' +
                'border: 1px solid ' + config.borderColor + ";" +
                'border-radius: 5px;' +
                'top: 50%;' +
                'margin-top: -110px;' +
                'position: absolute;' +
                'text-decoration: none;' +
                'overflow: hidden;' +
                "}\n" +

                pauseroll + ' .adv_' + id + '.adv1{' +
                'left: 50%;' +
                'margin-left: -250px;' +
                "}\n" +

                pauseroll + ' .adv_' + id + '.adv2{' +
                'left: 50%;' +
                'margin-left: 74px;' +
                "}\n" +

                pauseroll + ' .adv-bg_' + id + ' {' +
                'background: ' + config.backgroundColor + ";" +
                'position: absolute;' +
                'width: 100%;' +
                'height: 100%;' +
                'border-radius: 5px;' +
                'z-index: 1;' +
                $$.css.opacity(50) +
                "}\n" +

                pauseroll + ' .adv_' + id + ':hover .adv-bg_' + id + ' {' +
                $$.css.opacity(90) +
                "}\n" +

                pauseroll + ' .img_' + id + ' {' +
                'width: 160px;' +
                'height: 160px;' +
                'position: relative;' +
                'margin: 7px;' +
                'border: 0;' +
                'z-index: 2;' +
                "}\n" +

                pauseroll + ' .span_' + id + ' {' +
                'display: block;' +
                'font-size: 14px;' +
                'width: 160px;' +
                'height: 100%;' +
                'position: relative;' +
                'margin: 0 7px;' +
                'overflow: hidden;' +
                'color: ' + config.fontColor + ";" +
                'text-align: center;' +
                'font-family: Arial, sans serif;' +
                'z-index: 2;' +
                "}\n" +

                "";

        $$.appendCss(css);
    }

    function applyOverlayCss() {
        var advId = "#tcAdv" + id;

        var css =
                advId + ' .block_' + id + ' {' +
                'position: absolute !important;' +
                'z-index: 2;' +
                'top: auto !important;' +
                'right: 83px;' +
                'bottom: 0 !important;' +
                'left: 83px;' +
                'margin: auto;' +
                'max-width: 960px;' +
                "}\n" +

                advId + ' .block_cnt_' + id + ' {' +
                'position: relative;' +
                'z-index: 2;' +
                'overflow: hidden;' +
                "}\n" +

                advId + ' .adv_' + id + ' {' +
                'position: relative;' +
                "}\n" +

                advId + ' .adv_' + id + ' a.adv_link_' + id + '{ ' +
                'position: relative;' +
                'display: block;' +
                'padding: 2px;' +
                'max-height: 80px;' +
                'text-decoration: none;' +
                'overflow: hidden;' +
                "}\n" +

                advId + ' .adv_' + id + ' a img {' +
                'float: left;' +
                'border: 0;' +
                'height: 80px;' +
                'width: auto;' +
                'max-width: 100%;' +
                "}\n" +

                advId + ' .adv_' + id + ' a div {' +
                'display: block;' +
                "}\n" +

                advId + ' .adv_' + id + ' a div span {' +
                'display: block;' +
                'padding: 4px 4px 4px 10px;' +
                "}\n" +

                advId + ' .adv_' + id + ' a div span.title_' + id + ' {' +
                'min-height: 18px;' +
                'overflow: hidden;' +
                'text-overflow: ellipsis;' +
                'white-space: nowrap;' +
                'font-size: 15px !important;' +
                'color: ' + config.fontColor + ' !important;' +
                'text-decoration: underline;' +
                "}\n" +

                advId + ' .adv_' + id + ' a div span.descr_' + id + ' {' +
                'font-size: 13px;' +
                'color: ' + config.fontColor + ';' +
                'overflow: hidden;' +
                $$.css.opacity(95) +
                "}\n" +

                advId + ' .block_tools_' + id + ' {' +
                'position: absolute;' +
                'z-index: 3;' +
                'top: -19px;' +
                'right: 0;' +
                'font-weight: bold;' +
                'font-size: 18px;' +
                'line-height: 18px;' +
                'margin-bottom: 1px;' +
                'background-color: ' + config.backgroundColor + ';' +
                'border: 1px solid ' + config.borderColor + ';' +
                $$.css.opacity(75) +
                "}\n" +

                advId + ' .block_tools_' + id + ':hover {' +
                    $$.css.opacity(100) +
                "}\n" +

                advId + ' .block_tools_' + id + ' .bttn {' +
                'position: relative;' +
                'float: right;' +
                'padding: 0;' +
                'margin-left: -1px;' +
                'width: 18px;' +
                'height: 18px;' +
                'cursor: pointer;' +
                'text-align: center;' +
                'background: transparent;' +
                'color: ' + config.borderColor + ';' +
                'border-left: 1px solid ' + config.borderColor + ';' +
                'border-right: 1px solid ' + config.borderColor + ';' +
                'overflow: hidden;' +
                "}\n" +

                advId + ' .block_tools_' + id + ' .bttn:hover {' +
                'color: #333;' +
                'border-color: #000;' +
                'z-index: 2;' +
                'background: #fff;' +
                "}\n" +

                advId + ' .block_tools_' + id + ' .bttn:active {' +
                'color: #333;' +
                'border-color: #000;' +
                'background: #ccc;' +
                'z-index: 2;' +
                "}\n" +

                advId + ' .block_tools_' + id + ' .close {' +
                    'border-right: 0' +
                "}\n" +

                advId + ' .block_tools_' + id + ' .copy, ' +
                advId + ' .block_tools_' + id + ' .copy a {' +
                'width: auto !important;' +
                'padding: 0 0.5em !important;' +
                'font-size: 10px !important;' +
                'color: ' + config.borderColor + ';' +
                'text-decoration: none;' +
                "}\n" +

                advId + ' [data-icon] {' +
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

                advId + ' .next [data-icon], ' + advId + ' .prev [data-icon]  {' +
                'top: -1px;' +
                "}\n" +

                advId + ' .expand {' +
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
                $$.css.opacity(75) +
                "}\n" +

                advId + ' .expand [data-icon] {' +
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

                advId + ' .expand:hover {' +
                'height: 24px;' +
                $$.css.opacity(100) +
                "}\n" +

                advId + ' .block_bg_' + id + ' {' +
                'position: absolute !important;' +
                'z-index: -1;' +
                'right: 0px !important;' +
                'bottom: 0px !important;' +
                'top: 0px !important;' +
                'left: 0px !important;' +
                'border: 1px solid ' + config.borderColor + ';' +
                'background-color: ' + config.backgroundColor + ' !important;' +
                $$.css.opacity(75) +
                "}\n" +

                advId + ':hover .block_bg_' + id + ' {' +
                $$.css.opacity(100) +
                "}\n" +

                advId + ' .starter_' + id + ' {' +
                'position: absolute;' +
                'z-index: 9000;' +
                'width: 100%;' +
                'height: 100%;' +
                'top: 0px;' +
                'left: 0px;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .starter' + id + ' {' +
                'background: #fff;' +
                $$.css.opacity(1) +
                "}\n";

        $$.appendCss(css);
    }

    if (config.preroll || config.postroll)
        applyPrerollCss();

    if (config.preroll) {
        modules.preroll = $containerAdArea.preroll(options, $player, modules);
    }

    if (config.postroll)
        modules.postroll = $containerAdArea.postroll(options, $player, modules);

    if (config.overlay) {
        applyOverlayCss();
        modules.overlay = $containerAdArea.overlay(options, $player, modules);
    }

    if (config.pauseroll) {
        applyPauserollCss();
        modules.pauseroll = $containerAdArea.pauseroll(options, $player, modules);
    }

    function scale() {
        var f = function() {
            //if ($containerAdArea.width() >= window.screen.width)
            if ($containerAdArea.width() >= 1200 && $containerAdArea.height() >= 576)
                $containerAdArea.addClass("scale");
            else
                $containerAdArea.removeClass("scale");
        };
        f();
        setTimeout(f, 2000);
    }

    $player.on("resize", scale);
    $(window).on("resize", scale);

//    $vobject.dchange(function() {
//        var height = this.offsetHeight;
//        var width = this.offsetWidth;
//        var top = this.offset().top;
//        var left = this.offset().left;
//
//        console.log(height, width, top, left);
//        console.log($(this)[0].getBoundingClientRect());
//    });

    return $context;
};