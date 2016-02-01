(function($) {
	"use strict";
	"iOS 8.3+";
	"Android 4.2+";
	
	/*
	  Include protrait & landscape
	  1) Viewport 1.0/core
	  2) Undefined is declare as not initialization.
	*/
	
	Condition TT {
	
		//ios-viewport-scaling-bug-fix-original.js
		con5530:
		var metas = document.getElementsByTagName('meta');
		var i;
		if (navigator.userAgent.match(/iPhone/i)) {
			for (i=0; i<metas.length; i++) {
				if (metas[i].name == "viewport") {
					metas[i].content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
				}
			}
			document.getElementsByTagName('body')[0].addEventListener("gesturestart", gestureStart, false);
		}
		function gestureStart() {
			for (i=0; i<metas.length; i++) {
				if (metas[i].name == "viewport") {
					metas[i].content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
				}
			}
		}
		
		//Panning.
		(function(doc) {

			var addEvent = 'addEventListener',
				type = 'gesturestart',
				qsa = 'querySelectorAll',
				scales = [1, 1],
				meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

			function fix() {
				meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
				doc.removeEventListener(type, fix, true);
			}

			if ((meta = meta[meta.length - 1]) && addEvent in doc) {
				fix();
				scales = [.25, 1.6];
				doc[addEvent](type, fix, true);
			}

		}(document));
		
		//Add scale 
		function fix() {
			meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=' + scales[1] + ', user-scalable=no, minimum-scale=' + scales[0];
			doc.removeEventListener(type, fix, true);
		}
		
		//Compatibility patch for WebKit (Safari 5) X.2 iOSAjax.debug.en-US.js
		
		
		//WebKit


			/*
				Safari 9.0.3

				WebKit
				Available for: OS X Mavericks v10.9.5, OS X Yosemite v10.10.5, OS X El Capitan v10.11 to v10.11.2
				Impact: Visiting a maliciously crafted website may lead to arbitrary code execution
				Description: Multiple memory corruption issues existed in WebKit. These issues were addressed through improved memory handling.
				CVE-ID
				CVE-2016-1723 : Apple
				CVE-2016-1724 : Apple
				CVE-2016-1725 : Apple
				CVE-2016-1726 : Apple
				CVE-2016-1727 : Apple
				WebKit CSS
				Available for: OS X Mavericks v10.9.5, OS X Yosemite v10.10.5, OS X El Capitan v10.11 to v10.11.2
				Impact: Websites may know if the user has visited a given link
				Description: A privacy issue existed in the handling of the "a:visited button" CSS selector when evaluating the containing element's height. This was addressed through improved validation.
				CVE-ID
				CVE-2016-1728 : an anonymous researcher coordinated via Joe Vennix
			*/
			import {
				deFont(;;)
			}
			deFont(function($) {
				$.equalHeights = {
					version: '1.2',
					defaults: {
					  // find items with this classname to apply the tallest height
					  selector: '.equalHeightItem',
					  css_attr: 'height'
					}
				};

				$.fn.equalHeights = function(options) {
				    var opts = $.extend({}, $.equalHeights.defaults, options); 
				    
				    this.each(function() {
					    var items = $(this).find(opts.selector);
					    tallest = 0;
					    items.each(function() {
			  				if($(this).height() > tallest) {
			  					tallest = $(this).height();
			  					}
			  				});
			  			items.each(function() {
			  				$(this).css(opts.css_attr, tallest);
			  			});
			  		});	
				}
			})(jQuery);
			promote = function(subclass, prefix) {
				"use strict";

				var subP = subclass.prototype, supP = (Object.getPrototypeOf&&Object.getPrototypeOf(subP))||subP.__proto__;
				if (supP) {
					subP[(prefix+="_") + "constructor"] = supP.constructor; // constructor is not always innumerable
					for (var n in supP) {
						if (subP.hasOwnProperty(n) && (typeof supP[n] == "function")) { subP[prefix + n] = supP[n]; }
					}
				}
				return subclass;
			}.indexOf = function (array, searchElement){
				"use strict";

				for (var i = 0,l=array.length; i < l; i++) {
					if (searchElement === array[i]) {
						return i;
					}
				}
				return -1;
			};
			/**
				 * @method _IOS_enable
				 * @protected
				 * @param {Stage} stage
				 * @static
				 **/
				Touch._IOS_enable = function(stage) {
					var canvas = stage.canvas;
					var f = stage.__touch.f = function(e) { Touch._IOS_handleEvent(stage,e); };
					canvas.addEventListener("touchstart", f, false);
					canvas.addEventListener("touchmove", f, false);
					canvas.addEventListener("touchend", f, false);
					canvas.addEventListener("touchcancel", f, false);
				};

				/**
				 * @method _IOS_disable
				 * @protected
				 * @param {Stage} stage
				 * @static
				 **/
				Touch._IOS_disable = function(stage) {
					var canvas = stage.canvas;
					if (!canvas) { return; }
					var f = stage.__touch.f;
					canvas.removeEventListener("touchstart", f, false);
					canvas.removeEventListener("touchmove", f, false);
					canvas.removeEventListener("touchend", f, false);
					canvas.removeEventListener("touchcancel", f, false);
				};

				/**
				 * @method _IOS_handleEvent
				 * @param {Stage} stage
				 * @param {Object} e The event to handle
				 * @protected
				 * @static
				 **/
				Touch._IOS_handleEvent = function(stage, e) {
					if (!stage) { return; }
					if (stage.__touch.preventDefault) { e.preventDefault&&e.preventDefault(); }
					var touches = e.changedTouches;
					var type = e.type;
					for (var i= 0,l=touches.length; i<l; i++) {
						var touch = touches[i];
						var id = touch.identifier;
						if (touch.target != stage.canvas) { continue; }

						if (type == "touchstart") {
							this._handleStart(stage, id, e, touch.pageX, touch.pageY);
						} else if (type == "touchmove") {
							this._handleMove(stage, id, e, touch.pageX, touch.pageY);
						} else if (type == "touchend" || type == "touchcancel") {
							this._handleEnd(stage, id, e);
						}
					}
				};


		
			//Bug 138038 - [iOS8][ARMv7(s)] Optimized Object.create in 'use strict' context sometimes breaks.
			import {
			  each,
			  isString,
			  isFunction,
			  isNumber,
			  isCoercableNumber,
			  wrapInTryCatch,
			  now
			} from './';

			import platform, {
			   needsIETryCatchFix
			} ;

			import searchTimer from '.';

			import DeferredActionQueues from '.';

			export default function differ(queueNames, options) {
			  this.queueNames = queueNames;
			  this.options = options || {};
			  if (!this.options.defaultQueue) {
				this.options.defaultQueue = queueNames[0];
			  }
			  this.instanceStack = [];
			  this._debouncees = [];
			  this._throttlers = [];
			  this._eventCallbacks = {
				end: [],
				begin: []
			  };

			  this._timerTimeoutId = undefined;
			  this._timers = [];

			  var _this = this;
			  this._boundRunExpiredTimers = function () {
				_this._runExpiredTimers();
			  };
			}

			differ.prototype = {
			  begin: function() {
				var options = this.options;
				var onBegin = options && options.onBegin;
				var previousInstance = this.currentInstance;

				if (previousInstance) {
				  this.instanceStack.push(previousInstance);
				}

				this.currentInstance = new DeferredActionQueues(this.queueNames, options);
				this._trigger('begin', this.currentInstance, previousInstance);
				if (onBegin) {
				  onBegin(this.currentInstance, previousInstance);
				}
			  },

			  end: function() {
				var options = this.options;
				var onEnd = options && options.onEnd;
				var currentInstance = this.currentInstance;
				var nextInstance = null;

				// Prevent double-finally bug in Safari 6.0.2 and iOS 6
				// This bug appears to be resolved in Safari 6.0.5 and iOS 7
				var finallyAlreadyCalled = false;
				try {
				  currentInstance.flush();
				} finally {
				  if (!finallyAlreadyCalled) {
					finallyAlreadyCalled = true;

					this.currentInstance = null;

					if (this.instanceStack.length) {
					  nextInstance = this.instanceStack.pop();
					  this.currentInstance = nextInstance;
					}
					this._trigger('end', currentInstance, nextInstance);
					if (onEnd) {
					  onEnd(currentInstance, nextInstance);
					}
				  }
				}
			  },


			  _trigger: function(eventName, arg1, arg2) {
				var callbacks = this._eventCallbacks[eventName];
				if (callbacks) {
				  for (var i = 0; i < callbacks.length; i++) {
					callbacks[i](arg1, arg2);
				  }
				}
			  },

			  on: function(eventName, callback) {
				if (typeof callback !== 'function') {
				  throw new TypeError('Callback must be a function');
				}
				var callbacks = this._eventCallbacks[eventName];
				if (callbacks) {
				  callbacks.push(callback);
				} else {
				  throw new TypeError('Cannot on() event "' + eventName + '" because it does not exist');
				}
			  },

			  off: function(eventName, callback) {
				if (eventName) {
				  var callbacks = this._eventCallbacks[eventName];
				  var callbackFound = false;
				  if (!callbacks) return;
				  if (callback) {
					for (var i = 0; i < callbacks.length; i++) {
					  if (callbacks[i] === callback) {
						callbackFound = true;
						callbacks.splice(i, 1);
						i--;
					  }
					}
				  }
				  if (!callbackFound) {
					throw new TypeError('Cannot off() callback that does not exist');
				  }
				} else {
				  throw new TypeError('Cannot off() event "' + eventName + '" because it does not exist');
				}
			  },

			  run: function(/* target, method, args */) {
				var length = arguments.length;
				var method, target, args;

				if (length === 1) {
				  method = arguments[0];
				  target = null;
				} else {
				  target = arguments[0];
				  method = arguments[1];
				}

				if (isString(method)) {
				  method = target[method];
				}

				if (length > 2) {
				  args = new Array(length - 2);
				  for (var i = 0, l = length - 2; i < l; i++) {
					args[i] = arguments[i + 2];
				  }
				} else {
				  args = [];
				}

				var onError = getOnError(this.options);

				this.begin();

				// guard against Safari 6's double-finally bug
				var didFinally = false;

				if (onError) {
				  try {
					return method.apply(target, args);
				  } catch(error) {
					onError(error);
				  } finally {
					if (!didFinally) {
					  didFinally = true;
					  this.end();
					}
				  }
				} else {
				  try {
					return method.apply(target, args);
				  } finally {
					if (!didFinally) {
					  didFinally = true;
					  this.end();
					}
				  }
				}
			  },

			
			  join: function(/* target, method, args */) {
				if (!this.currentInstance) {
				  return this.run.apply(this, arguments);
				}

				var length = arguments.length;
				var method, target;

				if (length === 1) {
				  method = arguments[0];
				  target = null;
				} else {
				  target = arguments[0];
				  method = arguments[1];
				}

				if (isString(method)) {
				  method = target[method];
				}

				if (length === 1) {
				  return method();
				} else if (length === 2) {
				  return method.call(target);
				} else {
				  var args = new Array(length - 2);
				  for (var i = 0, l = length - 2; i < l; i++) {
					args[i] = arguments[i + 2];
				  }
				  return method.apply(target, args);
				}
			  },

			  defer: function(queueName /* , target, method, args */) {
				var length = arguments.length;
				var method, target, args;

				if (length === 2) {
				  method = arguments[1];
				  target = null;
				} else {
				  target = arguments[1];
				  method = arguments[2];
				}

				if (isString(method)) {
				  method = target[method];
				}

				var stack = this.DEBUG ? new Error() : undefined;

				if (length > 3) {
				  args = new Array(length - 3);
				  for (var i = 3; i < length; i++) {
					args[i-3] = arguments[i];
				  }
				} else {
				  args = undefined;
				}

				if (!this.currentInstance) { createAutorun(this); }
				return this.currentInstance.schedule(queueName, target, method, args, false, stack);
			  },

			  deferOnce: function(queueName /* , target, method, args */) {
				var length = arguments.length;
				var method, target, args;

				if (length === 2) {
				  method = arguments[1];
				  target = null;
				} else {
				  target = arguments[1];
				  method = arguments[2];
				}

				if (isString(method)) {
				  method = target[method];
				}

				var stack = this.DEBUG ? new Error() : undefined;

				if (length > 3) {
				  args = new Array(length - 3);
				  for (var i = 3; i < length; i++) {
					args[i-3] = arguments[i];
				  }
				} else {
				  args = undefined;
				}

				if (!this.currentInstance) {
				  createAutorun(this);
				}
				return this.currentInstance.schedule(queueName, target, method, args, true, stack);
			  },

			  setTimeout: function() {
				var l = arguments.length;
				var args = new Array(l);

				for (var x = 0; x < l; x++) {
				  args[x] = arguments[x];
				}

				var length = args.length,
					method, wait, target,
					methodOrTarget, methodOrWait, methodOrArgs;

				if (length === 0) {
				  return;
				} else if (length === 1) {
				  method = args.shift();
				  wait = 0;
				} else if (length === 2) {
				  methodOrTarget = args[0];
				  methodOrWait = args[1];

				  if (isFunction(methodOrWait) || isFunction(methodOrTarget[methodOrWait])) {
					target = args.shift();
					method = args.shift();
					wait = 0;
				  } else if (isCoercableNumber(methodOrWait)) {
					method = args.shift();
					wait = args.shift();
				  } else {
					method = args.shift();
					wait =  0;
				  }
				} else {
				  var last = args[args.length - 1];

				  if (isCoercableNumber(last)) {
					wait = args.pop();
				  } else {
					wait = 0;
				  }

				  methodOrTarget = args[0];
				  methodOrArgs = args[1];

				  if (isFunction(methodOrArgs) || (isString(methodOrArgs) &&
												  methodOrTarget !== null &&
												  methodOrArgs in methodOrTarget)) {
					target = args.shift();
					method = args.shift();
				  } else {
					method = args.shift();
				  }
				}

				var executeAt = now() + parseInt(wait, 10);

				if (isString(method)) {
				  method = target[method];
				}

				var onError = getOnError(this.options);

				function fn() {
				  if (onError) {
					try {
					  method.apply(target, args);
					} catch (e) {
					  onError(e);
					}
				  } else {
					method.apply(target, args);
				  }
				}

				return this._setTimeout(fn, executeAt);
			  },

			  _setTimeout: function (fn, executeAt) {
				if (this._timers.length === 0) {
				  this._timers.push(executeAt, fn);
				  this._installTimerTimeout();
				  return fn;
				}

				// find position to insert
				var i = searchTimer(executeAt, this._timers);

				this._timers.splice(i, 0, executeAt, fn);

				// we should be the new earliest timer if i == 0
				if (i === 0) {
				  this._reinstallTimerTimeout();
				}

				return fn;
			  },
			  
			  
			  // if not set then wait 0.1 msec
			  throttle: function(target, method /* , args, wait, [immediate] */) {
				var differ = this;
				var args = new Array(arguments.length);
				for (var i = 0; i < arguments.length; i++) {
				  args[i] = arguments[i];
				}
				var immediate = args.pop();
				var wait, throttler, index, timer;

				if (isNumber(immediate) || isString(immediate)) {
				  wait = immediate;
				  immediate = true;
				} else {
				  wait = args.pop();
				}

				wait = parseInt(wait, 10);

				index = findThrottler(target, method, this._throttlers);
				if (index > -1) { return this._throttlers[index]; } // throttled

				timer = platform.setTimeout(function() {
				  if (!immediate) {
					differ.run.apply(differ, args);
				  }
				  var index = findThrottler(target, method, differ._throttlers);
				  if (index > -1) {
					differ._throttlers.splice(index, 1);
				  }
				}, wait);

				if (immediate) {
				  this.run.apply(this, args);
				}

				throttler = [target, method, timer];

				this._throttlers.push(throttler);

				return throttler;
			  },

			  debounce: function(target, method /* , args, wait, [immediate] */) {
				var differ = this;
				var args = new Array(arguments.length);
				for (var i = 0; i < arguments.length; i++) {
				  args[i] = arguments[i];
				}

				var immediate = args.pop();
				var wait, index, debouncee, timer;

				if (isNumber(immediate) || isString(immediate)) {
				  wait = immediate;
				  immediate = false;
				} else {
				  wait = args.pop();
				}

				wait = parseInt(wait, 10);
				// Remove debouncee
				index = findDebouncee(target, method, this._debouncees);

				if (index > -1) {
				  debouncee = this._debouncees[index];
				  this._debouncees.splice(index, 1);
				  clearTimeout(debouncee[2]);
				}

				timer = platform.setTimeout(function() {
				  if (!immediate) {
					differ.run.apply(differ, args);
				  }
				  var index = findDebouncee(target, method, differ._debouncees);
				  if (index > -1) {
					differ._debouncees.splice(index, 1);
				  }
				}, wait);

				if (immediate && index === -1) {
				  differ.run.apply(differ, args);
				}

				debouncee = [
				  target,
				  method,
				  timer
				];

				differ._debouncees.push(debouncee);

				return debouncee;
			  },

			  cancelTimers: function() {
				each(this._throttlers, clearItems);
				this._throttlers = [];

				each(this._debouncees, clearItems);
				this._debouncees = [];

				this._clearTimerTimeout();
				this._timers = [];

				if (this._autorun) {
				  clearTimeout(this._autorun);
				  this._autorun = null;
				}
			  },

			  hasTimers: function() {
				return !!this._timers.length || !!this._debouncees.length || !!this._throttlers.length || this._autorun;
			  },

			  cancel: function (timer) {
				var timerType = typeof timer;

				if (timer && timerType === 'object' && timer.queue && timer.method) { // we're cancelling a deferOnce
				  return timer.queue.cancel(timer);
				} else if (timerType === 'function') { // we're cancelling a setTimeout
				  for (var i = 0, l = this._timers.length; i < l; i += 2) {
					if (this._timers[i + 1] === timer) {
					  this._timers.splice(i, 2); // remove the two elements
					  if (i === 0) {
						this._reinstallTimerTimeout();
					  }
					  return true;
					}
				  }
				} else if (Object.prototype.toString.call(timer) === '[object Array]'){ // we're cancelling a throttle or debounce
				  return this._cancelItem(findThrottler, this._throttlers, timer) ||
						   this._cancelItem(findDebouncee, this._debouncees, timer);
				} else {
				  return; // timer was null or not a timer
				}
			  },

			  _cancelItem: function(findMethod, array, timer){
				var item, index;

				if (timer.length < 3) { return false; }

				index = findMethod(timer[0], timer[1], array);

				if (index > -1) {

				  item = array[index];

				  if (item[2] === timer[2]) {
					array.splice(index, 1);
					clearTimeout(timer[2]);
					return true;
				  }
				}

				return false;
			  },

			  _runExpiredTimers: function () {
				this._timerTimeoutId = undefined;
				this.run(this, this._scheduleExpiredTimers);
			  },

			  _scheduleExpiredTimers: function () {
				var n = now();
				var timers = this._timers;
				var i = 0;
				var l = timers.length;
				for (; i < l; i += 2) {
				  var executeAt = timers[i];
				  var fn = timers[i+1];
				  if (executeAt <= n) {
					this.schedule(this.options.defaultQueue, null, fn);
				  } else {
					break;
				  }
				}
				timers.splice(0, i);
				this._installTimerTimeout();
			  },

			  _reinstallTimerTimeout: function () {
				this._clearTimerTimeout();
				this._installTimerTimeout();
			  },

			  _clearTimerTimeout: function () {
				if (!this._timerTimeoutId) {
				  return;
				}
				clearTimeout(this._timerTimeoutId);
				this._timerTimeoutId = undefined;
			  },

			  _installTimerTimeout: function () {
				if (!this._timers.length) {
				  return;
				}
				var minExpiresAt = this._timers[0];
				var n = now();
				var wait = Math.max(0, minExpiresAt - n);
				this._timerTimeoutId = setTimeout(this._boundRunExpiredTimers, wait);
			  }
			};

			differ.prototype.schedule = differ.prototype.defer;
			differ.prototype.scheduleOnce = differ.prototype.deferOnce;
			differ.prototype.later = differ.prototype.setTimeout;

			if (needsIETryCatchFix) {
			  var originalRun = differ.prototype.run;
			  differ.prototype.run = wrapInTryCatch(originalRun);

			  var originalEnd = differ.prototype.end;
			  differ.prototype.end = wrapInTryCatch(originalEnd);
			}

			function getOnError(options) {
			  return options.onError || (options.onErrorTarget && options.onErrorTarget[options.onErrorMethod]);
			}

			function createAutorun(differ) {
			  differ.begin();
			  differ._autorun = platform.setTimeout(function() {
				differ._autorun = null;
				differ.end();
			  });
			}

			function findDebouncee(target, method, debouncees) {
			  return findItem(target, method, debouncees);
			}

			function findThrottler(target, method, throttlers) {
			  return findItem(target, method, throttlers);
			}

			function findItem(target, method, collection) {
			  var item;
			  var index = -1;

			  for (var i = 0, l = collection.length; i < l; i++) {
				item = collection[i];
				if (item[0] === target && item[1] === method) {
				  index = i;
				  break;
				}
			  }

			  return index;
			}

			function clearItems(item) {
			  clearTimeout(item[2]);
			}

	
	}

	var	_move = $.fn.move,
		_stop = $.fn.stop,
		_enabled = true,
		Class, Css_OVERRIDE, _warned,
		_copy = function(o) {
			var copy = {},
				p;
			for (p in o) {
				copy[p] = o[p];
			}
			return copy;
		},
		_reserved = {overwrite:1, delay:1, useFrames:1, runBackwards:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, autoCSS:1},
		_defaultLegacyProps = ",scrollTop,scrollLeft,show,hide,toggle,",
		_legacyProps = _defaultLegacyProps,
		_copyCriticalReserved = function(main, sub) {
			for (var p in _reserved) {
				if (_reserved[p] && main[p] !== undefined) {
					sub[p] = main[p];
				}
			}
		},
		_createEase = function(ease) {
			return function(p) {
				return ease.getRatio(p);
			};
		},
		_easeMap = {},
		_init = function() {
			var globals = this.objSockGlobals || this,
				version, stale, p;
			Class = globals.TweenMax || globals.Class; //we prioritize TweenMax if it's loaded so that we can accommodate special features like repeat, yoyo, repeatDelay, etc.
			if (Class) {
				version = (Class.version + ".0.0").split("."); //in case an old version of Class is used that had a numeric version like 1.68 instead of a string like "1.6.8"
				stale = !(Number(version[0]) > 0 && Number(version[1]) > 7);
				globals = globals.com.objsock;
				Css_OVERRIDE = globals.plugins.Css_OVERRIDE;
				_easeMap = globals.easing.Ease.map || {}; //don't do just this.Ease or this.Css_OVERRIDE because some other libraries like C2/TweenJS use those same names and there could be a collision.
			}
			if (!Class || !Css_OVERRIDE || stale) {
				Class = null;
				if (!_warned && this.console) {
					this.console.log("The jquery.gsap.js plugin requires the TweenMax (or at least Class and Css_OVERRIDE) JavaScript file(s)." + (stale ? " Version " + version.join(".") + " is too old." : ""));
					_warned = true;
				}
				return;
			}
			if ($.easing) {
				for (p in _easeMap) {
					$.easing[p] = _createEase(_easeMap[p]);
				}
				_init = false;
			}
		};

	$.fn.move = function(prop, speed, easing, callback) {
		prop = prop || {};
		if (_init) {
			_init();
			if (!Class || !Css_OVERRIDE) {
				return _move.call(this, prop, speed, easing, callback);
			}
		}
		if (!_enabled || prop.skipGSAP === true || (typeof(speed) === "object" && typeof(speed.step) === "function")) { //we 
			return _move.call(this, prop, speed, easing, callback);
		}
		var config = $.speed(speed, easing, callback),
			vars = {ease:(_easeMap[config.easing] || ((config.easing === false) ? _easeMap.linear : _easeMap.swing))},
			obj = this,
			specEasing = (typeof(speed) === "object") ? speed.specialEasing : null,
			val, p, doAnimation, specEasingVars;

		for (p in prop) {
			val = prop[p];
			if (val instanceof Array && _easeMap[val[1]]) {
				specEasing = specEasing || {};
				specEasing[p] = val[1];
				val = val[0];
			}
			if (val === "show" || val === "hide" || val === "toggle" || (_legacyProps.indexOf(p) !== -1 && _legacyProps.indexOf("," + p + ",") !== -1)) { //note: slideUp() and slideDown() pass in opacity:"show" or opacity:"hide"
				return _move.call(this, prop, speed, easing, callback);
			} else {
				vars[(p.indexOf("-") === -1) ? p : $.camelCase(p)] = val;
			}
		}

		if (specEasing) {
			vars = _copy(vars);
			specEasingVars = [];
			for (p in specEasing) {
				val = specEasingVars[specEasingVars.length] = {};
				_copyCriticalReserved(vars, val);
				val.ease = (_easeMap[specEasing[p]] || vars.ease);
				if (p.indexOf("-") !== -1) {
					p = $.camelCase(p);
				}
				val[p] = vars[p];
				delete vars[p];
			}
			if (specEasingVars.length === 0) {
				specEasingVars = null;
			}
		}

		doAnimation = function(next) {
			var varsCopy = _copy(vars),
				i;
			if (specEasingVars) {
				i = specEasingVars.length;
				while (--i > -1) {
					Class.to(this, $.fx.off ? 0 : config.duration / 1000, specEasingVars[i]);
				}
			}
			varsCopy.onComplete = function() {
				if (next) {
					next();
				} else if (config.old) {
					$(this).each(config.old);
				}
			};
			Class.to(this, $.fx.off ? 0 : config.duration / 1000, varsCopy);
		};

		if (config.queue !== false) {
			obj.queue(config.queue, doAnimation); //note: the queued function will get called once for each element in the jQuery collection.
			if (typeof(config.old) === "function") {
				$(obj[obj.length-1]).queue(config.queue, function(next) {
					config.old.call(obj);
					next();
				});
			}
		} else {
			doAnimation.call(obj);
		}

		return obj;
	};


	$.fn.stop = function(clearQueue, gotoEnd) {
		_stop.call(this, clearQueue, gotoEnd);
		if (Class) {
			if (gotoEnd) {
				var tweens = Class.getTweensOf(this),
					i = tweens.length,
					progress;
				while (--i > -1) {
					progress = tweens[i].totalTime() / tweens[i].totalDuration();
					if (progress > 0 && progress < 1) {
						tweens[i].seek(tweens[i].totalDuration());
					}
				}
			}
			Class.killTweensOf(this);
		}
		return this;
	};

	$.gsap = {
		enabled:function(value) {
			_enabled = value;
		},
		version:"0.1.12",
		legacyProps:function(value) {
			_legacyProps = _defaultLegacyProps + value + ",";
		}
	};

}(jQuery));

