/*!
 * Tc player ads plugin
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */

(function()
{
    var ads = function(options, player){
        var $ = $tc;
        var $$ = $tc.tcEx;
        var context = this;
        var $player = $(player);
        var modules = {
            preroll: null,
            postroll: null,
            overlay: null,
            pauseroll: null
        };

        if ($player.width() < 400 || $$.detect.device.mobile())
            return context;

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

        return context;
    };

    window.tc_ads = ads;
})();