"use strict";

/**
 * Modified from https://github.com/shaunpersad/throttled-queue to handle 
 * Google's throttle rate: no more than 5 per second OR 200 per minute
 */

(function() {

    // global on the server, window in the browser
    var previous_throttledQueue;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    if (root != null) {
        previous_throttledQueue = root.throttledQueue;
    }

    /**
     * Factory function.
     *
     * @param max_requests_per_interval
     * @param interval
     * @param evenly_spaced
     * @returns {Function}
     */
    var throttledQueue = function(max_requests_per_interval, interval, evenly_spaced) {
        var perMinuteRefill = 200;

        var timeout = null;
        var minute_timeout = null;
        var perMinuteAllotment = perMinuteRefill;

        /**
         * If all requests should be evenly spaced, adjust to suit.
         */
        if (evenly_spaced) {
            interval = interval / max_requests_per_interval;
            max_requests_per_interval = 1;
        }

        if (interval < 200) {
            console.warn('An interval of less than 200ms can create performance issues.');
        }

        var queue = [];
        var last_called = Date.now();

        /**
         * Short for "minute is up". Maybe don't use contractions in 
         * function names? Each minute, refill the per minute allotment 
         * (which is used to determine how many tasks to dequeue).
         */
        var minutesUp = function () {
            perMinuteAllotment = perMinuteRefill;

            if (queue.length > 0) {
                minute_timeout = setTimeout(minutesUp, 5000);
            }
        }

        /**
         * Gets called at a set interval to remove items from the queue.
         * This just the  self-adjusting timer part,
         * since the browser's setTimeout is highly inaccurate.
         */
        var dequeue = function() {

            var threshold = last_called + interval;
            var now = Date.now();

            /**
             * Adjust the timer if it was called too early.
             */
            if (now < threshold) {
                clearTimeout(timeout);
                timeout = setTimeout(dequeue, threshold - now);
                return;
            }
            _dequeue();
        };


        /**
         * Do the actual dequeue and call the callback.
         */
        var _dequeue = function () {
            var callbacks = queue.splice(0, Math.min(perMinuteAllotment, max_requests_per_interval));
            perMinuteAllotment -= callbacks.length;
            for (var x = 0; x < callbacks.length; x++) {
                callbacks[x]();
            }

            /**
             * Only restart the timer if there might still be things to do.
             *
             *   1. If callbacks.length > 0 then we did work this time. Start
             *      timer so we don't do more work too soon.
             *
             *   2. If queue.length > 0 then there is still work to do. Start timer.
             *
             *   3. If NEITHER, then we didn't do work this time and there is no work
             *      to do, so nothing to time.
             */
            last_called = Date.now();
            if (callbacks.length > 0 || queue.length > 0) {
                timeout = setTimeout(dequeue, interval);
                if (!minute_timeout) {
                    minute_timeout = setTimeout(minutesUp, 5000);
                }
            }
        };

        var enqueue = function (callback) {
            queue.push(callback);

            /**
             * If there is no timer currently running, do this callback now.
             */
            if (!timeout) {
                _dequeue();
            }
        }

        /**
         * Return a function that can enqueue items.
         */
        var throttle = function(callback) {
            enqueue(callback);
        };

        throttle.dispose = function () {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (minute_timeout) {
                clearTimeout(minute_timeout);
            }
        }

        return throttle;
    };

    throttledQueue.noConflict = function () {
        root.throttledQueue = previous_throttledQueue;
        return throttledQueue;
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = throttledQueue;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return throttledQueue;
        });
    }
    // included directly via <script> tag
    else {
        root.throttledQueue = throttledQueue;
    }

}).call(this);