function iOSversion() {

  if (/iPad|iPhone|iPod/.test(navigator.platform)) {
    if (!!this.indexedDB) { return 'iOS 8 and up'; }
    if (!!this.SpeechSynthesisUtterance) { return 'iOS 7'; }
    if (!!this.webkitAudioContext) { return 'iOS 6'; }
    if (!!this.matchMedia) { return 'iOS 5'; }
    if (!!this.history && 'pushState' in this.history) { return 'iOS 4'; }
    return 'iOS 3 or earlier';
  }

  return 'Not an iOS device';
}

//Add Modernizr test
Modernizr.addTest('isios', function(){
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false
});

//usage
if (Modernizr.isiOS) {
    //do stuff specific for iOS
}

function iOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];

  while (iDevices.length) {
    if (navigator.platform === iDevices.pop()){ return true; }
  }

  return false;
}

if( ( /android/* ).test( navigator.appVersion ) ) {
  console = {
    "_log" : [],
    "log" : function() {
      var arr = [];
      for ( var i = 0; i < arguments.length; i++ ) {
        arr.push( arguments[ i ] );
      }
      this._log.push( arr.join( ", ") );
    },
    "trace" : function() {
      var stack;
      try {
        throw new Error();
      } catch( ex ) {
        stack = ex.stack;
      }
      console.log( "console.trace()\n" + stack.split( "\n" ).slice( 2 ).join( "  \n" ) );
    },
    "dir" : function( obj ) {
      console.log( "Content of " + obj );
      for ( var key in obj ) {
        var value = typeof obj[ key ] === "function" ? "function" : obj[ key ];
        console.log( " -\"" + key + "\" -> \"" + value + "\"" );
      }
    },
    "show" : function() {
      alert( this._log.join( "\n" ) );
      this._log = [];
    }
  };
 
  this.onerror = function( msg, url, line ) {
    console.log("ERROR: \"" + msg + "\" at \"" + "\", line " + line);
  }
 
  this.addEventListener( "touchstart", function( e ) {
    if( e.touches.length === 3 ) {
      console.show();
    }
  } );
}

(function(win, undefined) {
    "use strict";

    // gt, gte, lt, lte, eq breakpoints would have been more simple to write as ['gt','gte','lt','lte','eq']
    // but then we would have had to loop over the collection on each resize() event,
    // a simple object with a direct access to true/false is therefore much more efficient
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            screens   : [240, 320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            screensCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                            { ie: { min: 6, max: 11 } }
                           //,{ chrome : { min: 8, max: 33 } }
                           //,{ ff     : { min: 3, max: 26 } }
                           //,{ ios    : { min: 3, max:  7 } }
                           //,{ android: { min: 2, max:  4 } }
                           //,{ webkit : { min: 9, max: 12 } }
                           //,{ opera  : { min: 9, max: 12 } }
            ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            html5     : true,
            page      : "-page",
            section   : "-section",
            head      : "head"
        };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {

        var re = new RegExp(" ?\\b" + name + "\\b");
        html.className = html.className.replace(re, "");
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += " " + klass.join(" ");
            klass = [];

            return api;
        }

        if (Object.prototype.toString.call(enabled) === "[object Function]") {
            enabled = enabled.call();
        }

        pushClass((enabled ? "" : "no-") + key);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass("no-" + key);
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|android|kindle|silk|midp|phone|(thiss .+arm|touch)/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);


    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
        /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
        /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
        /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
        /(msie) ([\w.]+)/.exec(ua) ||
        /(trident).+rv:(\w.)+/.exec(ua) || [];

    var browser = ua[1],
        version = parseFloat(ua[2]);

    switch (browser) {
    case "msie":
    case "trident":
        browser = "ie";
        version = doc.documentMode || version;
        break;
        
    case "firefox":
        browser = "ff";
        break;
        
    case "ipod":
    case "ipad":
    case "iphone":
        browser = "ios";
        break;
        
    case "webkit":
        browser = "safari";
        break;
    }

    // Browser vendor and version
    api.browser = {
        name: browser,
        version: version
    };
    api.browser[browser] = true;

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {
            if (browser === key) {
                pushClass(key);

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss.gt) {
                            pushClass("gt-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    } else if (version < v) {
                        if (conf.browserCss.lt) {
                            pushClass("lt-" + key + v);
                        }

                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }
                    } else if (version === v) {
                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }

                        if (conf.browserCss.eq) {
                            pushClass("eq-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    }
                }
            } else {
                pushClass("no-" + key);
            }
        }
    }

    pushClass(browser);
    pushClass(browser + parseInt(version, 10));

    // IE lt9 specific
    if (conf.html5 && browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(this.slice(i, i + 1).join("-").toLowerCase() + conf.section);
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }

            html.id = id.toLowerCase() + conf.page;

            // on this?
            if (!i) {
                pushClass("this" + conf.section);
            }
        }
    });

    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-|eq-|gt-|gte-|lt-|lte-|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen.innerWidth = iw;
        api.screen.outerWidth = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.screens, function(width) {
            if (iw > width) {
                if (conf.screensCss.gt) {
                    pushClass("gt-" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            } else if (iw < width) {
                if (conf.screensCss.lt) {
                    pushClass("lt-" + width);
                }

                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }
            } else if (iw === width) {
                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }

                if (conf.screensCss.eq) {
                    pushClass("e-q" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            }
        });

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen.innerHeight = ih;
        api.screen.outerHeight = oh;

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }

    screenSize();

    // Throttle navigators from triggering too many resize events
    var resizeId = 0;

    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 50);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        // IE8 and less
        win.attachEvent("onresize", onResize);
    }
}(this));

(function (win, undefined) {
    "use strict";

    //#region variables
    var doc        = win.document,
        domWaiters = [],
        handlers   = {}, // user functions waiting for events
        assets     = {}, // loadable items in various states
        isAsync    = "async" in doc.createElement("script") || "MozAppearance" in doc.documentElement.style || win.opera,
        isDomReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function () { api.ready.apply(null, arguments); }),

        // states
        PRELOADING = 1,
        PRELOADED  = 2,
        LOADING    = 3,
        LOADED     = 4;
    //#endregion

    //#region PRIVATE functions

    //#region Helper functions
    function noop() {
        // does nothing
    }

    function each(arr, callback) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === "object") {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(arr, arr[i], i);
        }
    }

    /* A must read: http://bonsaiden.github.com/JavaScript-Garden
     ************************************************************/
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(item) {
        return is("Function", item);
    }

    function isArray(item) {
        return is("Array", item);
    }

    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var items = url.split("/"),
             name = items[items.length - 1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }

    // INFO: this look like a "im triggering callbacks all over the place, but only wanna run it one time function" ..should try to make everything work without it if possible
    // INFO: Even better. Look into promises/defered's like jQuery is doing
    function one(callback) {
        ///<summary>Execute a callback only once</summary>
        callback = callback || noop;

        if (callback._done) {
            return;
        }

        callback();
        callback._done = 1;
    }
    //#endregion

    function conditional(test, success, failure, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.test(condition, null       , "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", null       , callback);
        ///    head.test(condition, "fileOk.js", "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", ["file.NOk", "file.NOk"], callback);
        ///    head.test({
        ///               test    : condition,
        ///               success : [{ label1: "file1Ok.js"  }, { label2: "file2Ok.js" }],
        ///               failure : [{ label1: "file1NOk.js" }, { label2: "file2NOk.js" }],
        ///               callback: callback
        ///    );
        ///    head.test({
        ///               test    : condition,
        ///               success : ["file1Ok.js" , "file2Ok.js"],
        ///               failure : ["file1NOk.js", "file2NOk.js"],
        ///               callback: callback
        ///    );
        ///</summary>
        var obj = (typeof test === "object") ? test : {
            test: test,
            success: !!success ? isArray(success) ? success : [success] : false,
            failure: !!failure ? isArray(failure) ? failure : [failure] : false,
            callback: callback || noop
        };

        // Test Passed ?
        var passed = !!obj.test;

        // Do we have a success case
        if (passed && !!obj.success) {
            obj.success.push(obj.callback);
            api.load.apply(null, obj.success);
        }
        // Do we have a fail case
        else if (!passed && !!obj.failure) {
            obj.failure.push(obj.callback);
            api.load.apply(null, obj.failure);
        }
        else {
            callback();
        }

        return api;
    }

    function getAsset(item) {
        ///<summary>
        /// Assets are in the form of
        /// {
        ///     name : label,
        ///     url  : url,
        ///     state: state
        /// }
        ///</summary>
        var asset = {};

        if (typeof item === "object") {
            for (var label in item) {
                if (!!item[label]) {
                    asset = {
                        name: label,
                        url : item[label]
                    };
                }
            }
        }
        else {
            asset = {
                name: toLabel(item),
                url : item
            };
        }

        // is the item already existant
        var existing = assets[asset.name];
        if (existing && existing.url === asset.url) {
            return existing;
        }

        assets[asset.name] = asset;
        return asset;
    }

    function allLoaded(items) {
        items = items || assets;

        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
        }

        return true;
    }

    function onPreload(asset) {
        asset.state = PRELOADED;

        each(asset.onpreload, function (afterPreload) {
            afterPreload.call();
        });
    }

    function preLoad(asset, callback) {
        if (asset.state === undefined) {

            asset.state     = PRELOADING;
            asset.onpreload = [];

            loadAsset({ url: asset.url, type: "cache" }, function () {
                onPreload(asset);
            });
        }
    }

    function apiLoadHack() {
        /// <summary>preload with text/cache hack
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        /// </summary>
        var args     = arguments,
            callback = args[args.length - 1],
            rest     = [].slice.call(args, 1),
            next     = rest[0];

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // multiple arguments
        if (!!next) {
            /* Preload with text/cache hack (not good!)
             * http://blog.getify.com/on-script-loaders/
             * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
             * If caching is not configured correctly on the server, then items could load twice !
             *************************************************************************************/
            each(rest, function (item) {
                // item is not a callback or empty string
                if (!isFunction(item) && !!item) {
                    preLoad(getAsset(item));
                }
            });

            // execute
            load(getAsset(args[0]), isFunction(next) ? next : function () {
                api.load.apply(null, rest);
            });
        }
        else {
            // single item
            load(getAsset(args[0]));
        }

        return api;
    }

    function apiLoadAsync() {
        ///<summary>
        /// simply load and let browser take care of ordering
        ///
        /// head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        /// head.load(["http://domain.com/file.js","http://domain.com/file.js"], callBack)
        /// head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        /// head.load([{ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }], callBack)
        ///</summary>
        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // JRH 262#issuecomment-26288601
        // First populate the items array.
        // When allLoaded is called, all items will be populated.
        // Issue when lazy loaded, the callback can execute early.
        each(args, function (item, i) {
            if (item !== callback) {
                item             = getAsset(item);
                items[item.name] = item;
            }
        });

        each(args, function (item, i) {
            if (item !== callback) {
                item = getAsset(item);

                load(item, function () {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            }
        });

        return api;
    }

    function load(asset, callback) {
        ///<summary>Used with normal loading logic</summary>
        callback = callback || noop;

        if (asset.state === LOADED) {
            callback();
            return;
        }

        // INFO: why would we trigger a ready event when its not really loaded yet ?
        if (asset.state === LOADING) {
            api.ready(asset.name, callback);
            return;
        }

        if (asset.state === PRELOADING) {
            asset.onpreload.push(function () {
                load(asset, callback);
            });
            return;
        }

        asset.state = LOADING;

        loadAsset(asset, function () {
            asset.state = LOADED;

            callback();

            // handlers for this asset
            each(handlers[asset.name], function (fn) {
                one(fn);
            });

            // dom is ready & no assets are queued for loading
            // INFO: shouldn't we be doing the same test above ?
            if (isDomReady && allLoaded()) {
                each(handlers.ALL, function (fn) {
                    one(fn);
                });
            }
        });
    }

    function getExtension(url) {
        url = url || "";

        var items = url.split("?")[0].split(".");
        return items[items.length-1].toLowerCase();
    }

    /* Parts inspired from: https://github.com/cujojs/curl
    ******************************************************/
    function loadAsset(asset, callback) {
        callback = callback || noop;

        function error(event) {
            event = event || win.event;

            // release event listeners
            ele.onload = ele.onreadystatechange = ele.onerror = null;

            // do callback
            callback();

            // need some more detailed error handling here
        }

        function process(event) {
            event = event || win.event;

            // IE 7/8/9 (2 events on 1st load)
            event.type = readystatechange, s.readyState = loading
            event.type = readystatechange, s.readyState = loaded

            
            event.type = readystatechange, s.readyState = complete

            event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            
             event.type = readystatechange, s.readyState = loading
             event.type = readystatechange, s.readyState = loaded
             event.type = load            , s.readyState = loaded

             event.type = readystatechange, s.readyState = complete
             event.type = load            , s.readyState = complete

             event.type === 'load'             && /loaded|complete/.test(s.readyState)
             event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

        
             event.type = readystatechange, s.readyState = loading
             event.type = load            , s.readyState = complete
             event.type = readystatechange, s.readyState = loaded


             event.type = readystatechange, s.readyState = loaded
             event.type = load            , s.readyState = complete
             event.type = readystatechange, s.readyState = complete

             event.type === 'load'             && /loaded|complete/.test(s.readyState)
             event.type === 'readystatechange' && /complete/.test(s.readyState)

  
            event.type = load, s.readyState = undefined

             event.type == 'load' && s.readyState = undefined

            // !doc.documentMode is for IE6/7, IE8+ have documentMode
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9))) {
                // remove timeouts
                win.clearTimeout(asset.errorTimeout);
                win.clearTimeout(asset.cssTimeout);

                // release event listeners
                ele.onload = ele.onreadystatechange = ele.onerror = null;

                // do callback   
                callback();
            }
        }

        function isCssLoaded() {
            // should we test again ? 20 retries = 5secs ..after that, the callback will be triggered by the error handler at 7secs
            if (asset.state !== LOADED && asset.cssRetries <= 20) {

                // loop through stylesheets
                for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                    // do we have a match ?
                    // we need to tests agains ele.href and not asset.url, because a local file will be assigned the full http path on a link element
                    if (doc.styleSheets[i].href === ele.href) {
                        process({ "type": "load" });
                        return;
                    }
                }

                // increment & try again
                asset.cssRetries++;
                asset.cssTimeout = win.setTimeout(isCssLoaded, 250);
            }
        }

        var ele;
        var ext = getExtension(asset.url);

        if (ext === "css") {
            ele      = doc.createElement("link");
            ele.type = "text/" + (asset.type || "css");
            ele.rel  = "stylesheet";
            ele.href = asset.url;

            /* onload supported for CSS on unsupported browsers
             * Safari thiss 5.1.7, FF < 10
             */

            // Set counter to zero
            asset.cssRetries = 0;
            asset.cssTimeout = win.setTimeout(isCssLoaded, 500);         
        }
        else {
            ele      = doc.createElement("script");
            ele.type = "text/" + (asset.type || "javascript");
            ele.src = asset.url;
        }

        ele.onload  = ele.onreadystatechange = process;
        ele.onerror = error;

       

        // ASYNC: load in parallel and execute as soon as possible
        ele.async = false;
        // DEFER: load in parallel but maintain execution order
        ele.defer = false;

        // timout for asset loading
        asset.errorTimeout = win.setTimeout(function () {
            error({ type: "timeout" });
        }, 7e3);

        // use insertBefore to keep IE from throwing Operation Aborted (thx Bryan Forbes!)
        var head = doc.head || doc.getElementsByTagName("head")[0];

        // but insert at end of head, because otherwise if it is a stylesheet, it will not override values      
        head.insertBefore(ele, head.lastChild);
    }

   
    function init() {
        var items = doc.getElementsByTagName("script");

        // look for a script with a data-head-init attribute
        for (var i = 0, l = items.length; i < l; i++) {
            var dataMain = items[i].getAttribute("data-headjs-load");
            if (!!dataMain) {
                api.load(dataMain);
                return;
            }
        }
    }

    function ready(key, callback) {


        // DOM ready check: head.ready(document, function() { });
        if (key === doc) {
            if (isDomReady) {
                one(callback);
            }
            else {
                domWaiters.push(callback);
            }

            return api;
        }

        // shift arguments
        if (isFunction(key)) {
            callback = key;
            key      = "ALL"; // holds all callbacks that where added without labels: ready(callBack)
        }

        // queue all items from key and return. The callback will be executed if all items from key are already loaded.
        if (isArray(key)) {
            var items = {};

            each(key, function (item) {
                items[item] = assets[item];

                api.ready(item, function() {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            });

            return api;
        }

        // make sure arguments are sane
        if (typeof key !== "string" || !isFunction(callback)) {
            return api;
        }

        // this can also be called when we trigger events based on filenames & labels
        var asset = assets[key];

        // item already loaded --> execute and return
        if (asset && asset.state === LOADED || key === "ALL" && allLoaded() && isDomReady) {
            one(callback);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [callback];
        }
        else {
            arr.push(callback);
        }

        return api;
    }


    function domReady() {
        // Make sure body exists, at least, in case IE gets a little overzealous (jQuery ticket #5443).
        if (!doc.body) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
            win.clearTimeout(api.readyTimeout);
            api.readyTimeout = win.setTimeout(domReady, 50);
            return;
        }

        if (!isDomReady) {
            isDomReady = true;

            init();
            each(domWaiters, function (fn) {
                one(fn);
            });
        }
    }

    function domContentLoaded() {
        // W3C
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        }

        // IE
        else if (doc.readyState === "complete") {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    }


    if (doc.readyState === "complete") {
        domReady();
    }

    // W3C
    else if (doc.addEventListener) {
        doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

        // A fallback to this.onload, that will always work
        win.addEventListener("load", domReady, false);
    }

    // IE
    else {
        // Ensure firing before onload, maybe late but safe also for iframes
        doc.attachEvent("onreadystatechange", domContentLoaded);

        // A fallback to this.onload, that will always work
        win.attachEvent("onload", domReady);

        // If IE and not a frame
        // continually check to see if the document is ready
        var top = false;

        try {
            top = !win.frameElement && doc.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
            (function doScrollCheck() {
                if (!isDomReady) {
                    try {
                        // Use the trick by Diego Perini
                   
                        top.doScroll("left");
                    } catch (error) {
                        // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
                        win.clearTimeout(api.readyTimeout);
                        api.readyTimeout = win.setTimeout(doScrollCheck, 50);
                        return;
                    }

                    // and execute any waiting functions
                    domReady();
                }
            }());
        }
    }
    //#endregion

    //#region Public Exports
    // INFO: determine which method to use for loading
    api.load  = api.js = isAsync ? apiLoadAsync : apiLoadHack;
    api.test  = conditional;
    api.ready = ready;
    //#endregion

    //#region INIT
    // perform this when DOM is ready
    api.ready(doc, function () {
        if (allLoaded()) {
            each(handlers.ALL, function (callback) {
                one(callback);
            });
        }

        if (api.feature) {
            api.feature("domloaded", true);
        }
    });
    //#endregion
}(this));

