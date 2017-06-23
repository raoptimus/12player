/*!
 * TcEx Jquery Plugins
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */

(function () {

    var $buttonClose,
        $buttonClosePlay,
        $containerPreRoll,
        $containerCnt,
        $containerMain,
        $bttnText;

    var opened = false;

    /**
     * Base for PreRoll PostRoll PauseRoll
     * @param options
     * @param $player
     * @returns {*|HTMLElement}
     */
    var basePreRoll = function (options, $player) {

        var $ = $tc;
        var $$ = $tc.tcEx;
        var context = this;
        var $context = $(context);
        var config = $.extend({}, options.ads);
        var id = config.id;
        var translate = config.translate;
        var url = (config.url || "http://xf.tubecontext.com");
        var isPreRoll = false;
        var feedUrl, AD_TYPE, startEvents, bttnText;

        switch (config.type) {

            case "preroll":
                feedUrl = url + "/?x=" + config.preroll;
                AD_TYPE = "InVideoPreRoll";
                startEvents = "loadstart canplay ready";
                isPreRoll = true;
                bttnText = "Skip & Play";
                break;

            case "postroll":
                feedUrl = url + "/?x=" + config.postroll;
                AD_TYPE = "InVideoPostRoll";
                startEvents = "ended stop";
                bttnText = "Close & Replay";
                break;

            case "pauseroll":
                feedUrl = url + "/?x=" + config.pauseroll;
                AD_TYPE = "InVideoPauseRoll";
                startEvents = "pause";
                bttnText = "Skip & Resume";
                break;

            default:
                return this;
        }

        var status = "init";

        if (translate){
            $$.dict.addRange({
                "Skip & Play": "Пропустить и Начать просмотр",
                "Close & Replay": "Закрыть и Просмотреть снова",
                "Skip & Resume": "Пропустить и Продолжить",
                "Advertisement": "Реклама"
            });
        }

        function closeAndPlay() {
            close();
            $player.play();
        }

        function open() {

            $containerPreRoll.show();
            setStatus("opened");
            $player.pause();
            opened = true;
        }

        function close() {

            if (!opened)
                return true;

            $containerPreRoll.hide();
            setStatus("closed");
        }

        $player.on("play playing", close);

        function createDiv(className) {
            return $("<div />").addClass(className + "_" + id);
        }

        function createDivBg() {
            return $("<div />").addClass("pre_bg");
        }

        function applyContainers() {
            $context.prepend([
                $containerPreRoll = createDiv("preroll")
                    .append([

                        createDiv("preroll_name").html("ads by 12traffic.com")
                            /*.append([
                                $("<a />").prop({
                                    "href": "http://12traffic.com/",
                                    "target": "_blank"
                                }).html("ads by 12traffic.com")
                                    .css("color", config.borderColor)
                                , createDivBg()
                            ])*/,

                        $containerCnt = createDiv("preroll_cnt")
                            .append([
                                createDiv("cnt")
                                    .append([
                                        $containerMain = createDiv("cnt_main"),
                                        createDivBg()
                                    ]),

                                $buttonClose = createDiv("close_bttn")
                                    .append([
                                        "&times;", createDivBg()
                                    ]).hide(),

                                $buttonClosePlay = createDiv("close_str")
                                    .append([
                                        $("<span />")
                                            .append([
                                                $bttnText = createDiv("bttn_text").html($$.dict.t(bttnText)),
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

            if (!$containerPreRoll) {
                applyContainers();
                $buttonClose.click(closeAndPlay);
                $buttonClosePlay.click(closeAndPlay);
            }
            else
                $bttnText.html($$.dict.t(bttnText));

            //ads[1] = ads[0];

            var adsCount = ads.length <= 2 ? ads.length : 2;
            var adWidth = 100 / adsCount;
            var $ads = $("<div/>");
            var readyCount = 0;
            var cntWidth = 0;

            for (var i = 0; i < adsCount; i = i + 1) {

                (function (ad) {

                    var w = ad.title ? "250" : "300";
                    cntWidth += parseInt(w);

                    var $link = $("<a />")
                        .prop({href: "javascript:void(0);", "target": "_blank"})
                        .addClass('adv_link_' + id)
                        .css({
                            display: 'block',
                            position: 'relative',
                            width: w + "px"
                        });

                    if (ad.title) {
                        $('<div />')
                            .text(ad.title)
                            .addClass('tc_tTitle' + id)
                            .append($('<div />').addClass('tc_tTitle_bg' + id))
                            .appendTo($link);
                    }

                    $$.image().prop("src", ad.src).on("done", function () {

                        $$.log("loaded", ad.src);
                        var $img = $(this).css({width: "100%"});

                        $link.append($img);

                        var adUrl = ad.url;

                        $link.on("click", function () {

                            $(this).prop("href", adUrl + "&" + $$.analyse.params());
                            closeAndPlay();
                        });

                        $ads.append(createDiv("ad").css({width: adWidth + "%"}).append($link));
                        readyCount++;
                    });

                })(ads[i]);
            }

            var imagesWait = setInterval(function () {

                if (readyCount == adsCount) {

                    clearInterval(imagesWait);

                    $containerMain.html($ads);

                    if (cntWidth > 0) {
                        cntWidth += 10;
                        $containerMain.css({width: cntWidth + "px"});
                        $containerCnt.css({"margin-left": "-" + (cntWidth / 2) + "px"});
                    }

                    open();

                    setStatus("created");
                }
            }, 500);
        }

        function setStatus(st) {

            status = st;
            $context.data("preroll.status", st);
            $context.trigger("changeStatus", ["preroll", status]);
        }

        function register() {

            window[AD_TYPE + id] = function (data) {

                $$.log("loaded " + feedUrl);
                setStatus("loaded");

                if ($player.playing || typeof data != 'object' || data.ads == undefined) {
                    return;
                }

                setStatus("creating");
                create(data);
            };
        }

        function loadFeed() {

            $$.log(feedUrl, status);
            /*$player.off(startEvents, loadFeed);
             if (status != "init") {
             return;
             }*/

            register();
            setStatus("loading");
            var url = feedUrl + "&t=" + AD_TYPE + "&blockid=" + id + "&" + $$.analyse.params();
            url += "&p=" + ($player.name || "") + "&v=" + ($player.version || "");

            $$.log("get " + config.type + " feed", "#" + url);
            $$.getScript(url);

            if (isPreRoll) {
                $player.pause();
            }
        }

        if (isPreRoll) {
            loadFeed();
        } else {
            $player.on(startEvents, loadFeed);
        }

        return this;
    };

    /**
     * PreRoll
     * @param options
     * @param $player
     * @returns {*}
     */
    $tc.fn.preroll = $tc.extend(function (options, $player) {

        options.ads.type = 'preroll';
        basePreRoll.apply(this, arguments);
        return this;

    }, basePreRoll);

    /**
     * PostRoll
     * @param options
     * @param $player
     * @returns {*}
     */
    $tc.fn.postroll = $tc.extend(function (options, $player) {

        options.ads.type = 'postroll';
        basePreRoll.apply(this, arguments);
        return this;

    }, basePreRoll);

    /**
     * PauseRoll
     * @param options
     * @param $player
     * @returns {*}
     */
    $tc.fn.pauseroll = $tc.extend(function (options, $player) {

        options.ads.type = 'pauseroll';
        basePreRoll.apply(this, arguments);
        return this;

    }, basePreRoll);
})();

(function(){

    /**
     * Overlay
     * @param options
     * @param $player
     * @returns {*|HTMLElement}
     */
    $tc.fn.overlay = function (options, $player) {
        var $ = $tc;
        var $$ = $tc.tcEx;
        var context = this;
        var $context = $(context);
        var config = $.extend({}, options.ads);
        var id = config.id;
        var translate = config.translate;
        var url = (config.url || "http://xf.tubecontext.com");
        var feedUrl = url + "/?x=" + config.overlay;
        var loadCount = 0;
        var status = "init";
        var loadFeedTimer = 0;
        var firstLoadInterval = 10;
        var reloadInterval = 30;
        var AD_TYPE = "InVideoOverlay";
        var shown = false;
        var paused = false;
        var timeUpdateTimer = 0;
        var playTimeMs = 0;
        var closed = false;

        var $buttonClose,
            $block,
            $blockCnt,
            $blockTools,
            $blockBg,
            $blockCopy = null;

        if (translate){
            $$.dict.addRange({
                "Close ad": "Закрыть рекламу"
            });
        }

        function toggleWatermark(close) {

            if ($player.toggleWatermark) {
                $player.toggleWatermark(close);
            }
        }

        function close() {
            if (!$block) {
                return;
            }

            if (closed) {
                return;
            }

            $$.log("close");

            $block.animate({left: "-" + $block.width() + "px"}, 1000, function () {
                $blockCnt.hide();
                $blockBg.hide();
                $block.hide()
            });

            //toggleWatermark(false);
            setStatus("closed");
            closed = true;
            paused = false;
            shown = false;
        }

        function show() {

            if (!$block)// || shown)
            {
                return;
            }

            $$.log("show");

            $block.css({left: "-" + $block.width() + "px"});
            $blockCnt.show();
            $blockBg.show();
            $block.show().animate({left: 0}, 1000);

            toggleWatermark(true);
            setStatus("showed");
            shown = true;

            waitForSeekerInterval(firstLoadInterval + reloadInterval * loadCount, reload);
        }

        function reload() {

            if (closed) {
                return;
            }

            $$.log("reload");

            loadFeed();
        }

        function hide() {

            if (!$block) {
                return;
            }

            $$.log("hide");

            $block.hide();

            //toggleWatermark(false);
            setStatus("hided");
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
                $block = createDiv("block").css({display: "none"})
                    .append([
                        $blockCnt = createDiv("block_cnt"),
                        $blockTools = createDiv("block_tools").css(cssBkg)
                            .append([
                                $blockCopy = createButton("copy").css("color", config.borderColor)
                            ]),
                        $blockBg = createDiv("block_bg").css(cssBkg),
                        $buttonClose = createButton("close").prop("title", $$.dict.t("Close ad"))
                            .append($('<span data-icon="" />').html("&times;"))
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

            $.extend(config, config, data);

            if (loadCount == 1) {

                applyContainers();

                if (data.adUrl) {
                    $blockCopy.html("").append(
                        $("<a />").prop({"href": data.adUrl, "target": data.adTarget}).html(data.adTitle)
                            .css("color", config.borderColor)
                    );
                }
                else
                    $blockCopy.html("ads by 12traffic.com");

                var scale = 1;
                var margin = 166;
                var playerW = $player.width();
                var max = (playerW - margin) / scale;
                var blockW = playerW - margin;

                if (blockW > 960) {
                    blockW = 960;
                }

                if (blockW > max) {
                    blockW = max;
                }

                $block.css({
                    "left": 0,
                    "width": blockW + "px",
                    "bottom": "5px"
                });
            }

            //ads[1] = ads[0];
            //ads[2] = ads[0];

            var adsCount = ads.length <= 3 ? ads.length : 3;
            var adWidth = (100 / adsCount) - 1;
            var $ads = $("<div/>");
            var readyCount = 0;

            for (var i = 0; i < adsCount; i = i + 1) {

                (function (ad) {

                    $$.image().prop("src", ad.src).on("done", function () {

                        var $img = this;
                        var $link = $("<a />")
                            .prop({"href": "javascript:void(0);", "target": "_blank"})
                            .addClass('adv_link_' + id)
                            .append($img);

                        var $txt = $("<div />");

                        if (ad.title.length > 1) {
                            createSpan("title").html(ad.title).css("color", config.fontColor)
                                .appendTo($txt);
                        }

                        $link.append($txt);

                        $ads.append(createDiv("adv").css("width", adWidth + "%").append($link));

                        var adUrl = ad.url;

                        $link.on("click", function () {
                            $(this).prop("href", adUrl + "&" + $$.analyse.params());
                            close();
                        });

                        readyCount++;
                    });

                })(ads[i]);
            }

            var imagesWait = setInterval(function () {

                if (readyCount == adsCount) {

                    clearInterval(imagesWait);

                    $blockCnt.html($ads);

                    if (paused) {
                        shown = true;
                    } else {
                        show();
                    }

                    $buttonClose.on("click", close);
                    setStatus("created");
                }
            }, 500);
        }

        function setStatus(st, description) {

            description = description ? ", " + description : "";
            $$.log("overlay.status=" + st + description);
            status = st;
            $context.data("overlay.status", st);
            $context.trigger("changeStatus", ["overlay", status]);
        }

        var durWait, intWait;

        function waitForSeekerInterval(interval, callback)
        {
            $$.log("waiting up to " + interval + " of video");

            if (durWait)
            {
                clearInterval(durWait);
                durWait = 0;
            }

            durWait = setInterval(function () {

                if($player.duration > 0 && $player.currentTime > 0)
                {
                    clearInterval(durWait);
                    durWait = 0;

                    var waitUp = $player.duration / 100 * interval;

                    if (waitUp < $player.currentTime)
                        return true;

                    //console.log("wait up to " + waitUp);

                    if (intWait)
                    {
                        clearInterval(intWait);
                        intWait = 0;
                    }

                    intWait = setInterval(function () {

                        //console.log($player.duration + " = " + $player.currentTime);

                        if ($player.currentTime >= waitUp)
                        {
                            clearInterval(intWait);
                            intWait = 0;

                            if (typeof callback === "function")
                                callback();
                        }
                    }, 500);
                }
            }, 500);
        }

        function loadFeed() {

            if (loadFeedTimer) {
                return;
            }

            setStatus("loading");

            loadFeedTimer = setInterval(function () {

                if (paused) {
                    return;
                }

                var url = feedUrl + "&t=" + AD_TYPE + "&blockid=" + id + "&" + $$.analyse.params();
                url += "&p=" + ($player.name || "") + "&v=" + ($player.version || "");

                $$.log("get overlay feed", url);
                $$.getScript(url);

                clearInterval(loadFeedTimer);
                loadFeedTimer = 0;

            }, 1000);
        }

        function preLoadFeed() {

            $$.log("overlay", feedUrl, status);
            $player.off("playing play", preLoadFeed);
            $context.off("changeStatus", changeStatus);

            if (status != "init") {
                return;
            }

            waitForSeekerInterval(firstLoadInterval, loadFeed);
        }

        function pause() {

            clearInterval(timeUpdateTimer);
            timeUpdateTimer = 0;

            if (closed) {
                return;
            }

            setStatus("paused");
            paused = true;

            hide();
        }

        function resume() {

            if (!timeUpdateTimer) {
                timeUpdateTimer = setInterval(function () {
                    playTimeMs += 1000;

                }, 1000);
            }

            if (closed) {
                return;
            }

            setStatus("resumed");
            paused = false;

            if (shown) {
                setTimeout(function () {
                    //toggleWatermark(true);
                    if (!paused)
                        $block.show();
                }, 2000);
            }
        }

        window[AD_TYPE + id] = function (data) {

            $$.log("loaded overlay " + feedUrl);
            setStatus("loaded");

            if (typeof data != 'object' || data.ads == undefined) {
                return;
            }

            setStatus("creating");
            create(data);
        };

        function changeStatus(event, type, status) {
            if (!type || !status || type != "preroll") {
                return;
            }

            if (status == "closed" || status == "error") {
                preLoadFeed();
            }
        }

        $context.on("changeStatus", changeStatus);
        $player.on("playing play", preLoadFeed).on("playing play", resume).on("ended pause stop", pause);

        return this;
    };

    /**
     * Ads
     * @param options
     * @param $player
     * @returns {*|HTMLElement}
     */
    $tc.fn.tcPlayerAds = function (options, $player) {

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

        if ($player.width() < 400 || $$.detect.device.mobile()) {
            return $context;
        }

        $.extend(options.ads, {
            "backgroundColor": "#000000",
            "borderColor": "#333333",
            "fontColor": "#FFFFFF",
            "id": Math.floor((Math.random() * 10000) + 1)
        });

        var config = options.ads;
        var id = config.id;
        config.translate = typeof config.translate != "undefined" ? $$.cast.toBoolean(config.translate) : true;
        var $containerAdArea = null;
        var $vobject = null;

        (function () {
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

                advId + '.zoomin .preroll_cnt_' + id + ',' +
                advId + '.zoomin .block_' + id +
                ' { ' +
                $$.css.scale(1.5) +
                "}\n" +

                advId + '.zoomout .preroll_cnt_' + id +
                ' { ' +
                $$.css.scale(0.5) +
                "}\n" +

                advId + '.scale .block_' + id +
                ' { ' +
                $$.css.origin('left', 'bottom') +
                "}\n";

            $$.appendCss(css);

            $containerAdArea = $context.find("div[rel=adv]:eq(0)");

            if ($containerAdArea.length > 0) {

                id = +$containerAdArea.prop("id").match(/\d+/g);
            } else {

                $containerAdArea = $("<div />").prop("id", "tcAdv" + id).attr("rel", "adv");

                $vobject = $context.find("video");

                if ($vobject.length == 0) {
                    $vobject = $context.find("object");
                }

                if ($vobject.length == 0) {
                    $vobject = $context.find("embed");
                }

                if ($vobject.length > 0) {
                    $vobject.after($containerAdArea);
                }

                $containerAdArea = $("#tcAdv" + id);
            }

            $containerAdArea.unbind("click");
        })();

        function applyPreRollCss() {

            var advId = "#tcAdv" + id;

            var css =
                advId + ' .preroll_' + id + ' {' +
                'position: absolute;' +
                'z-index: 9010;' +
                'width: 100%;' +
                'height: 100%;' +
                'top: 0px;' +
                'left: 0px;' +
                'right: 0px;' +
                'bottom: 0px;' +
                'background: rgba(0,0,0,0);' +
                'display: none;' +
                'font-size: 14px !important;' +
                "}\n" +

                advId + ' .pre_bg {' +
                'position: absolute;' +
                'z-index: -1;' +
                'width: 100%;' +
                'height: 100%;' +
                'top: 0px;' +
                'left: 0px;' +
                'background: #000000;' +
                $$.css.opacity(75) +
                "}\n" +

                advId + ' .preroll_name_' + id + ' {' +
                'position: absolute;' +
                'top: 5px;' +
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

                advId + ' .preroll_name_' + id + ' a {' +
                'font-size: 11px !important;' +
                'color: #CCC !important;' +
                'text-decoration: none;' +
                "}\n" +

                advId + ' .preroll_name_' + id + ' a:hover {' +
                'color: #FFF !important;;' +
                "}\n" +

                advId + ' .preroll_cnt_' + id + ' {' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 50%;' +
                'height: 300px;' +
                'margin-top: -140px;' +
                'margin-left: -300px;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .cnt_' + id + ' {' +
                'position: relative;' +
                'height: 250px;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .cnt_main_' + id + ' {' +
                'position: relative;' +
                'width: 610px;' +
                'height: 250px;' +
                'overflow: hidden;' +
                //'background: #000;' +
                "}\n" +

                 advId + ' .preroll_cnt_' + id + ' .cnt_' + id + ' .pre_bg {' +
                 'border-radius: 0.3em;' +
                 'height: auto;' +
                 'width: auto;' +
                 'top: -0.5em;' +
                 'left: -0.2em;' +
                 'right: -0.2em;' +
                 'bottom: -0.5em;' +
                 //'opacity: 1;' +
                 "}\n" +

                advId + ' .ad_' + id + ' {' +
                'width: 50%;' +
                'height: 250px;' +
                'float: left;' +
                'background: rgba(0,0,0,0);' +
                "}\n" +

                advId + ' .ad_' + id + ' a {' +
                    //'width: 250px;' +
                    //'height: 250px;' +
                'margin: 0 auto;' +
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
                'top: -17px;' +
                'right: -15px;' +
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

                advId + ' .tc_tTitle' + id + '{' +
                'position:absolute;z-index:10;' +
                'left:0;right:0;bottom:0;' +
                'text-align:center;' +
                'padding:0.5em 0.5em 1em;' +
                'color:#fff;' +
                "}\n" +

                advId + ' .tc_tTitle_bg' + id + '{' +
                'position:absolute;z-index:-1;' +
                'left:0;right:0;bottom:0;top:0;' +
                $$.css.opacity(40) +
                'background:#000' +
                "}\n" +

                advId + ' .ad_' + id + ':hover .tc_tTitle_bg' + id + '{' +
                $$.css.opacity(75) +
                "}\n";

            $$.appendCss(css);
        }

        function applyOverlayCss() {

            var advId = "#tcAdv" + id;

            var css =
                advId + ' .block_' + id + ' {' +
                'position: absolute !important;' +
                'z-index: 2;' +
                'bottom: 5px;' +
                'left: 0;' +
                'max-width: 960px;' +
                "}\n" +

                advId + ' .block_cnt_' + id + ' {' +
                'position: relative;' +
                'z-index: 2;' +
                'overflow: hidden;' +
                'min-height: 60px;' +
                "}\n" +

                advId + ' .adv_' + id + ' {' +
                'position: relative;' +
                'float: left;' +
                'width: 32%;' +
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
                'height: 60px;' +
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
                'font-size: 13px !important;' +
                'color: ' + config.fontColor + ' !important;' +
                'text-decoration: underline;' +
                "}\n" +

                advId + ' .block_tools_' + id + ' {' +
                'position: absolute;' +
                'z-index: 3;' +
                'top: -18px;' +
                'left: 0;' +
                'font-weight: bold;' +
                'font-size: 18px;' +
                'line-height: 18px;' +
                'margin-bottom: 1px;' +
                    //'display: none;' +
                'background-color: ' + config.backgroundColor + ';' +
                    //'border: 1px solid ' + config.borderColor + ';' +
                $$.css.opacity(60) +
                "}\n" +

                advId + ' .block_tools_' + id + ':hover {' +
                $$.css.opacity(100) +
                "}\n" +

                    //advId + ' .block_' + id + ':hover .block_tools_' + id + ' {' +
                    //'display: block;' +
                    //"}\n" +

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
                    //'border-left: 1px solid ' + config.borderColor + ';' +
                    //'border-right: 1px solid ' + config.borderColor + ';' +
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

                advId + ' .block_' + id + ' .close {' +
                    //advId + ' .block_tools_' + id + ' .close {' +
                    //'border-right: 0' +
                'position: absolute;' +
                'right: 5px;' +
                'top: 24px;' +
                'z-index: 200;' +
                'cursor: pointer;' +
                'font-size: 28px;' +
                'background: transparent !important;' +
                "}\n" +

                advId + ' .block_' + id + ' .close:hover {' +
                'color: #FFFFFF !important;' +
                'cursor: pointer;' +
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
                $$.css.opacity(40) +
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
                    //'border: 1px solid ' + config.borderColor + ';' +
                'background-color: ' + config.backgroundColor + ' !important;' +
                $$.css.opacity(40) +
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

        if (config.preroll || config.postroll || config.pauseroll) {
            applyPreRollCss();
        }

        if (config.preroll) {
            modules.preroll = $containerAdArea.preroll(options, $player, modules);
        }

        if (config.postroll) {
            modules.postroll = $containerAdArea.postroll(options, $player, modules);
        }

        if (config.overlay) {
            applyOverlayCss();
            modules.overlay = $containerAdArea.overlay(options, $player, modules);
        }

        if (config.pauseroll) {
            modules.pauseroll = $containerAdArea.pauseroll(options, $player, modules);
        }

        function scale() {

            var f = function () {

                if ($containerAdArea.width() >= 1200 && $containerAdArea.height() >= 576) {
                    $containerAdArea.addClass("scale zoomin");
                } else if ($containerAdArea.width() < 600) {
                    $containerAdArea.addClass("zoomout");
                }else {
                    $containerAdArea.removeClass("scale zoomin zoomout");
                }
            };
            f();
            setTimeout(f, 2000);
        }

        $player.on("resize", scale);
        $(window).on("resize", scale);

        return $context;
    };
})();