/*!
 * TcEx Jquery Plugins
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */
var $_tc = $_tc || new function() {
    var path = ".";
    function readyCore(callback) {
        if (typeof $tc == 'undefined') {
            loadCore();
            var waitTc = setInterval(function () {
                if (typeof $tc == 'undefined')
                    return;

                clearInterval(waitTc);
                callback();
            }, 50);
        } else {
            callback();
        }
    }

    function loadCore() {
        if (typeof $tc != 'undefined' || window.tcCore)
            return;

        window.tcCore = true;

        loadScript("/tc-core-custom" + SUF + ".js");
    }

    function loadScript(script) {
        var js = document.createElement('script');
        js.type = 'text/javascript';
        js.src = path + script;
        document.getElementsByTagName('head')[0].appendChild(js);
    }

    var DEBUG = window.DEBUG || false;
    var SUF = (!DEBUG) ? ".min" : "";

    this.player = function(config) {
        config = config || {};
        path = config.path || path;
        var $, $$, $player;

        DEBUG = config.debug || false;
        window.DEBUG = DEBUG;
        SUF = (!DEBUG) ? ".min" : "";

        if (config.playlist && config.containerId) {
            var div = document.getElementById(config.containerId);

            if (config.width)
                div.width = +config.width + "px";

            if (config.height)
                div.height = +config.height + "px";

            div.innerHTML = '<p style="color: #666; padding: 40px;">Video player loading ...</p>';
        }

        function loadModuleAds() {
            if (config.ads) {
                config.ads.debug = config.debug;
                config.ads.containerId = config.containerId;

                $$.getScript(path + "/tc-player-ads" + SUF + ".js", true).done(function() {
                    $player.tcPlayerAds(config, $player);
                });
            }
        }

        readyCore(function() {
            $ = $tc;
            $$ = $.tcEx;

            if (config.playlist) { //tubecontext player
                $$.getScript(path + "/tc-tcplayer" + SUF + ".js", true).done(function() {
                    $player = $("#" + config.containerId).tcPlayer(config);
                    loadModuleAds();
                });
            } else { //other players
                //todo find in container
            }
        });
    };
};