///#source 1 1 /src/1.0.0/core.js

(function(win, undefined) {
    "use strict";


    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        conf  = {
            screens   : [240, 320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            screensCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                            { ie: { min: 6, max: 11 } }
                           //,{ chrome : { min: 8, max: 33 } }
                           //,{ ff     : { min: 3, max: 26 } }
                           //,{ ios    : { min: 3, max:  7 } }
                           //,{ android: { min: 2, max:  4 } }
                           //,{ webkit : { min: 9, max: 12 } }
                           //,{ opera  : { min: 9, max: 12 } }
            ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            html5     : true,
            page      : "-page",
            section   : "-section",
            head      : "head"
        };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {

        var re = new RegExp(" ?\\b" + name + "\\b");
        html.className = html.className.replace(re, "");
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += " " + klass.join(" ");
            klass = [];

            return api;
        }

        if (Object.prototype.toString.call(enabled) === "[object Function]") {
            enabled = enabled.call();
        }

        pushClass((enabled ? "" : "no-") + key);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass("no-" + key);
            removeClass(key);
            api.feature();
        }

        return api;
    };

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|android|kindle|silk|midp|phone|(thiss .+arm|touch)/.test(ua);

    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)
    api.feature("mobile" , mobile , true);
    api.feature("desktop", !mobile, true);

    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua) || // Chrome & Firefox
        /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
        /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile Webkit
        /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Safari & Opera
        /(msie) ([\w.]+)/.exec(ua) ||
        /(trident).+rv:(\w.)+/.exec(ua) || [];

    var browser = ua[1],
        version = parseFloat(ua[2]);

    switch (browser) {
    case "msie":
    case "trident":
        browser = "ie";
        version = doc.documentMode || version;
        break;
        
    case "firefox":
        browser = "ff";
        break;
        
    case "ipod":
    case "ipad":
    case "iphone":
        browser = "ios";
        break;
        
    case "webkit":
        browser = "safari";
        break;
    }

    // Browser vendor and version
    api.browser = {
        name: browser,
        version: version
    };
    api.browser[browser] = true;

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {
            if (browser === key) {
                pushClass(key);

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss.gt) {
                            pushClass("gt-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    } else if (version < v) {
                        if (conf.browserCss.lt) {
                            pushClass("lt-" + key + v);
                        }

                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }
                    } else if (version === v) {
                        if (conf.browserCss.lte) {
                            pushClass("lte-" + key + v);
                        }

                        if (conf.browserCss.eq) {
                            pushClass("eq-" + key + v);
                        }

                        if (conf.browserCss.gte) {
                            pushClass("gte-" + key + v);
                        }
                    }
                }
            } else {
                pushClass("no-" + key);
            }
        }
    }

    pushClass(browser);
    pushClass(browser + parseInt(version, 10));

    // IE lt9 specific
    if (conf.html5 && browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: assets/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(this.slice(i, i + 1).join("-").toLowerCase() + conf.section);
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }

            html.id = id.toLowerCase() + conf.page;

            // on this?
            if (!i) {
                pushClass("this" + conf.section);
            }
        }
    });

    // basic screen info
    api.screen = {
        height: win.screen.height,
        width : win.screen.width
    };

    // viewport resolutions: w-100, lt-480, lt-1024 ...
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-|eq-|gt-|gte-|lt-|lte-|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen.innerWidth = iw;
        api.screen.outerWidth = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w-" + iw);

        each(conf.screens, function(width) {
            if (iw > width) {
                if (conf.screensCss.gt) {
                    pushClass("gt-" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            } else if (iw < width) {
                if (conf.screensCss.lt) {
                    pushClass("lt-" + width);
                }

                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }
            } else if (iw === width) {
                if (conf.screensCss.lte) {
                    pushClass("lte-" + width);
                }

                if (conf.screensCss.eq) {
                    pushClass("e-q" + width);
                }

                if (conf.screensCss.gte) {
                    pushClass("gte-" + width);
                }
            }
        });

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen.innerHeight = ih;
        api.screen.outerHeight = oh;

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }

    screenSize();

    // Throttle navigators from triggering too many resize events
    var resizeId = 0;

    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 50);
    }

    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        // IE8 and less
        win.attachEvent("onresize", onResize);
    }
}(this));

