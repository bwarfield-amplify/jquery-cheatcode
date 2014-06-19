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
        // keypad 0 is 96, other numbers follow
        KEYPAD_0 : 96,
        KEYPAD_1 : 97,
        KEYPAD_2 : 98,
        KEYPAD_3 : 99,
        KEYPAD_4 : 100,
        KEYPAD_5 : 101,
        KEYPAD_6 : 102,
        KEYPAD_7 : 103,
        KEYPAD_8 : 104,
        KEYPAD_9 : 105
        // top-row 0 is 48
        // A is 65
    };
    var ZERO_KEY_CODE = 48;
    var A_KEY_CODE = 65;
    var A_CHARACTER_CODE = "A".charCodeAt(0); // abundance of caution

    var KONAMI = [ "UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "B", "A" ];

    var TIMEOUT_MILLISECONDS = 10000;

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
                    console.log("Timed out: resetting");
                    cheatIndex = 0;
                }
            }
            if (activeCheat[cheatIndex] === e.which) {
                console.log("incrementing");
                cheatIndex++;
                lastKeydownTime = now;
            } else {
                console.log("Resetting");
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
        cheatCallback = callback;
        cheatIndex = 0;
        this.off("keydown", cheat_keydown);
        this.on("keydown", cheat_keydown);
        return this;
    };
})(jQuery);
