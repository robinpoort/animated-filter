/* Animated filter */
(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define([], function () {
            return factory(root);
        });
    } else if ( typeof exports === 'object' ) {
        module.exports = factory(root);
    } else {
        root.animatedFilter = factory(root);
    }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

    'use strict';


    // Feature Test

    var supports = 'querySelector' in document && 'addEventListener' in window;


    // Shared Variables

    var defaults = {
        list: '[data-filter-list]',
        filter: '[data-filter]',
        types: '[data-filter-types]',
        type: '[data-filter-type]',
        activeClass: 'is-active',
        animationDuration: 400,
        onAfterAnimate: function() {}
    };


    // Polyfills

    /**
     * Element.matches() polyfill (simple version)
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
     */
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }


    /**
     * Element.closest() polyfill
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
     */
    if (!Element.prototype.closest) {
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
        }
        Element.prototype.closest = function (s) {
            var el = this;
            var ancestor = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (ancestor.matches(s)) return ancestor;
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return null;
        };
    }


    // Shared Methods


    // Foreach

    var forEach = function(collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === "[object Object]") {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };


    // Extend

    var extend = function () {

        // Variables
        var extended = {};
        var deep = false;
        var i = 0;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    // If property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (; i < arguments.length; i++) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };


    // Animation

    var Animation = function (options) {

        // Unique Variables

        var publicAPIs = {};
        var settings;

        // Unique methods

        var setActiveItem = function(target, settings) {
            target.closest(settings.list).getElementsByClassName(settings.activeClass)[0].classList.remove(settings.activeClass);
            target.classList.add(settings.activeClass);
        };

        /**
         * Animate filter
         */
        publicAPIs.animateFilter = function (event, options) {

            // Local settings
            var localSettings = extend(settings || defaults, options || {}); // Merge user options with defaults

            // Return if target is not a filter
            if (!event.target.matches(localSettings.filter)) return;

            // Prevent default action
            event.preventDefault();

            // Set active item
            setActiveItem(event.target, localSettings);

            // Variables
            var items = document.getElementById(event.target.closest('ul').getAttribute('data-filter-for')) || document.querySelector(localSettings.types),
                item = items.querySelectorAll(localSettings.type),
                noitems = items.querySelector('[data-filter-type="none"]'),
                filter = event.target.getAttribute("data-filter"),
                visible = items.querySelectorAll('[data-filter-type]:not(.is-hidden)'),
                list = [],
                invisibleList = [];

            // Get filter list
            if (filter == 'all') {
                forEach(item, function (value, prop) {
                    if (item[prop] !== noitems) {
                        list.push(item[prop]);
                    } else {
                        invisibleList.push(item[prop]);
                    }
                });
            } else {
                forEach(item, function (value, prop) {
                    var types = item[prop].getAttribute("data-filter-type").split(',');
                    if (types.indexOf(filter) >= 0) {
                        list.push(item[prop]);
                    } else {
                        invisibleList.push(item[prop]);
                    }
                });
            }

            // Add noitems item as visible item
            if (list.length === 0) {
                list.push(noitems);
                invisibleList.splice(invisibleList.indexOf(noitems), 1);
                filter = 'none';
            }

            // Set default positions
            for (var i = 0; i < item.length; i++) {
                if (!item[i].hasAttribute('data-position')) {
                    item[i].setAttribute('data-position', i);
                }
            }

            // Get original position for all current visible items
            forEach(visible, function (value, prop) {
                visible[prop].setAttribute("data-original-top", visible[prop].offsetTop);
                visible[prop].setAttribute("data-original-left", visible[prop].offsetLeft);
            });

            // Reset height for items
            items.style.height = 'auto';

            // Get current items height
            var currentItemsHeight = items.offsetHeight || items.clientHeight;

            // New order display
            forEach(list, function (value, prop) {
                list[prop].style.display = "block";
                list[prop].classList.remove('is-hidden');
                list[prop].classList.add('is-list-item');
            });
            forEach(invisibleList, function (value, prop) {
                invisibleList[prop].style.display = "none";
            });

            // Get new items height
            var itemsHeight = items.offsetHeight || items.clientHeight;

            // Put items in new order
            forEach(list.reverse(), function (value, prop) {
                items.insertBefore(list[prop], items.firstChild);
            });

            // Get new position for all filtered items
            forEach(list, function (value, prop) {
                list[prop].setAttribute("data-top", list[prop].offsetTop);
                list[prop].setAttribute("data-left", list[prop].offsetLeft);
            });

            // Set previous items height
            items.style.height = currentItemsHeight + 'px';

            // Display all hidden previously visible items again so all items are visible
            forEach(visible, function (value, prop) {
                visible[prop].style.display = "block";
            });

            // New list for currently visible items
            var currentlyVisible = items.querySelectorAll('[data-filter-type]:not([style*="display: none"])');

            // Add transition class and get current position in the list
            forEach(currentlyVisible, function (value, prop) {
                currentlyVisible[prop].classList.add('transition');
                currentlyVisible[prop].setAttribute("data-top-current", currentlyVisible[prop].offsetTop);
                currentlyVisible[prop].setAttribute("data-left-current", currentlyVisible[prop].offsetLeft);
            });

            // Set top/left position for visible items
            forEach(currentlyVisible, function (value, prop) {

                var originalTop = parseInt(currentlyVisible[prop].getAttribute("data-original-top"), 10),
                    nowTop = parseInt(currentlyVisible[prop].getAttribute("data-top"), 10) || 0,
                    currentTop = parseInt(currentlyVisible[prop].getAttribute("data-top-current"), 10) || false,
                    originalLeft = parseInt(currentlyVisible[prop].getAttribute("data-original-left"), 10),
                    nowLeft = parseInt(currentlyVisible[prop].getAttribute("data-left"), 10) || 0,
                    currentLeft = parseInt(currentlyVisible[prop].getAttribute("data-left-current"), 10) || false,
                    newTop,
                    newLeft;

                // Calculate new top position
                if (!isNaN(originalTop)) {
                    newTop = originalTop - currentTop;
                } else {
                    newTop = nowTop - currentTop;
                }

                // Calculate new left position
                if (!isNaN(originalLeft)) {
                    newLeft = originalLeft - currentLeft;
                } else {
                    newLeft = nowLeft - currentLeft;
                }

                // Set top/left positions
                currentlyVisible[prop].style.top = newTop+"px";
                currentlyVisible[prop].style.left = newLeft+"px";

            });


            // Animate items (Using CSS transitions)
            // Run a frame later so we know the transition will run on changed display items
            setTimeout(function() {

                // Set items height
                items.style.height = itemsHeight + 'px';

                forEach(currentlyVisible, function (value, prop) {
                    if (currentlyVisible[prop].classList.contains('is-list-item')) {
                        currentlyVisible[prop].classList.remove("is-hiding");
                    } else {
                        currentlyVisible[prop].classList.add("is-hiding");
                    }
                });

                forEach(visible, function (value, prop) {
                    // Vars
                    var negateTop = parseInt(visible[prop].style.top,10) * -1 || 0;
                    var negateLeft = parseInt(visible[prop].style.left,10) * -1 || 0;

                    if (visible[prop].classList.contains('is-list-item')) {
                        visible[prop].style.transform = "translate(" + negateLeft + "px, " + negateTop + "px)";
                    }
                });

            }, 16);

            // Remove all styling, attributes and set hidden class when animations are done
            setTimeout(function() {
                forEach(item, function (value, prop) {
                    item[prop].classList.remove('transition');
                    item[prop].removeAttribute('style');
                    item[prop].removeAttribute("data-top");
                    item[prop].removeAttribute("data-original-top");
                    item[prop].removeAttribute("data-top-current");
                    item[prop].removeAttribute("data-left");
                    item[prop].removeAttribute("data-original-left");
                    item[prop].removeAttribute("data-left-current");
                    if (!item[prop].classList.contains('is-list-item')) {
                        item[prop].classList.add('is-hidden');
                    } else {
                        item[prop].classList.remove('is-list-item');
                    }
                });
                items.removeAttribute("style");

                // Reset items in original order
                forEach(item, function (value, prop) {
                    items.appendChild(item[prop]);
                });

                localSettings.onAfterAnimate();

            }, localSettings.animationDuration);

        };


        /**
         * Init
         */
        publicAPIs.init = function (options) {

            // feature test
            if (!supports) return;

            // Merge options into defaults
            settings = extend(defaults, options || {});

            // Add eventlistener
            document.addEventListener('click', function(event) {
                publicAPIs.animateFilter(event, options);
            }, false);

        };

        // Initialize the plugin
        publicAPIs.init(options);

        // Return the public APIs
        return publicAPIs;

    };


    //
    // Return the constructor
    //

    return Animation;

});