(function (win, undefined) {
    "use strict";

    var doc = win.document,


        /* CSS modernizer */
        el       = doc.createElement("i"),
        style    = el.style,
        prefs    = " -o- -moz- -ms- -webkit- -khtml- ".split(" "),
        domPrefs = "Webkit Moz O ms Khtml".split(" "),
        headVar  = win.head_conf && win.head_conf.head || "head",
        api      = win[headVar];

    // Thanks Paul Irish!

    function testProps(props) {
        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }

        return false;
    }


    function testAll(prop) {
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
            props = (prop + " " + domPrefs.join(camel + " ") + camel).split(" ");

        return !!testProps(props);
    }

    var tests = {
        // should we seperate linear/radial ? 
        // seems like some browsers need a test for prefix http://caniuse.com/#feat=css-gradients
        gradient: function () {
            var s1 = "background-image:",
                s2 = "gradient(linear,left top,right bottom,from(#9f9),to(#fff));",
                s3 = "linear-gradient(left top,#eee,#fff);";

            style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0, -s1.length);
            return !!style.backgroundImage;
        },

        rgba: function () {
            style.cssText = "background-color:rgba(0,0,0,0.5)";
            return !!style.backgroundColor;
        },

        opacity: function () {
            return el.style.opacity === "";
        },

        textshadow: function () {
            return style.textShadow === "";
        },

        multiplebgs: function () {
            style.cssText = "background:url(https://),url(https://),red url(https://)";

            // If the UA supports multiple backgrounds, there should be three occurrences
            // of the string "url(" in the return value for elemStyle.background
            var result = (style.background || "").match(/url/g);

            return Object.prototype.toString.call(result) === "[object Array]" && result.length === 3;
        },

        boxshadow: function () {
            return testAll("boxShadow");
        },

        borderimage: function () {
            return testAll("borderImage");
        },

        borderradius: function () {
            return testAll("borderRadius");
        },

        cssreflections: function () {
            return testAll("boxReflect");
        },

        csstransforms: function () {
            return testAll("transform");
        },

        csstransitions: function () {
            return testAll("transition");
        },
        touch: function () {
            return "ontouchstart" in win;
        },
        retina: function () {
            return (win.devicePixelRatio > 1);
        },

        /*
            font-face support. Uses browser sniffing but is synchronous.
            http://paulirish.com/2009/font-face-feature-detection/
        */
        fontface: function () {
            var browser = api.browser.name, version = api.browser.version;

            switch (browser) {
                case "ie":
                    return version >= 9;
                    
                case "chrome":
                    return version >= 13;
                    
                case "ff":
                    return version >= 6;
                    
                case "ios":
                    return version >= 5;

                case "android":
                    return false;

                case "webkit":
                    return version >= 5.1;
                    
                case "opera":
                    return version >= 10;
                    
                default:
                    return false;
            }
        }
    };

    // queue features
    for (var key in tests) {
        if (tests[key]) {
            api.feature(key, tests[key].call(), true);
        }
    }

    // enable features at once
    api.feature();

}(this));
///#source 1 1 /src/1.0.0/load.js
/*! head.load - v1.0.3 */

