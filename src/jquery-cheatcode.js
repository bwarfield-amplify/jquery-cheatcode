/**
   jquery-cheatcode plugin

   This plugin enables the addition of "cheat codes" to any web page.  By default, it configures
   a simple alert window when the standard "Konami" code is typed, but it can support more or less
   arbitrary cheat codes (no modifier keys are currently supported) and arbitrary callbacks.
 */
(function($) {
    /*
      Constants section
     */
    var KEYCODE = {
        LEFT : 37,
        UP : 38,
        RIGHT : 39,
        DOWN : 40,
        BACKSPACE : 8,
        SPACE : 32,
        DEL : 46,
        ENTER : 13,
        // keypad 0 is 96, other numbers follow, then the operators
        KEYPAD_0 : 96,
        KEYPAD_1 : 97,
        KEYPAD_2 : 98,
        KEYPAD_3 : 99,
        KEYPAD_4 : 100,
        KEYPAD_5 : 101,
        KEYPAD_6 : 102,
        KEYPAD_7 : 103,
        KEYPAD_8 : 104,
        KEYPAD_9 : 105,
        KEYPAD_MULTIPLY : 106,
        KEYPAD_ADD      : 107,
        KEYPAD_SUBTRACT : 109,
        KEYPAD_DIVIDE   : 111,
        KEYPAD_POINT    : 110,
        // annoying special cases:
        ';' : 186,
        '=' : 187,
        ',' : 188,
        '-' : 189,
        '.' : 190,
        '/' : 191,
        '`' : 192,
        '[' : 219,
        '\\': 220,
        ']' : 221,
        "'" : 222

    };
    // top-row 0 is 48, A is 65, use those as offsets
    var ZERO_KEY_CODE = 48;
    var A_KEY_CODE = 65;
    var A_CHARACTER_CODE = "A".charCodeAt(0); // abundance of caution

    var KONAMI = [ "UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "B", "A" ];

    var TIMEOUT_MILLISECONDS = 10000;
    var DEBUG = false;

    var COMMAND_DISPATCH = {
        "debug" : function(flag) {
            if (undefined !== flag) { DEBUG = flag; }
            else { DEBUG = !DEBUG; }
        },
        "timeout" : function(timeoutmillis) {
            if (0 < timeoutmillis) { TIMEOUT_MILLISECONDS = timeoutmillis; }
            else { TIMEOUT_MILLISECONDS = 10000; }
        },
    };
    function debug() {
        if (DEBUG && console && console.log) {
            console.log.apply(console, arguments);
        }
    }
    function demo_callback(e) {
        alert("Cheat code invoked!");
    }

    function toKeyCode(userKeyList) {
        if (Array !== userKeyList.constructor) {
            throw "Argument to userKeyList should be array, was " + userKeyList;
        }
        var keyCodeList = [];
        for (var i = 0; i < userKeyList.length; i++) {
            var userKey = userKeyList[i];
            if (null === userKey || undefined === userKey) {
                throw "Can't handle " + userKey + " as a key value";
            }
            var translated;
            switch (userKey.constructor) {
            case Number:
                if (0 > userKey || 10 <= userKey) {
                    throw "Numbers must be between 0 and 9 inclusive"; // unless your keyboard has a "13" key...
                }
                translated = ZERO_KEY_CODE + Math.floor(userKey);
                break;
            case String:
                translated = KEYCODE[userKey];
                if (undefined !== translated) {
                    break;
                }
                if (1 !== userKey.length) {
                    throw "Strings must be single-character, not " + userKey;
                }
                // it is not clear that this is beneficial
                var charOffset = userKey.toUpperCase().charCodeAt(0) - A_CHARACTER_CODE;
                translated = A_KEY_CODE + charOffset;
                break;
            default:
                throw "Only numbers and strings are acceptable key values, not " + userKey;
            }
            keyCodeList.push(translated);
        }
        return keyCodeList;
    }

    /* closed-over variables */
    var activeCheat;
    var cheatIndex;
    var cheatCallback;
    var lastKeydownTime;

    /* keydown handler */
    function cheat_keydown(e) {
        if (undefined !== activeCheat) {
            var now = new Date().getTime();
            if (0 !== cheatIndex) {
                if (now - lastKeydownTime >= TIMEOUT_MILLISECONDS) {
                    debug("Timed out: resetting");
                    cheatIndex = 0;
                }
            }
            if (activeCheat[cheatIndex] === e.which) {
                debug("incrementing");
                cheatIndex++;
                lastKeydownTime = now;
            } else {
                debug("Resetting", e.which );
                cheatIndex = 0;
            }
            if (activeCheat.length === cheatIndex) {
                cheatCallback(e);
            }
        }
        return true;
    }

    $.fn.cheatcode = function(codeOrCallback, callbackOrNothing){
        var userCode;
        var callback;
        if (undefined !== codeOrCallback) {
            switch(codeOrCallback.constructor) {
            // STRINGS ARE SPECIAL in that they are commands: no processing after the dispatch step
            case String:
                var command = COMMAND_DISPATCH[codeOrCallback];
                if (undefined === command) {
                    throw "Unknown command " + command;
                } else {
                    command(callbackOrNothing);
                }
                return this;
            case Function:
                callback = codeOrCallback;
                break;
            case Array:
                userCode = codeOrCallback;
                if (undefined !== callbackOrNothing && Function === callbackOrNothing.constructor) {
                    callback = callbackOrNothing;
                }
                break;
            default:
                throw "I have no idea what you want me to do here";
            }
        }
        if (undefined === userCode) {
            userCode = KONAMI;
        }
        if (undefined === callback) {
            callback = demo_callback;
        }

        activeCheat = toKeyCode(userCode);
        debug(activeCheat);
        cheatCallback = callback;
        cheatIndex = 0;
        // easier to take it off and put it on again than to check if it's on already:
        this.off("keydown", cheat_keydown);
        this.on("keydown", cheat_keydown);
        return this;
    };
})(jQuery);
