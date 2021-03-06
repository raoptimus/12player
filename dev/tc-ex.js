/*!
 * TcEx Jquery Plugins
 * http://12traff.com/
 * http://12player.tv/
 *
 * Copyright 2014
 */
;(function($){

    var $$ = function() {};
    $.extend({
        tcEx: $$
    });

    window['DEBUG'] = (/BetaTester/.test(document.cookie.toString()) || window.DEBUG);

    (function(){
        $$.detect = function() {};
        $$.detect.device = function() {
            if ((function(a){return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))}(navigator.userAgent||navigator.vendor||window.opera)))
                return "mobile";

            if (/ipad|tablet|nexus/.test(navigator.userAgent.toLowerCase()))
                return "tablet";

            return "pc";
        };
        $$.detect.device.mobile = function() {
            return ($$.detect.device() == "mobile");
        };
        $$.detect.device.tablet = function() {
            return ($$.detect.device() == "tablet");
        };
        $$.detect.device.pc = function() {
            return ($$.detect.device() == "pc");
        };
        $$.detect.browser = {
            ie: function() {
                return /iemobile|trident|msie/.test(navigator.userAgent.toLowerCase());
            }
        };
        $$.detect.os = {
            ios: function() {
                return /ios|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
            },
            mac: function() {
                return /Macintosh/.test(navigator.userAgent);
            },
            win: function() {
                return $$.detect.browser.ie() || /Windows/.test(navigator.userAgent);
            }
        }
    })();

    $$.cast = {
        toBoolean: function(v) {
            if (typeof v == 'string')
                return (v.toLowerCase() == 'true');

            return Boolean(v);
        },
        toFlashvarsString: function(attr) {
            var s = '';

            for (var key in attr) {
                if (attr.hasOwnProperty(key) && typeof attr[key] != 'function')
                    s += key + '=' + encodeURIComponent(attr[key]) + '&';
            }

            return s.replace(/&$/, '');
        },
        toObjectParamVars: function(attr) {
            var s = '';

            for (var key in attr) {
                if (attr.hasOwnProperty(key) && typeof attr[key] != 'function')
                    s += '<param name="' + key + '" value="' + attr[key] + '" />';
            }

            return s;
        },
        toHtmlString: function(attr) {
            var s = [];

            for (var key in attr) {
                if (attr.hasOwnProperty(key) && typeof attr[key] != 'function')
                    s.push(key + '="' + attr[key] + '"');
            }

            return s.join(" ");
        }
    };

    (function(){
        var dict = {};
        $$.dict = {};
        $$.dict.t = function(msg) {
            return (navigator.language == "ru" || navigator.language == "ru-RU") ? (dict[msg] || msg) : msg;
        };
        $$.dict.add = function(en, ru) {
            if (en && typeof en === "object" ) {
                for (var k in en) {
                    if (en.hasOwnProperty(k))
                        dict[k] = en[k];
                }
            } else if (ru) {
                dict[en] = ru;
            }

            return $$.dict.t(en);
        };
        $$.dict.addRange = function(arr) {
            for (var k in arr) {
                if (arr.hasOwnProperty(k)) {
                    $$.dict.add(k, arr[k]);
                }
            }
        };
    }());

    (function(){
        var support;
        $$.video = {};
        $$.video.has = function(codec) {
            support || function() {
                support = {
                    is: false,
                    ogg: false,
                    h264: false,
                    webm: false
                };

                try {
                    var v = document.createElement("video");

                    if (v.canPlayType) {
                        support.is = true;
                        support.ogg = (v.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, "") !== "");
                        support.h264 = (v.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, "") !== "");
                        support.webm = (v.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, "") !== "");
                    }
                } catch (e) {

                }
            }();

            return (codec) ? (support[codec] || false) : support.is;
        };
    }());

    $$.flash = {
        version: function() {
            try {
                try {
                    var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');

                    try {
                        axo.AllowScriptAccess = 'always';
                    }
                    catch (e) {
                        return '6,0,0';
                    }
                }
                catch (e) {

                }

                return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
            }
            catch (e) {
                try {
                    if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
                        return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
                    }
                }
                catch (e) {

                }
            }

            return '0,0,0';
        },

        has: function(major, minor, revision) {
            var pv = $$.flash.version().match(/\d+/g);
            var rv = String([major, minor, revision]).match(/\d+/g);

            for (var i = 0; i < 3; i++) {
                pv[i] = parseInt(pv[i] || 0);
                rv[i] = parseInt(rv[i] || 0);

                if (pv[i] < rv[i])
                    return false;

                if (pv[i] > rv[i])
                    return true;
            }

            return false;
        }
    };

    //ie9 fix
    if (window.attachEvent) {
        window.attachEvent("onbeforeunload", function() {
            window.__flash_unloadHandler = function() {};
            window.__flash_savedUnloadHandler = function() {};
        });
    }

    $$.cookie = {
        add: function (name, value, expiresMs) {
            var expire = new Date();
            expire.setTime(+(new Date()) + ((expiresMs || 0) * 1000));
            document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expire.toGMTString() + ";path=/";
        },
        get: function (name) {
            try {
                var dc = document.cookie;
                var prefix = name + "=";
                var begin = dc.indexOf("; " + prefix);

                if (begin == -1) {
                    begin = dc.indexOf(prefix);

                    if (begin != 0)
                        return null;
                }
                else {
                    begin += 2;
                }

                var end = document.cookie.indexOf(";", begin);

                if (end == -1)
                    end = dc.length;

                return decodeURIComponent(dc.substring(begin + prefix.length, end));
            }
            catch (e) {
                return null;
            }
        }
    };

    $$.storage = {
        support: !(typeof (localStorage) == 'undefined'),
        put: function (key, value) {
            if (!$$.storage.support) {
                $$.cookie.add(key, value, 86400 * 30);
                return;
            }

            try {
                localStorage.setItem(key, value);
            } catch (e) {
                try {
                    if ((e.name).toUpperCase() == 'QUOTA_EXCEEDED_ERR') {
                        localStorage.clear();
                    }
                } catch (e) {
                }
            }
        },
        get: function (key) {
            if (!$$.storage.support)
                return $$.cookie.get(key);

            return localStorage.getItem(key);
        }
    };

    $$.getScript = function(url, cache) {
        return $.ajax({
            type: "GET",
            url: url,
            dataType: "script",
            scriptCharset: "utf-8",
            "cache": (cache || false)
        });
    };

    $$.image = function() {
        var img = new Image();
        var $img = $(img);
        var attempts = 0;

        var loadingImg = setInterval(function() {
            if (img.width > 0 && img.height > 0) {
                if ($img.width() == 0 || $img.height() == 0) {
//                    $img.width(img.width);
//                    $img.height(img.height);
                }

                setTimeout(function() {
                    $img.trigger("done");
                }, 100);

                clearInterval(loadingImg);
            }

            attempts++;

            if (attempts > 100) {
                clearInterval(loadingImg);
                $img.trigger("fail");
            }
        }, 30);

        return $img;
    };

    $$.getters = function(obj, name, onGet, onSet) {
        var oldValue = obj[name],
            getFn = function () {
                return onGet.apply(obj, [oldValue]);
            },
            setFn = function (newValue) {
                return oldValue = onSet.apply(obj, [newValue]);
            };

        if (Object.defineProperty) {
            try {
                Object.defineProperty(obj, name, {
                    get: getFn,
                    set: setFn
                });
            }
            catch (e) {

            }
        } else if (obj.__defineGetter__) {
            obj.__defineGetter__(name, getFn);
            obj.__defineSetter__(name, setFn);
        } else {
            var onPropertyChange = function () {
                if (event.propertyName == name) {
                    // temporarily remove the event so it doesn't fire again and create a loop
                    obj.detachEvent("onpropertychange", onPropertyChange);

                    // get the changed value, run it through the set function
                    setFn(obj[name]);

                    // restore the get function
                    obj[name] = getFn;
                    obj[name].toString = getFn;

                    // restore the event
                    obj.attachEvent("onpropertychange", onPropertyChange);
                }
            };

            obj[name] = getFn;
            obj[name].toString = getFn;

            if (obj.addEventListener) {
                obj.addEventListener('onpropertychange', onPropertyChange, false);
            } else if (window.attachEvent) {
                window.attachEvent('onpropertychange', onPropertyChange);
            }
        }
    };

    $$.loadCss = function(url) {
        if (window.DEBUG)
            url += ((url.indexOf("?") == -1) ? "?" : "&") + +(new Date());

        $('<link />')
            .prop({rel: "stylesheet", type: "text/css", href: url})
            .appendTo($("head"));
    };

    $$.appendCss = function(css, doc) {
        doc = doc || document;
        var head = doc.getElementsByTagName('head')[0];
        var s = doc.createElement('style');
        s.setAttribute('type', 'text/css');

        if (s.styleSheet) {   // IE
            s.styleSheet.cssText = css;
        } else {                // the world
            s.appendChild(document.createTextNode(css));
        }

        head.appendChild(s);
    };

    $$.json = window.JSON || new function() {
        function encodeValue(v) {
            if (v == undefined || v == null)
                return "null";

            switch (typeof v) {
                case "string":
                    return '"' + v + '"';
                case "object":
                case "array":
                    return encode(v);
                case "number":
                    return v;
                case "boolean":
                    return (v) ? 'true' : 'false';

                default:
                    return "null";
            }
        }

        this.stringify = function(o) {
            if (o == undefined || 0 == null)
                return "null";

            var result = "";
            var start = "";
            var end = "";
            var split = "";

            switch (typeof o) {
                case "array": {
                    start = "[";
                    end = "]";

                    for (var i = 0; i < o.length; i++) {
                        result += split + i + ':' + encodeValue(o[i]);
                        split = ",";
                    }
                }
                    break;

                case "object": {
                    start = "{";
                    end = "}";

                    for (var k in o) {
                        if (o.hasOwnProperty(k)) {
                            result += split + '"' + k + '":' + encodeValue(o[k]);
                            split = ",";
                        }
                    }
                }
                    break;

                default: result += encodeValue(o);
            }

            return (result == "") ? "null" : start + result + end;
        };
    };

    $$.date = {
        now: function() {
            return new Date();
        }
    };
    $$.date.now.timestamp = function() {
        return +new Date();
    };

    $$.format = {
        num2d: function(num) {
            if (isNaN(num))
                return "00";

            return (num < 10) ? "0" + num : num;
        }
    };

    $$.window = function() {
        try {
            return window.top || window;
        }
        catch (ignored) {
            return window;
        }
    }();

    $$.log = function (a, b, c, d, e) {
        try {
            if (!DEBUG)
                return;

            if (arguments.callee.caller) {
                [].unshift.call(arguments, arguments.callee.caller.name + "=\t");
            }

            if ('console' in window) {
                ((Function.prototype.bind)
                    ? Function.prototype.bind.call(console.log, console)
                    : Function.prototype.apply.call(console.log, console, arguments))
                    .apply(this, arguments);
            }
        }
        catch (e) {

        }
    };

    $$.css = {
        opacity: function(num) {
            var pnum = num / 100.0;
            return 'opacity: ' + pnum + ';' +
                '-moz-opacity: ' + pnum + ';' +
                '-khtml-opacity: ' + pnum + ';' +
                '-ms-filter: progid:DXImageTransform.Microsoft.Alpha(opacity=' + num + ');' +
                'filter: alpha(opacity=' + num + ');' +
                'opacity: ' + pnum + ';';
        },
        scale: function(num) {
            return '-moz-transform: scale(' + num + ');' +
                '-ms-transform: scale(' + num + ');' +
                '-webkit-transform: scale(' + num + ');' +
                '-o-transform: scale(' + num + ');' +
                '-transform: scale(' + num + ');';
        },
        origin: function(x, y) {
            return 'transform-origin: ' + x + ' ' + y + ';' +
                '-ms-transform-origin: ' + x + ' ' + y + ';' +
                '-webkit-transform-origin: ' + x + ' ' + y + ';';
        }
    };

    $$.analyse = new function() {
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
            return "sw=" + w + "&sh=" + h + "&mx=" + x + "&my=" + y + "&i=" + iframe + "&page=" + page + "&r=" + ref;
        };
    };

    String.prototype.ucfirst = function() {
        return this.charAt(0).toUpperCase() + this.substr(1);
    };

    //@todo rewrite on jq
    (function(){
        var delay = 100; // default delay
        var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
        var observerConfig = { attributes: true, childList: true, characterData: true };
        var observer;
        var eventName = "dchange";

        // Manage event queue
        var stack = [];

        function callback() {
            for (var i = 0; i < stack.length; i++) {
                stack[i].trigger(eventName);
            }
        }

        // Naive approach for compatibility
        function naive() {
            var $last = $("*");
            var lastLen = $last.length;

            setTimeout(function check() {
                // get current state of the document
                var $current = $("*");
                var len = $current.length;

                // if the length is different
                // it's fairly obvious
                if (len != lastLen) {
                    // just make sure the loop finishes early
                    $last = [];
                }

                // go check every element in order
                for (var i = 0; i < len; i++) {
                    if ($current[i] !== $last[i]) {
                        callback();
                        $last = $current;
                        lastLen = len;
                        break;
                    }
                }

                // over, and over, and over again
                setTimeout(check, delay);

            }, delay);
        }

        //
        //  Check for mutation events support
        //
        var support = {
            DOMNodeInserted: false,
            DOMSubtreeModified: false
        };

        var el = document.documentElement;
        var remain = 3;

        // callback for the tests
        function decide() {
            if (support.DOMNodeInserted) {
                $(document).ready(function () {
                    if (support.DOMSubtreeModified) { // for FF 3+, Chrome
                        el.addEventListener('DOMSubtreeModified', callback, false);
                    } else { // for FF 2, Safari, Opera 9.6+
                        el.addEventListener('DOMNodeInserted', callback, false);
                        el.addEventListener('DOMNodeRemoved', callback, false);
                    }
                });
            } else if (document.onpropertychange) { // for IE 5.5+
                document.onpropertychange = callback;
            } else { // fallback
                naive();
            }
        }

        // checks a particular event
        function test(event) {
            el.addEventListener(event, function fn() {
                support[event] = true;
                el.removeEventListener(event, fn, false);
                remain--;

                if (remain === 0) {
                    decide();
                }

            }, false);
        }

        if (mutationObserver) {
            observer = new mutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    $(mutation.target).trigger(eventName);
                });
            });
        }
        else {
            if (window.addEventListener) {
                test('DOMSubtreeModified');
                test('DOMNodeInserted');
                test('DOMNodeRemoved');
            } else {
                decide();
            }
        }

        $.fn[eventName] = function(fn) {
            if (fn) {
                stack.push(this);

                if (observer) {
                    observer.observe(this[0], observerConfig);
                }

                return this.bind(eventName, fn);
            }

            return this.trigger(eventName)
        };
    })();
    //<-rewrite

})(tcCore);