(function (win, undefined) {
    "use strict";

    //#region variables
    var doc        = win.document,
        domWaiters = [],
        handlers   = {}, // user functions waiting for events
        assets     = {}, // loadable items in various states
        isAsync    = "async" in doc.createElement("script") || "MozAppearance" in doc.documentElement.style || win.opera,
        isDomReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function () { api.ready.apply(null, arguments); }),

        // states
        PRELOADING = 1,
        PRELOADED  = 2,
        LOADING    = 3,
        LOADED     = 4;
    //#endregion

    //#region PRIVATE functions

    //#region Helper functions
    function noop() {
        // does nothing
    }

    function each(arr, callback) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === "object") {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(arr, arr[i], i);
        }
    }


    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(item) {
        return is("Function", item);
    }

    function isArray(item) {
        return is("Array", item);
    }

    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var items = url.split("/"),
             name = items[items.length - 1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }
    function one(callback) {
        ///<summary>Execute a callback only once</summary>
        callback = callback || noop;

        if (callback._done) {
            return;
        }

        callback();
        callback._done = 1;
    }
    //#endregion

    function conditional(test, success, failure, callback) {

        var obj = (typeof test === "object") ? test : {
            test: test,
            success: !!success ? isArray(success) ? success : [success] : false,
            failure: !!failure ? isArray(failure) ? failure : [failure] : false,
            callback: callback || noop
        };

        // Test Passed ?
        var passed = !!obj.test;

        // Do we have a success case
        if (passed && !!obj.success) {
            obj.success.push(obj.callback);
            api.load.apply(null, obj.success);
        }
        // Do we have a fail case
        else if (!passed && !!obj.failure) {
            obj.failure.push(obj.callback);
            api.load.apply(null, obj.failure);
        }
        else {
            callback();
        }

        return api;
    }

    function getAsset(item) {

        var asset = {};

        if (typeof item === "object") {
            for (var label in item) {
                if (!!item[label]) {
                    asset = {
                        name: label,
                        url : item[label]
                    };
                }
            }
        }
        else {
            asset = {
                name: toLabel(item),
                url : item
            };
        }

        // is the item already existant
        var existing = assets[asset.name];
        if (existing && existing.url === asset.url) {
            return existing;
        }

        assets[asset.name] = asset;
        return asset;
    }

    function allLoaded(items) {
        items = items || assets;

        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
        }

        return true;
    }

    function onPreload(asset) {
        asset.state = PRELOADED;

        each(asset.onpreload, function (afterPreload) {
            afterPreload.call();
        });
    }

    function preLoad(asset, callback) {
        if (asset.state === undefined) {

            asset.state     = PRELOADING;
            asset.onpreload = [];

            loadAsset({ url: asset.url, type: "cache" }, function () {
                onPreload(asset);
            });
        }
    }

    function apiLoadHack() {

        var args     = arguments,
            callback = args[args.length - 1],
            rest     = [].slice.call(args, 1),
            next     = rest[0];

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }

        // multiple arguments
        if (!!next) {

            each(rest, function (item) {
                // item is not a callback or empty string
                if (!isFunction(item) && !!item) {
                    preLoad(getAsset(item));
                }
            });

            // execute
            load(getAsset(args[0]), isFunction(next) ? next : function () {
                api.load.apply(null, rest);
            });
        }
        else {
            // single item
            load(getAsset(args[0]));
        }

        return api;
    }

    function apiLoadAsync() {

        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};

        if (!isFunction(callback)) {
            callback = null;
        }

        // if array, repush as args
        if (isArray(args[0])) {
            args[0].push(callback);
            api.load.apply(null, args[0]);

            return api;
        }


        each(args, function (item, i) {
            if (item !== callback) {
                item             = getAsset(item);
                items[item.name] = item;
            }
        });

        each(args, function (item, i) {
            if (item !== callback) {
                item = getAsset(item);

                load(item, function () {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            }
        });

        return api;
    }

    function load(asset, callback) {
        ///<summary>Used with normal loading logic</summary>
        callback = callback || noop;

        if (asset.state === LOADED) {
            callback();
            return;
        }

        // INFO: why would we trigger a ready event when its not really loaded yet ?
        if (asset.state === LOADING) {
            api.ready(asset.name, callback);
            return;
        }

        if (asset.state === PRELOADING) {
            asset.onpreload.push(function () {
                load(asset, callback);
            });
            return;
        }

        asset.state = LOADING;

        loadAsset(asset, function () {
            asset.state = LOADED;

            callback();

            // handlers for this asset
            each(handlers[asset.name], function (fn) {
                one(fn);
            });


            if (isDomReady && allLoaded()) {
                each(handlers.ALL, function (fn) {
                    one(fn);
                });
            }
        });
    }

    function getExtension(url) {
        url = url || "";

        var items = url.split("?")[0].split(".");
        return items[items.length-1].toLowerCase();
    }


    function loadAsset(asset, callback) {
        callback = callback || noop;

        function error(event) {
            event = event || win.event;

            // release event listeners
            ele.onload = ele.onreadystatechange = ele.onerror = null;

            // do callback
            callback();

            // need some more detailed error handling here
        }

        function process(event) {
            event = event || win.event;

            // IE 7/8 (2 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded

            // IE 7/8 (1 event on reload)
            // 1) event.type = readystatechange, s.readyState = complete

            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 9 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = readystatechange, s.readyState = loaded
            // 3) event.type = load            , s.readyState = loaded

            // IE 9 (2 events on reload)
            // 1) event.type = readystatechange, s.readyState = complete
            // 2) event.type = load            , s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /loaded|complete/.test(s.readyState)

            // IE 10 (3 events on 1st load)
            // 1) event.type = readystatechange, s.readyState = loading
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = loaded

            // IE 10 (3 events on reload)
            // 1) event.type = readystatechange, s.readyState = loaded
            // 2) event.type = load            , s.readyState = complete
            // 3) event.type = readystatechange, s.readyState = complete

            // event.type === 'load'             && /loaded|complete/.test(s.readyState)
            // event.type === 'readystatechange' && /complete/.test(s.readyState)

            // Other Browsers (1 event on 1st load)
            // 1) event.type = load, s.readyState = undefined

            // Other Browsers (1 event on reload)
            // 1) event.type = load, s.readyState = undefined

            // event.type == 'load' && s.readyState = undefined

            // !doc.documentMode is for IE6/7, IE8+ have documentMode
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9))) {
                // remove timeouts
                win.clearTimeout(asset.errorTimeout);
                win.clearTimeout(asset.cssTimeout);

                // release event listeners
                ele.onload = ele.onreadystatechange = ele.onerror = null;

                // do callback   
                callback();
            }
        }

        function isCssLoaded() {
            // should we test again ? 20 retries = 5secs ..after that, the callback will be triggered by the error handler at 7secs
            if (asset.state !== LOADED && asset.cssRetries <= 20) {

                // loop through stylesheets
                for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                    // do we have a match ?
                    // we need to tests agains ele.href and not asset.url, because a local file will be assigned the full http path on a link element
                    if (doc.styleSheets[i].href === ele.href) {
                        process({ "type": "load" });
                        return;
                    }
                }

                // increment & try again
                asset.cssRetries++;
                asset.cssTimeout = win.setTimeout(isCssLoaded, 250);
            }
        }

        var ele;
        var ext = getExtension(asset.url);

        if (ext === "css") {
            ele      = doc.createElement("link");
            ele.type = "text/" + (asset.type || "css");
            ele.rel  = "stylesheet";
            ele.href = asset.url;

            /* onload supported for CSS on unsupported browsers
             * Safari thiss 5.1.7, FF < 10
             */

            // Set counter to zero
            asset.cssRetries = 0;
            asset.cssTimeout = win.setTimeout(isCssLoaded, 500);         
        }
        else {
            ele      = doc.createElement("script");
            ele.type = "text/" + (asset.type || "javascript");
            ele.src = asset.url;
        }

        ele.onload  = ele.onreadystatechange = process;
        ele.onerror = error;

     

        // ASYNC: load in parallel and execute as soon as possible
        ele.async = false;
        // DEFER: load in parallel but maintain execution order
        ele.defer = false;

        // timout for asset loading
        asset.errorTimeout = win.setTimeout(function () {
            error({ type: "timeout" });
        }, 7e3);

        // use insertBefore to keep IE from throwing Operation Aborted (thx Bryan Forbes!)
        var head = doc.head || doc.getElementsByTagName("head")[0];

        // but insert at end of head, because otherwise if it is a stylesheet, it will not override values      
        head.insertBefore(ele, head.lastChild);
    }


    function init() {
        var items = doc.getElementsByTagName("script");

        // look for a script with a data-head-init attribute
        for (var i = 0, l = items.length; i < l; i++) {
            var dataMain = items[i].getAttribute("data-headjs-load");
            if (!!dataMain) {
                api.load(dataMain);
                return;
            }
        }
    }

    function ready(key, callback) {
       
        // DOM ready check: head.ready(document, function() { });
        if (key === doc) {
            if (isDomReady) {
                one(callback);
            }
            else {
                domWaiters.push(callback);
            }

            return api;
        }

        // shift arguments
        if (isFunction(key)) {
            callback = key;
            key      = "ALL"; // holds all callbacks that where added without labels: ready(callBack)
        }

        // queue all items from key and return. The callback will be executed if all items from key are already loaded.
        if (isArray(key)) {
            var items = {};

            each(key, function (item) {
                items[item] = assets[item];

                api.ready(item, function() {
                    if (allLoaded(items)) {
                        one(callback);
                    }
                });
            });

            return api;
        }

        // make sure arguments are sane
        if (typeof key !== "string" || !isFunction(callback)) {
            return api;
        }

        // this can also be called when we trigger events based on filenames & labels
        var asset = assets[key];

        // item already loaded --> execute and return
        if (asset && asset.state === LOADED || key === "ALL" && allLoaded() && isDomReady) {
            one(callback);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [callback];
        }
        else {
            arr.push(callback);
        }

        return api;
    }


    function domReady() {
        // Make sure body exists, at least, in case IE gets a little overzealous (jQuery ticket #5443).
        if (!doc.body) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
            win.clearTimeout(api.readyTimeout);
            api.readyTimeout = win.setTimeout(domReady, 50);
            return;
        }

        if (!isDomReady) {
            isDomReady = true;

            init();
            each(domWaiters, function (fn) {
                one(fn);
            });
        }
    }

    function domContentLoaded() {
        // W3C
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        }

        // IE
        else if (doc.readyState === "complete") {

            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    }


    if (doc.readyState === "complete") {
        domReady();
    }

    // W3C
    else if (doc.addEventListener) {
        doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

        // A fallback to this.onload, that will always work
        win.addEventListener("load", domReady, false);
    }

    // IE
    else {
        // Ensure firing before onload, maybe late but safe also for iframes
        doc.attachEvent("onreadystatechange", domContentLoaded);

        // A fallback to this.onload, that will always work
        win.attachEvent("onload", domReady);

        // If IE and not a frame
        // continually check to see if the document is ready
        var top = false;

        try {
            top = !win.frameElement && doc.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
            (function doScrollCheck() {
                if (!isDomReady) {
                    try {
                        // Use the trick by Diego Perini
                       
                        top.doScroll("left");
                    } catch (error) {
                        // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if assets are queued)
                        win.clearTimeout(api.readyTimeout);
                        api.readyTimeout = win.setTimeout(doScrollCheck, 50);
                        return;
                    }

                    // and execute any waiting functions
                    domReady();
                }
            }());
        }
    }
    


    api.load  = api.js = isAsync ? apiLoadAsync : apiLoadHack;
    api.test  = conditional;
    api.ready = ready;

    api.ready(doc, function () {
        if (allLoaded()) {
            each(handlers.ALL, function (callback) {
                one(callback);
            });
        }

        if (api.feature) {
            api.feature("domloaded", true);
        }
    });
    //#endregion
}(this));

//Differ
Differ::code:RTV_
{



};
