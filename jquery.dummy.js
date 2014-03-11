/* Copyright 2013, deviantART, Inc.
 * Licensed under 3-Clause BSD.
 * Refer to the LICENCES.txt file for details.
 * For latest version, see https://github.com/deviantART/jquery.dummy
 */
(function($) {

    var DATA_PREFIX = 'dummy'
        ,PREFIX_LENGTH = DATA_PREFIX.length
        ,VALID_ATTRS = { // static mapping for speed
             'text':        'data-' + DATA_PREFIX + '-text'
            ,'attr':        'data-' + DATA_PREFIX + '-attr'
            ,'html':        'data-' + DATA_PREFIX + '-html'
            ,'prepend':     'data-' + DATA_PREFIX + '-prepend'
            ,'append':      'data-' + DATA_PREFIX + '-append'
            ,'remove':      'data-' + DATA_PREFIX + '-remove'
            ,'addClass':    'data-' + DATA_PREFIX + '-add-class'
            ,'removeClass': 'data-' + DATA_PREFIX + '-remove-class'
            ,'toggleClass': 'data-' + DATA_PREFIX + '-toggle-class'
            ,'clone':       'data-' + DATA_PREFIX + '-clone'
            ,'plural':      'data-' + DATA_PREFIX + '-plural'
            ,'each':        'data-' + DATA_PREFIX + '-each'
        }
        ,DATA_IGNORE = [ // not returned with dummy data
             DATA_PREFIX + 'Clone'
            ,DATA_PREFIX + 'InLoop'
        ]
        ,get_dummy_data = function($node) {
            var all_data = $node.data()
                ,collected = {}
                ,key;

            for (key in all_data) {
                if (key.indexOf(DATA_PREFIX) === 0 && $.inArray(key, DATA_IGNORE) === -1) {
                    // key is changed from dummyFooBar to fooBar
                    collected[(key.charAt(PREFIX_LENGTH).toLowerCase() + key.substr(PREFIX_LENGTH + 1))] = all_data[key];
                }
            }

            return collected;
        };

    /**
     * Custom :dummy selector for finding dummy-aware nodes.
     * Can also search for a specific selector by using :dummy(attr).
     */
    $.extend($.expr[':'], {
        dummy: function(node, junk, selector) {
            if (selector && selector[3]) {
                if (!VALID_ATTRS[selector[3]]) {
                    return false;
                }
                return !!node.getAttribute(VALID_ATTRS[selector[3]]);
            }
            for (var name in VALID_ATTRS) {
                if (node.getAttribute(VALID_ATTRS[name])) {
                    return true;
                }
            }
            return false;
        }
    });

    /**
     * Plugin to apply JSON update to any dummy node.
     *
     * Given a fragment of HTML, Dummy will update the node content by using
     * the data attributes of the HTML nodes to apply changes from a JSON object.
     *
     * Example:
     *
     *   <div data-dummy-attr="id:username">
     *       <p>Hello, my name is <span data-dummy-text="username"></span>!</p>
     *       <p data-dummy-add-class="sweets:is_dessert">I love <span data-dummy-text="food"></span>.</p>
     *   </div>
     *
     * Could be updated with this JSON:
     *
     *   {"username": "anna", "food": "tacos", "is_dessert": false}
     *
     * Which would result in:
     *
     *   <div id="anna" data-dummy-attr="id:username">
     *       <p>Hello, my name is <span data-dummy-text="username">anna</span>!</p>
     *       <p data-dummy-add-class="sweets:is_dessert">I love <span data-dummy-text="food">tacos</span>.</p>
     *   </div>
     *
     * Or if updated with this JSON:
     *
     *   {"username": "billy", "food": "ice cream", "is_dessert": true}
     *
     * Which would result in:
     *
     *   <div id="billy" data-dummy-attr="id:username">
     *       <p>Hello, my name is <span data-dummy-text="username">billy</span>!</p>
     *       <p class="sweets" data-dummy-add-class="sweets:is_dessert">I love <span data-dummy-text="food">ice cream</span>.</p>
     *   </div>
     *
     * The following options are supported as data attributes:
     *
     * - text: sets text content
     * - html: sets HTML content
     * - prepend: inserts HTML at the beginning
     * - append: inserts HTML at the end
     * - plural: changes text based on a count (complex)
     * - attr: changes attributes (complex)
     * - remove: remove this node if condition fails (banged)
     * - add-class: add one or more classes (complex, banged)
     * - remove-class: remove one or more classes (complex, banged)
     * - toggle-class: toggle one or more classes (complex, banged)
     * - clone: copy the node before updating (only valid for the template node)
     * - each: loop over this node using an array of objects
     *
     * NOTE: Cloned nodes will automatically have the "id" attribute stripped.
     *       To perform additional modifications to cloned nodes, you can monkey
     *       patch the $.fn.dummyCloned method to make additional changes.
     *
     * Complex syntax is "x:key" where "x" is used for part of the update action
     * and "key" is the JSON key name. For instance, using the "attr" option could
     * be "href:userurl" to set the "href" to the value of the "userurl" key.
     *
     * NOTE: In the case of "plural", the format is "key:singular,plural".
     *       However, the plural can be left off if the word has a simple pluralized
     *       form, such as dog -> dogs or fish -> fishes.
     *
     * Banged syntax allows for a value "truthiness" check to be inverted by
     * prefixing the value with a bang (!).
     *
     * The add/remove/toggle-class and remove options will check the truthiness
     * of the JSON value before taking action. For instance, if you want show
     * different content if "winter" is true-ish:
     *
     *   <div data-dummy-add-class="cold:winter,hot:summer"><!-- class is "cold" in winter, "hot" in summer -->
     *       <div data-dummy-remove="winter">Winter is coming.</div><!-- removed in winter -->
     *       <div data-dummy-remove="!winter">You need a fire.</div><!-- removed in summer -->
     *  </div>
     *
     * Or if you do not want to set a "summer" variable as the inverse of "winter",
     * you could use a bang instead:
     *
     *   <div data-dummy-add-class="cold:winter,hot:!winter"><!-- class is "cold" in winter, "hot" in summer -->
     *
     * Looping using the "each" attribute works like this:
     *
     * <div class="user" data-dummy-each="users">
     *     <a href data-dummy-attr="href:profile" data-dummy-text="username"></a>
     *     <img src data-dummy-attr="src:avatar">
     * </div>
     *
     * Updated with this JSON:
     *
     * {"users":[
     *     {"profile": "//example.com/user/joe", "username": "joe", "avatar": "//example.com/avatar/joe.gif"},
     *     {"profile": "//example.com/user/bob", "username": "bub", "avatar": "//example.com/avatar/bob.png"},
     *     {"profile": "//example.com/user/sue", "username": "sus", "avatar": "//example.com/avatar/susie.jpg"}
     * ]}
     *
     * Would produce this HTML (dummy attributes removed for clarity):
     *
     * <div class="user">
     *     <a href="//example.com/user/joe">joe</a>
     *     <img src="//example.com/avatar/joe.gif">
     * </div>
     * <div class="user" data-dummy-each="users">
     *     <a href="//example.com/user/bob">bub</a>
     *     <img src="//example.com/avatar/bob.png">
     * </div>
     * <div class="user">
     *     <a href="//example.com/user/sue">sus</a>
     *     <img src="//example.com/avatar/susie.jpg">
     * </div>
     *
     * By using "each", lists of data can be easily rendered. Using "each" implies
     * that the initial node will be cloned to produce similar nodes.
     */
    $.fn.dummy = function(data, excludeSelf) {
        var $root = this
            ,is_each = Boolean($root.data(DATA_PREFIX + '-each') && $root.data(DATA_PREFIX + '-in-loop') >= 1);

        if ($root.data(DATA_PREFIX + '-clone') || is_each) {
            $root = this.clone().dummyCloned().insertAfter(this);
        }

        var $nodes = $root.find(':dummy').filter(function() {
            // filter out all dummy nodes that are inside of "each" blocks,
            // as they must be contextualized before the keys will match up.
            return $(this).parentsUntil($root, ':dummy(each)').length === 0;
        });

        if (excludeSelf !== true) {
            $nodes = $nodes.add($root.filter(':dummy'));
        }

        $nodes.each(function() {
            var $node = $(this)
                ,editables = get_dummy_data($node)
                ,keys
                ,key
                ,val
                ,flip;

            for (var edit in editables) {
                key = editables[edit];
                switch (edit) {
                    case 'each':
                        if (data[key] && $.isArray(data[key])) {
                            $.each(data[key], function(i, subdata) {
                                $node.data(DATA_PREFIX + '-in-loop', i).dummy(subdata, true);
                            });
                        }
                    break;
                    case 'plural':
                        keys = key.split(':');
                        key = keys[0];
                        if (typeof data[key] !== 'undefined') {
                            val = parseInt(data[key], 10);
                            keys = keys[1].split(','); // singular, plural
                            if (keys.length < 2) {
                                // plural form was omitted, create it now
                                keys.push(keys[0] + (keys[0].substr(-2) === 'sh' ? 'es' : 's'));
                            }
                            flip = (val !== 1) ? 1 : 0;
                            $node.text(keys[flip]);
                        }
                    break;
                    case 'attr':
                        keys = key.split(',');
                        for (key in keys) {
                            key = keys[key].split(':');
                            $node[edit](key[0], data[key[1]]);
                        }
                    break;
                    // the remove option acts differently than others and only
                    // makes sense when the "clone" option is enabled, as removed
                    // elements cannot be recovered later.
                    case 'remove':
                        flip = key.charAt(0) === '!';
                        val = Boolean(data[key.substr(flip ? 1 : 0)]);
                        if (flip) {
                            val = !val;
                        }
                        if (val) {
                            $node.remove();
                        }
                    break;
                    case 'addClass':
                    case 'removeClass':
                    case 'toggleClass':
                        keys = key.split(',');
                        for (key in keys) {
                            key = keys[key].split(':');
                            if (typeof key[1] !== 'undefined') {
                                flip = key[1].charAt(0) === '!';
                                val = Boolean(data[key[1].substr(flip ? 1 : 0)]);
                                if (flip) {
                                    val = !val;
                                }
                                if (edit === 'toggleClass') {
                                    $node[edit](key[0], val);
                                } else if (val) {
                                    $node[edit](key[0]);
                                }
                            } else {
                                $node[edit](key[0]);
                            }
                        }
                    break;
                    default:
                        $node[edit](data[key]);
                    break;
                }
            }
        });
        return $root;
    };
    $.fn.dummyCloned = function() {
        if (typeof this.attr('id') !== 'undefined') {
            this.removeAttr('id');
        }
        return this;
    };

})(jQuery);
