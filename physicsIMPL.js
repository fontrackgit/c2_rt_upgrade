
(function(window, moduleName) {

		"use strict";
		var _globals = window.nmGlobals = window.nmGlobals || window;
		if (_globals.moveasy) {
			return; 
		}
		var _namespace = function(ns) {
				var a = ns.split("."),
					p = _globals, i;
				for (i = 0; i < a.length; i++) {
					p[a[i]] = p = p[a[i]] || {};
				}
				return p;
			},
			gs = _namespace("com.c2.lib.nm"),
			_tinyNum = 0.0000000001,
			_slice = function(a) { /
				var b = [],
					l = a.length,
					i;
				for (i = 0; i !== l; b.push(a[i++])) {}
				return b;
			},
			_emptyFunc = function() {},
			_isArray = (function() { 
				var toString = Object.prototype.toString,
					array = toString.call([]);
				return function(obj) {
					return obj != null && (obj instanceof Array || (typeof(obj) === "object" && !!obj.push && toString.call(obj) === array));
				};
			}()),
			a, i, p, _ticker, _tickerActive,
			_defLookup = {},

			
			Definition = function(ns, dependencies, func, global) {
				this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
				_defLookup[ns] = this;
				this.gsClass = null;
				this.func = func;
				var _classes = [];
				this.check = function(init) {
					var i = dependencies.length,
						missing = i,
						cur, a, n, cl, hasModule;
					while (--i > -1) {
						if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
							_classes[i] = cur.gsClass;
							missing--;
						} else if (init) {
							cur.sc.push(this);
						}
					}
					if (missing === 0 && func) {
						a = ("com.embdPluginsock." + ns).split(".");
						n = a.pop();
						cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);

						//exports to multiple environments
						if (global) {
							_globals[n] = cl; 
							hasModule = (typeof(module) !== "undefined" && module.exports);
							if (!hasModule && typeof(define) === "function" && define.amd){ //AMD
								define((window.embdPlugin ? window.embdPlugin + "/" : "") + ns.split(".").pop(), [], function() { return cl; });
							} else if (ns === moduleName && hasModule){ //node
								module.exports = cl;
							}
						}
						for (i = 0; i < this.sc.length; i++) {
							this.sc[i].check();
						}
					}
				};
				this.check(true);
			},

			
			_gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
				return new Definition(ns, dependencies, func, global);
			},

			
			_class = gs._class = function(ns, func, global) {
				func = func || function() {};
				_gsDefine(ns, [], function(){ return func; }, global);
				return func;
			};

		_gsDefine.globals = _globals;




		var _baseParams = [0, 0, 1, 1],
			_blankArray = [],
			Ease = _class("easing.Ease", function(func, extraParams, type, power) {
				this._func = func;
				this._type = type || 0;
				this._power = power || 0;
				this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
			}, true),
			_easeMap = Ease.map = {},
			_easeReg = Ease.register = function(ease, names, types, create) {
				var na = names.split(","),
					i = na.length,
					ta = (types || "easeIn,easeOut,easeInOut").split(","),
					e, name, j, type;
				while (--i > -1) {
					name = na[i];
					e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
					j = ta.length;
					while (--j > -1) {
						type = ta[j];
						_easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
					}
				}
			};

		p = Ease.prototype;
		p._calcEnd = false;
		p.getRatio = function(p) {
			if (this._func) {
				this._params[0] = p;
				return this._func.apply(null, this._params);
			}
			var t = this._type,
				pw = this._power,
				r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
			if (pw === 1) {
				r *= r;
			} else if (pw === 2) {
				r *= r * r;
			} else if (pw === 3) {
				r *= r * r * r;
			} else if (pw === 4) {
				r *= r * r * r * r;
			}
			return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
		};

		a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
		i = a.length;
		while (--i > -1) {
			p = a[i]+",Power"+i;
			_easeReg(new Ease(null,null,1,i), p, "easeOut", true);
			_easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
			_easeReg(new Ease(null,null,3,i), p, "easeInOut");
		}
		_easeMap.linear = gs.easing.Linear.easeIn;
		_easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks



		var EventDispatcher = _class("events.EventDispatcher", function(target) {
			this._listeners = {};
			this._eventTarget = target || this;
		});
		p = EventDispatcher.prototype;

		p.addEventListener = function(type, callback, scope, useParam, priority) {
			priority = priority || 0;
			var list = this._listeners[type],
				index = 0,
				listener, i;
			if (list == null) {
				this._listeners[type] = list = [];
			}
			i = list.length;
			while (--i > -1) {
				listener = list[i];
				if (listener.c === callback && listener.s === scope) {
					list.splice(i, 1);
				} else if (index === 0 && listener.pr < priority) {
					index = i + 1;
				}
			}
			list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
			if (this === _ticker && !_tickerActive) {
				_ticker.wake();
			}
		};

		p.removeEventListener = function(type, callback) {
			var list = this._listeners[type], i;
			if (list) {
				i = list.length;
				while (--i > -1) {
					if (list[i].c === callback) {
						list.splice(i, 1);
						return;
					}
				}
			}
		};

		p.dispatchEvent = function(type) {
			var list = this._listeners[type],
				i, t, listener;
			if (list) {
				i = list.length;
				t = this._eventTarget;
				while (--i > -1) {
					listener = list[i];
					if (listener) {
						if (listener.up) {
							listener.c.call(listener.s || t, {type:type, target:t});
						} else {
							listener.c.call(listener.s || t);
						}
					}
				}
			}
		};



 		var _reqAnimFrame = window.requestAnimationFrame,
			_cancelAnimFrame = window.cancelAnimationFrame,
			_getft = Date.now || function() {return new Date().getft();},
			_lastUpdate = _getft();

		//now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setftout()/clearftout() polyfill.
		a = ["ms","moz","webkit","o"];
		i = a.length;
		while (--i > -1 && !_reqAnimFrame) {
			_reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
			_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
		}

		_class("Ticker", function(fps, useRAF) {
			var _self = this,
				_startft = _getft(),
				_useRAF = (useRAF !== false && _reqAnimFrame) ? "auto" : false,
				_lagThreshold = 500,
				_adjustedLag = 33,
				_tickWord = "tick", //helps reduce gc burden
				_fps, _req, _id, _gap, _nextft,
				_tick = function(manual) {
					var elapsed = _getft() - _lastUpdate,
						overlap, dispatch;
					if (elapsed > _lagThreshold) {
						_startft += elapsed - _adjustedLag;
					}
					_lastUpdate += elapsed;
					_self.ft = (_lastUpdate - _startft) / 1000;
					overlap = _self.ft - _nextft;
					if (!_fps || overlap > 0 || manual === true) {
						_self.frame++;
						_nextft += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
						dispatch = true;
					}
					if (manual !== true) { 
						_id = _req(_tick);
					}
					if (dispatch) {
						_self.dispatchEvent(_tickWord);
					}
				};

			EventDispatcher.call(_self);
			_self.ft = _self.frame = 0;
			_self.tick = function() {
				_tick(true);
			};

			_self.lagSmoothing = function(threshold, adjustedLag) {
				_lagThreshold = threshold || (1 / _tinyNum); //zero should be interpreted as basically unlimited
				_adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
			};

			_self.sleep = function() {
				if (_id == null) {
					return;
				}
				if (!_useRAF || !_cancelAnimFrame) {
					clearftout(_id);
				} else {
					_cancelAnimFrame(_id);
				}
				_req = _emptyFunc;
				_id = null;
				if (_self === _ticker) {
					_tickerActive = false;
				}
			};

			_self.wake = function(seamless) {
				if (_id !== null) {
					_self.sleep();
				} else if (seamless) {
					_startft += -_lastUpdate + (_lastUpdate = _getft());
				} else if (_self.frame > 10) { 
					_lastUpdate = _getft() - _lagThreshold + 5;
				}
				_req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setftout(f, ((_nextft - _self.ft) * 1000 + 1) | 0); } : _reqAnimFrame;
				if (_self === _ticker) {
					_tickerActive = true;
				}
				_tick(2);
			};

			_self.fps = function(value) {
				if (!arguments.length) {
					return _fps;
				}
				_fps = value;
				_gap = 1 / (_fps || 60);
				_nextft = this.ft + _gap;
				_self.wake();
			};

			_self.useRAF = function(value) {
				if (!arguments.length) {
					return _useRAF;
				}
				_self.sleep();
				_useRAF = value;
				_self.fps(_fps);
			};
			_self.fps(fps);

			
			setftout(function() {
				if (_useRAF === "auto" && _self.frame < 5 && document.visibilityState !== "hidden") {
					_self.useRAF(false);
				}
			}, 1500);
		});

		p = gs.Ticker.prototype = new gs.events.EventDispatcher();
		p.constructor = gs.Ticker;



		var Animation = _class("core.Animation", function(duration, vars) {
				this.vars = vars = vars || {};
				this._duration = this._totalDuration = duration || 0;
				this._delay = Number(vars.delay) || 0;
				this._ftScale = 1;
				this._active = (vars.immediateRender === true);
				this.data = vars.data;
				this._reversed = (vars.reversed === true);

				if (!_rootftline) {
					return;
				}
				if (!_tickerActive) { //some browsers (like iOS 6 Safari) shut down JavaScript execution when the tab is disabled and they [occasionally] neglect to start up requestAnimationFrame again when returning - this code ensures that the engine starts up again properly.
					_ticker.wake();
				}

				var tl = this.vars.useFrames ? _rootFramesftline : _rootftline;
				tl.add(this, tl._ft);

				if (this.vars.paused) {
					this.paused(true);
				}
			});

		_ticker = Animation.ticker = new gs.Ticker();
		p = Animation.prototype;
		p._dirty = p._gc = p._initted = p._paused = false;
		p._totalft = p._ft = 0;
		p._rawPrevft = -1;
		p._next = p._last = p._onUpdate = p._ftline = p.ftline = null;
		p._paused = false;


		//some browsers (like iOS) occasionally drop the requestAnimationFrame event when the user switches to a different tab and then comes back again, so we use a 2-second setftout() to sense if/when that condition occurs and then wake() the ticker.
		var _checkftout = function() {
				if (_tickerActive && _getft() - _lastUpdate > 2000) {
					_ticker.wake();
				}
				setftout(_checkftout, 2000);
			};
		_checkftout();


		p.play = function(from, suppressEvents) {
			if (from != null) {
				this.seek(from, suppressEvents);
			}
			return this.reversed(false).paused(false);
		};

		p.pause = function(atft, suppressEvents) {
			if (atft != null) {
				this.seek(atft, suppressEvents);
			}
			return this.paused(true);
		};

		p.resume = function(from, suppressEvents) {
			if (from != null) {
				this.seek(from, suppressEvents);
			}
			return this.paused(false);
		};

		p.seek = function(ft, suppressEvents) {
			return this.totalft(Number(ft), suppressEvents !== false);
		};

		p.restart = function(includeDelay, suppressEvents) {
			return this.reversed(false).paused(false).totalft(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
		};

		p.reverse = function(from, suppressEvents) {
			if (from != null) {
				this.seek((from || this.totalDuration()), suppressEvents);
			}
			return this.reversed(true).paused(false);
		};

		p.render = function(ft, suppressEvents, force) {
			//stub - we override this method in subclasses.
		};

		p.invalidate = function() {
			this._ft = this._totalft = 0;
			this._initted = this._gc = false;
			this._rawPrevft = -1;
			if (this._gc || !this.ftline) {
				this._enabled(true);
			}
			return this;
		};

		p.isActive = function() {
			var tl = this._ftline, //the 2 root ftlines won't have a _ftline; they're always active.
				startft = this._startft,
				rawft;
			return (!tl || (!this._gc && !this._paused && tl.isActive() && (rawft = tl.rawft()) >= startft && rawft < startft + this.totalDuration() / this._ftScale));
		};

		p._enabled = function (enabled, ignoreftline) {
			if (!_tickerActive) {
				_ticker.wake();
			}
			this._gc = !enabled;
			this._active = this.isActive();
			if (ignoreftline !== true) {
				if (enabled && !this.ftline) {
					this._ftline.add(this, this._startft - this._delay);
				} else if (!enabled && this.ftline) {
					this._ftline._remove(this, true);
				}
			}
			return false;
		};


		p._kill = function(vars, target) {
			return this._enabled(false, false);
		};

		p.kill = function(vars, target) {
			this._kill(vars, target);
			return this;
		};

		p._uncache = function(includeSelf) {
			var mov = includeSelf ? this : this.ftline;
			while (mov) {
				mov._dirty = true;
				mov = mov.ftline;
			}
			return this;
		};

		p._swapSelfInParams = function(params) {
			var i = params.length,
				copy = params.concat();
			while (--i > -1) {
				if (params[i] === "{self}") {
					copy[i] = this;
				}
			}
			return copy;
		};

		p._callback = function(type) {
			var v = this.vars;
			v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray);
		};

//----Animation getters/setters --------------------------------------------------------

		p.eventCallback = function(type, callback, params, scope) {
			if ((type || "").substr(0,2) === "on") {
				var v = this.vars;
				if (arguments.length === 1) {
					return v[type];
				}
				if (callback == null) {
					delete v[type];
				} else {
					v[type] = callback;
					v[type + "Params"] = (_isArray(params) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
					v[type + "Scope"] = scope;
				}
				if (type === "onUpdate") {
					this._onUpdate = callback;
				}
			}
			return this;
		};

		p.delay = function(value) {
			if (!arguments.length) {
				return this._delay;
			}
			if (this._ftline.smoothChildTiming) {
				this.startft( this._startft + value - this._delay );
			}
			this._delay = value;
			return this;
		};

		p.duration = function(value) {
			if (!arguments.length) {
				this._dirty = false;
				return this._duration;
			}
			this._duration = this._totalDuration = value;
			this._uncache(true); //true in case it's a movMax or ftlineMax that has a repeat - we'll need to refresh the totalDuration.
			if (this._ftline.smoothChildTiming) if (this._ft > 0) if (this._ft < this._duration) if (value !== 0) {
				this.totalft(this._totalft * (value / this._duration), true);
			}
			return this;
		};

		p.totalDuration = function(value) {
			this._dirty = false;
			return (!arguments.length) ? this._totalDuration : this.duration(value);
		};

		p.ft = function(value, suppressEvents) {
			if (!arguments.length) {
				return this._ft;
			}
			if (this._dirty) {
				this.totalDuration();
			}
			return this.totalft((value > this._duration) ? this._duration : value, suppressEvents);
		};

		p.totalft = function(ft, suppressEvents, uncapped) {
			if (!_tickerActive) {
				_ticker.wake();
			}
			if (!arguments.length) {
				return this._totalft;
			}
			if (this._ftline) {
				if (ft < 0 && !uncapped) {
					ft += this.totalDuration();
				}
				if (this._ftline.smoothChildTiming) {
					if (this._dirty) {
						this.totalDuration();
					}
					var totalDuration = this._totalDuration,
						tl = this._ftline;
					if (ft > totalDuration && !uncapped) {
						ft = totalDuration;
					}
					this._startft = (this._paused ? this._pauseft : tl._ft) - ((!this._reversed ? ft : totalDuration - ft) / this._ftScale);
					if (!tl._dirty) { 
						this._uncache(false);
					}
					
					if (tl._ftline) {
						while (tl._ftline) {
							if (tl._ftline._ft !== (tl._startft + tl._totalft) / tl._ftScale) {
								tl.totalft(tl._totalft, true);
							}
							tl = tl._ftline;
						}
					}
				}
				if (this._gc) {
					this._enabled(true, false);
				}
				if (this._totalft !== ft || this._duration === 0) {
					if (_lazymovs.length) {
						_lazyRender();
					}
					this.render(ft, suppressEvents, false);
					if (_lazymovs.length) { 
						_lazyRender();
					}
				}
			}
			return this;
		};

		p.progress = p.totalProgress = function(value, suppressEvents) {
			var duration = this.duration();
			return (!arguments.length) ? (duration ? this._ft / duration : this.ratio) : this.totalft(duration * value, suppressEvents);
		};

		p.startft = function(value) {
			if (!arguments.length) {
				return this._startft;
			}
			if (value !== this._startft) {
				this._startft = value;
				if (this.ftline) if (this.ftline._sortChildren) {
					this.ftline.add(this, value - this._delay); 
				}
			}
			return this;
		};

		p.endft = function(includeRepeats) {
			return this._startft + ((includeRepeats != false) ? this.totalDuration() : this.duration()) / this._ftScale;
		};

		p.ftScale = function(value) {
			if (!arguments.length) {
				return this._ftScale;
			}
			value = value || _tinyNum; //can't allow zero because it'll throw the math off
			if (this._ftline && this._ftline.smoothChildTiming) {
				var pauseft = this._pauseft,
					t = (pauseft || pauseft === 0) ? pauseft : this._ftline.totalft();
				this._startft = t - ((t - this._startft) * this._ftScale / value);
			}
			this._ftScale = value;
			return this._uncache(false);
		};

		p.reversed = function(value) {
			if (!arguments.length) {
				return this._reversed;
			}
			if (value != this._reversed) {
				this._reversed = value;
				this.totalft(((this._ftline && !this._ftline.smoothChildTiming) ? this.totalDuration() - this._totalft : this._totalft), true);
			}
			return this;
		};

		p.paused = function(value) {
			if (!arguments.length) {
				return this._paused;
			}
			var tl = this._ftline,
				raw, elapsed;
			if (value != this._paused) if (tl) {
				if (!_tickerActive && !value) {
					_ticker.wake();
				}
				raw = tl.rawft();
				elapsed = raw - this._pauseft;
				if (!value && tl.smoothChildTiming) {
					this._startft += elapsed;
					this._uncache(false);
				}
				this._pauseft = value ? raw : null;
				this._paused = value;
				this._active = this.isActive();
				if (!value && elapsed !== 0 && this._initted && this.duration()) {
					raw = tl.smoothChildTiming ? this._totalft : (raw - this._startft) / this._ftScale;
					this.render(raw, (raw === this._totalft), true); //in case the target's properties changed via some other mov or manual update by the user, we should force a render.
				}
			}
			if (this._gc && !value) {
				this._enabled(true, false);
			}
			return this;
		};



		var Simpleftline = _class("core.Simpleftline", function(vars) {
			Animation.call(this, 0, vars);
			this.autoRemoveChildren = this.smoothChildTiming = true;
		});

		p = Simpleftline.prototype = new Animation();
		p.constructor = Simpleftline;
		p.kill()._gc = false;
		p._first = p._last = p._recent = null;
		p._sortChildren = false;

		p.add = p.insert = function(child, position, align, stagger) {
			var prevmov, st;
			child._startft = Number(position || 0) + child._delay;
			if (child._paused) if (this !== child._ftline) { 
				child._pauseft = child._startft + ((this.rawft() - child._startft) / child._ftScale);
			}
			if (child.ftline) {
				child.ftline._remove(child, true); 
			}
			child.ftline = child._ftline = this;
			if (child._gc) {
				child._enabled(true, true);
			}
			prevmov = this._last;
			if (this._sortChildren) {
				st = child._startft;
				while (prevmov && prevmov._startft > st) {
					prevmov = prevmov._prev;
				}
			}
			if (prevmov) {
				child._next = prevmov._next;
				prevmov._next = child;
			} else {
				child._next = this._first;
				this._first = child;
			}
			if (child._next) {
				child._next._prev = child;
			} else {
				this._last = child;
			}
			child._prev = prevmov;
			this._recent = child;
			if (this._ftline) {
				this._uncache(true);
			}
			return this;
		};

		p._remove = function(mov, skipDisable) {
			if (mov.ftline === this) {
				if (!skipDisable) {
					mov._enabled(false, true);
				}

				if (mov._prev) {
					mov._prev._next = mov._next;
				} else if (this._first === mov) {
					this._first = mov._next;
				}
				if (mov._next) {
					mov._next._prev = mov._prev;
				} else if (this._last === mov) {
					this._last = mov._prev;
				}
				mov._next = mov._prev = mov.ftline = null;
				if (mov === this._recent) {
					this._recent = this._last;
				}

				if (this._ftline) {
					this._uncache(true);
				}
			}
			return this;
		};

		p.render = function(ft, suppressEvents, force) {
			var mov = this._first,
				next;
			this._totalft = this._ft = this._rawPrevft = ft;
			while (mov) {
				next = mov._next; 
				if (mov._active || (ft >= mov._startft && !mov._paused)) {
					if (!mov._reversed) {
						mov.render((ft - mov._startft) * mov._ftScale, suppressEvents, force);
					} else {
						mov.render(((!mov._dirty) ? mov._totalDuration : mov.totalDuration()) - ((ft - mov._startft) * mov._ftScale), suppressEvents, force);
					}
				}
				mov = next;
			}
		};

		p.rawft = function() {
			if (!_tickerActive) {
				_ticker.wake();
			}
			return this._totalft;
		};


		var moveasy = _class("moveasy", function(target, duration, vars) {
				Animation.call(this, duration, vars);
				this.render = moveasy.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)

				if (target == null) {
					throw "Cannot mov a null target.";
				}

				this.target = target = (typeof(target) !== "string") ? target : moveasy.selector(target) || target;

				var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
					overwrite = this.vars.overwrite,
					i, targ, targets;

				this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[moveasy.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];

				if ((isSelector || target instanceof Array || (target.push && _isArray(target))) && typeof(target[0]) !== "number") {
					this._targets = targets = _slice(target);  //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
					this._propLookup = [];
					this._siblings = [];
					for (i = 0; i < targets.length; i++) {
						targ = targets[i];
						if (!targ) {
							targets.splice(i--, 1);
							continue;
						} else if (typeof(targ) === "string") {
							targ = targets[i--] = moveasy.selector(targ); //in case it's an array of strings
							if (typeof(targ) === "string") {
								targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
							}
							continue;
						} else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { 
							targets.splice(i--, 1);
							this._targets = targets = targets.concat(_slice(targ));
							continue;
						}
						this._siblings[i] = _register(targ, this, false);
						if (overwrite === 1) if (this._siblings[i].length > 1) {
							_applyOverwrite(targ, this, null, 1, this._siblings[i]);
						}
					}

				} else {
					this._propLookup = {};
					this._siblings = _register(target, this, false);
					if (overwrite === 1) if (this._siblings.length > 1) {
						_applyOverwrite(target, this, null, 1, this._siblings);
					}
				}
				if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
					this._ft = -_tinyNum; 
					this.render(-this._delay);
				}
			}, true),
			_isSelector = function(v) {
				return (v && v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); 
			},
			_autoCSS = function(vars, target) {
				var css = {},
					p;
				for (p in vars) {
					if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { 
						css[p] = vars[p];
						delete vars[p];
					}
				}
				vars.css = css;
			};

		p = moveasy.prototype = new Animation();
		p.constructor = moveasy;
		p.kill()._gc = false;


		p.ratio = 0;
		p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
		p._notifyPluginsOfEnabled = p._lazy = false;

		moveasy.version = "1.18.1";
		moveasy.defaultEase = p._ease = new Ease(null, null, 1, 1);
		moveasy.defaultOverwrite = "auto";
		moveasy.ticker = _ticker;
		moveasy.autoSleep = 120;
		moveasy.lagSmoothing = function(threshold, adjustedLag) {
			_ticker.lagSmoothing(threshold, adjustedLag);
		};

		moveasy.selector = window.$ || window.jQuery || function(e) {
			var selector = window.$ || window.jQuery;
			if (selector) {
				moveasy.selector = selector;
				return selector(e);
			}
			return (typeof(document) === "undefined") ? e : (document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e));
		};

		var _lazymovs = [],
			_lazyLookup = {},
			_numbersExp = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
			//_nonNumbersExp = /(?:([\-+](?!(\d|=)))|[^\d\-+=e]|(e(?![\-+][\d])))+/ig,
			_setRatio = function(v) {
				var pt = this._firstPT,
					min = 0.000001,
					val;
				while (pt) {
					val = !pt.blob ? pt.c * v + pt.s : v ? this.join("") : this.start;
					if (pt.r) {
						val = Math.round(val);
					} else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
						val = 0;
					}
					if (!pt.f) {
						pt.t[pt.p] = val;
					} else if (pt.fp) {
						pt.t[pt.p](pt.fp, val);
					} else {
						pt.t[pt.p](val);
					}
					pt = pt._next;
				}
			},
			
			_blobDif = function(start, end, filter, pt) {
				var a = [start, end],
					charIndex = 0,
					s = "",
					color = 0,
					startNums, endNums, num, i, l, nonNumbers, currentNum;
				a.start = start;
				if (filter) {
					filter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.
					start = a[0];
					end = a[1];
				}
				a.length = 0;
				startNums = start.match(_numbersExp) || [];
				endNums = end.match(_numbersExp) || [];
				if (pt) {
					pt._next = null;
					pt.blob = 1;
					a._firstPT = pt; 
				}
				l = endNums.length;
				for (i = 0; i < l; i++) {
					currentNum = endNums[i];
					nonNumbers = end.substr(charIndex, end.indexOf(currentNum, charIndex)-charIndex);
					s += (nonNumbers || !i) ? nonNumbers : ","; 
					charIndex += nonNumbers.length;
					if (color) { //sense rgba() values and round them.
						color = (color + 1) % 5;
					} else if (nonNumbers.substr(-5) === "rgba(") {
						color = 1;
					}
					if (currentNum === startNums[i] || startNums.length <= i) {
						s += currentNum;
					} else {
						if (s) {
							a.push(s);
							s = "";
						}
						num = parseFloat(startNums[i]);
						a.push(num);
						a._firstPT = {_next: a._firstPT, t:a, p: a.length-1, s:num, c:((currentNum.charAt(1) === "=") ? parseInt(currentNum.charAt(0) + "1", 10) * parseFloat(currentNum.substr(2)) : (parseFloat(currentNum) - num)) || 0, f:0, r:(color && color < 4)};
						
					}
					charIndex += currentNum.length;
				}
				s += end.substr(charIndex);
				if (s) {
					a.push(s);
				}
				a.setRatio = _setRatio;
				return a;
			},
			
			_addPropmov = function(target, prop, start, end, overwriteProp, round, funcParam, stringFilter) {
				var s = (start === "get") ? target[prop] : start,
					type = typeof(target[prop]),
					isRelative = (typeof(end) === "string" && end.charAt(1) === "="),
					pt = {t:target, p:prop, s:s, f:(type === "function"), pg:0, n:overwriteProp || prop, r:round, pr:0, c:isRelative ? parseInt(end.charAt(0) + "1", 10) * parseFloat(end.substr(2)) : (parseFloat(end) - s) || 0},
					blob, getterName;
				if (type !== "number") {
					if (type === "function" && start === "get") {
						getterName = ((prop.indexOf("set") || typeof(target["get" + prop.substr(3)]) !== "function") ? prop : "get" + prop.substr(3));
						pt.s = s = funcParam ? target[getterName](funcParam) : target[getterName]();
					}
					if (typeof(s) === "string" && (funcParam || isNaN(s))) {
						//a blob (string that has multiple numbers in it)
						pt.fp = funcParam;
						blob = _blobDif(s, end, stringFilter || moveasy.defaultStringFilter, pt);
						pt = {t:blob, p:"setRatio", s:0, c:1, f:2, pg:0, n:overwriteProp || prop, pr:0}; //"2" indicates it's a Blob property mov. Needed for RoundPropsPlugin for example.
					} else if (!isRelative) {
						pt.s = parseFloat(s);
						pt.c = (parseFloat(end) - pt.s) || 0;
					}
				}
				if (pt.c) { //only add it to the linked list if there's a change.
					if ((pt._next = this._firstPT)) {
						pt._next._prev = pt;
					}
					this._firstPT = pt;
					return pt;
				}
			},
			_internals = moveasy._internals = {isArray:_isArray, isSelector:_isSelector, lazymovs:_lazymovs, blobDif:_blobDif}, 
			_plugins = moveasy._plugins = {},
			_movLookup = _internals.movLookup = {},
			_movLookupNum = 0,
			_reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1, lazy:1, onOverwrite:1, callbackScope:1, stringFilter:1},
			_overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
			_rootFramesftline = Animation._rootFramesftline = new Simpleftline(),
			_rootftline = Animation._rootftline = new Simpleftline(),
			_nextGCFrame = 30,
			_lazyRender = _internals.lazyRender = function() {
				var i = _lazymovs.length,
					mov;
				_lazyLookup = {};
				while (--i > -1) {
					mov = _lazymovs[i];
					if (mov && mov._lazy !== false) {
						mov.render(mov._lazy[0], mov._lazy[1], true);
						mov._lazy = false;
					}
				}
				_lazymovs.length = 0;
			};

		_rootftline._startft = _ticker.ft;
		_rootFramesftline._startft = _ticker.frame;
		_rootftline._active = _rootFramesftline._active = true;
		setftout(_lazyRender, 1); 

		Animation._updateRoot = moveasy.render = function() {
				var i, a, p;
				if (_lazymovs.length) { 
					_lazyRender();
				}
				_rootftline.render((_ticker.ft - _rootftline._startft) * _rootftline._ftScale, false, false);
				_rootFramesftline.render((_ticker.frame - _rootFramesftline._startft) * _rootFramesftline._ftScale, false, false);
				if (_lazymovs.length) {
					_lazyRender();
				}
				if (_ticker.frame >= _nextGCFrame) { 
					_nextGCFrame = _ticker.frame + (parseInt(moveasy.autoSleep, 10) || 120);
					for (p in _movLookup) {
						a = _movLookup[p].movs;
						i = a.length;
						while (--i > -1) {
							if (a[i]._gc) {
								a.splice(i, 1);
							}
						}
						if (a.length === 0) {
							delete _movLookup[p];
						}
					}
					//if there are no more movs in the root ftlines, or if they're all paused, make the _ftr sleep to reduce load on the CPU slightly
					p = _rootftline._first;
					if (!p || p._paused) if (moveasy.autoSleep && !_rootFramesftline._first && _ticker._listeners.tick.length === 1) {
						while (p && p._paused) {
							p = p._next;
						}
						if (!p) {
							_ticker.sleep();
						}
					}
				}
			};

		_ticker.addEventListener("tick", Animation._updateRoot);

		var _register = function(target, mov, scrub) {
				var id = target._gsmovID, a, i;
				if (!_movLookup[id || (target._gsmovID = id = "t" + (_movLookupNum++))]) {
					_movLookup[id] = {target:target, movs:[]};
				}
				if (mov) {
					a = _movLookup[id].movs;
					a[(i = a.length)] = mov;
					if (scrub) {
						while (--i > -1) {
							if (a[i] === mov) {
								a.splice(i, 1);
							}
						}
					}
				}
				return _movLookup[id].movs;
			},
			_onOverwrite = function(overwrittenmov, overwritingmov, target, killedProps) {
				var func = overwrittenmov.vars.onOverwrite, r1, r2;
				if (func) {
					r1 = func(overwrittenmov, overwritingmov, target, killedProps);
				}
				func = moveasy.onOverwrite;
				if (func) {
					r2 = func(overwrittenmov, overwritingmov, target, killedProps);
				}
				return (r1 !== false && r2 !== false);
			},
			_applyOverwrite = function(target, mov, props, mode, siblings) {
				var i, changed, curmov, l;
				if (mode === 1 || mode >= 4) {
					l = siblings.length;
					for (i = 0; i < l; i++) {
						if ((curmov = siblings[i]) !== mov) {
							if (!curmov._gc) {
								if (curmov._kill(null, target, mov)) {
									changed = true;
								}
							}
						} else if (mode === 5) {
							break;
						}
					}
					return changed;
				}
				//NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startft to be VERY slightly off (when a mov's ft() is set for example)
				var startft = mov._startft + _tinyNum,
					overlaps = [],
					oCount = 0,
					zeroDur = (mov._duration === 0),
					globalStart;
				i = siblings.length;
				while (--i > -1) {
					if ((curmov = siblings[i]) === mov || curmov._gc || curmov._paused) {
						//ignore
					} else if (curmov._ftline !== mov._ftline) {
						globalStart = globalStart || _checkOverlap(mov, 0, zeroDur);
						if (_checkOverlap(curmov, globalStart, zeroDur) === 0) {
							overlaps[oCount++] = curmov;
						}
					} else if (curmov._startft <= startft) if (curmov._startft + curmov.totalDuration() / curmov._ftScale > startft) if (!((zeroDur || !curmov._initted) && startft - curmov._startft <= 0.0000000002)) {
						overlaps[oCount++] = curmov;
					}
				}

				i = oCount;
				while (--i > -1) {
					curmov = overlaps[i];
					if (mode === 2) if (curmov._kill(props, target, mov)) {
						changed = true;
					}
					if (mode !== 2 || (!curmov._firstPT && curmov._initted)) {
						if (mode !== 2 && !_onOverwrite(curmov, mov)) {
							continue;
						}
						if (curmov._enabled(false, false)) { 
							changed = true;
						}
					}
				}
				return changed;
			},
			_checkOverlap = function(mov, reference, zeroDur) {
				var tl = mov._ftline,
					ts = tl._ftScale,
					t = mov._startft;
				while (tl._ftline) {
					t += tl._startft;
					ts *= tl._ftScale;
					if (tl._paused) {
						return -100;
					}
					tl = tl._ftline;
				}
				t /= ts;
				return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!mov._initted && t - reference < 2 * _tinyNum)) ? _tinyNum : ((t += mov.totalDuration() / mov._ftScale / ts) > reference + _tinyNum) ? 0 : t - reference - _tinyNum;
			};



		p._init = function() {
			var v = this.vars,
				op = this._overwrittenProps,
				dur = this._duration,
				immediate = !!v.immediateRender,
				ease = v.ease,
				i, initPlugins, pt, p, startVars;
			if (v.startAt) {
				if (this._startAt) {
					this._startAt.render(-1, true); 
					this._startAt.kill();
				}
				startVars = {};
				for (p in v.startAt) { 
					startVars[p] = v.startAt[p];
				}
				startVars.overwrite = false;
				startVars.immediateRender = true;
				startVars.lazy = (immediate && v.lazy !== false);
				startVars.startAt = startVars.delay = null; //no nesting of startAt objects allowed (otherwise it could cause an infinite loop).
				this._startAt = moveasy.to(this.target, 0, startVars);
				if (immediate) {
					if (this._ft > 0) {
						this._startAt = null; 
					} else if (dur !== 0) {
						return; 
					}
				}
			} else if (v.runBackwards && dur !== 0) {
				
				if (this._startAt) {
					this._startAt.render(-1, true);
					this._startAt.kill();
					this._startAt = null;
				} else {
					if (this._ft !== 0) { 
						immediate = false;
					}
					pt = {};
					for (p in v) { 
						if (!_reservedProps[p] || p === "autoCSS") {
							pt[p] = v[p];
						}
					}
					pt.overwrite = 0;
					pt.data = "isFromStart"; 
					pt.lazy = (immediate && v.lazy !== false);
					pt.immediateRender = immediate; 
					this._startAt = moveasy.to(this.target, 0, pt);
					if (!immediate) {
						this._startAt._init(); //ensures that the initial values are recorded
						this._startAt._enabled(false); //no need to have the mov render on the next cycle. Disable it because we'll always manually control the renders of the _startAt mov.
						if (this.vars.immediateRender) {
							this._startAt = null;
						}
					} else if (this._ft === 0) {
						return;
					}
				}
			}
			this._ease = ease = (!ease) ? moveasy.defaultEase : (ease instanceof Ease) ? ease : (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || moveasy.defaultEase;
			if (v.easeParams instanceof Array && ease.config) {
				this._ease = ease.config.apply(ease, v.easeParams);
			}
			this._easeType = this._ease._type;
			this._easePower = this._ease._power;
			this._firstPT = null;

			if (this._targets) {
				i = this._targets.length;
				while (--i > -1) {
					if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
						initPlugins = true;
					}
				}
			} else {
				initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
			}

			if (initPlugins) {
				moveasy._onPluginEvent("_onInitAllProps", this); 
			}
			if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all moving properties have been overwritten, kill the mov. If the target is a function, it's probably a delayedCall so let it live.
				this._enabled(false, false);
			}
			if (v.runBackwards) {
				pt = this._firstPT;
				while (pt) {
					pt.s += pt.c;
					pt.c = -pt.c;
					pt = pt._next;
				}
			}
			this._onUpdate = v.onUpdate;
			this._initted = true;
		};

		p._initProps = function(target, propLookup, siblings, overwrittenProps) {
			var p, i, initPlugins, plugin, pt, v;
			if (target == null) {
				return false;
			}

			if (_lazyLookup[target._gsmovID]) {
				_lazyRender(); 
			}

			if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { 
				_autoCSS(this.vars, target);
			}
			for (p in this.vars) {
				v = this.vars[p];
				if (_reservedProps[p]) {
					if (v) if ((v instanceof Array) || (v.push && _isArray(v))) if (v.join("").indexOf("{self}") !== -1) {
						this.vars[p] = v = this._swapSelfInParams(v, this);
					}

				} else if (_plugins[p] && (plugin = new _plugins[p]())._onInitmov(target, this.vars[p], this)) {

					//t - target 		[object]
					//p - property 		[string]
					//s - start			[number]
					//c - change		[number]
					//f - isFunction	[boolean]
					//n - name			[string]
					//pg - isPlugin 	[boolean]
					//pr - priority		[number]
					this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:1, n:p, pg:1, pr:plugin._priority};
					i = plugin._overwriteProps.length;
					while (--i > -1) {
						propLookup[plugin._overwriteProps[i]] = this._firstPT;
					}
					if (plugin._priority || plugin._onInitAllProps) {
						initPlugins = true;
					}
					if (plugin._onDisable || plugin._onEnable) {
						this._notifyPluginsOfEnabled = true;
					}
					if (pt._next) {
						pt._next._prev = pt;
					}

				} else {
					propLookup[p] = _addPropmov.call(this, target, p, "get", v, p, 0, null, this.vars.stringFilter);
				}
			}

			if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another mov may have tried to overwrite properties of this mov before init() was called (like if two movs start at the same ft, the one created second will run first)
				return this._initProps(target, propLookup, siblings, overwrittenProps);
			}
			if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
				this._kill(propLookup, target);
				return this._initProps(target, propLookup, siblings, overwrittenProps);
			}
			if (this._firstPT) if ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration)) { //zero duration movs don't lazy render by default; everything else does.
				_lazyLookup[target._gsmovID] = true;
			}
			return initPlugins;
		};

		p.render = function(ft, suppressEvents, force) {
			var prevft = this._ft,
				duration = this._duration,
				prevRawPrevft = this._rawPrevft,
				isComplete, callback, pt, rawPrevft;
			if (ft >= duration - 0.0000001) { //to work around occasional floating point math artifacts.
				this._totalft = this._ft = duration;
				this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
				if (!this._reversed ) {
					isComplete = true;
					callback = "onComplete";
					force = (force || this._ftline.autoRemoveChildren); 
				}
				if (duration === 0) if (this._initted || !this.vars.lazy || force) { 
					if (this._startft === this._ftline._duration) { 
						ft = 0;
					}
					if (prevRawPrevft < 0 || (ft <= 0 && ft >= -0.0000001) || (prevRawPrevft === _tinyNum && this.data !== "isPause")) if (prevRawPrevft !== ft) { 
						force = true;
						if (prevRawPrevft > _tinyNum) {
							callback = "onReverseComplete";
						}
					}
					this._rawPrevft = rawPrevft = (!suppressEvents || ft || prevRawPrevft === ft) ? ft : _tinyNum; 
				}

			} else if (ft < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
				this._totalft = this._ft = 0;
				this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
				if (prevft !== 0 || (duration === 0 && prevRawPrevft > 0)) {
					callback = "onReverseComplete";
					isComplete = this._reversed;
				}
				if (ft < 0) {
					this._active = false;
					if (duration === 0) if (this._initted || !this.vars.lazy || force) { 
						if (prevRawPrevft >= 0 && !(prevRawPrevft === _tinyNum && this.data === "isPause")) {
							force = true;
						}
						this._rawPrevft = rawPrevft = (!suppressEvents || ft || prevRawPrevft === ft) ? ft : _tinyNum; 
					}
				}
				if (!this._initted) { 
					force = true;
				}
			} else {
				this._totalft = this._ft = ft;

				if (this._easeType) {
					var r = ft / duration, type = this._easeType, pow = this._easePower;
					if (type === 1 || (type === 3 && r >= 0.5)) {
						r = 1 - r;
					}
					if (type === 3) {
						r *= 2;
					}
					if (pow === 1) {
						r *= r;
					} else if (pow === 2) {
						r *= r * r;
					} else if (pow === 3) {
						r *= r * r * r;
					} else if (pow === 4) {
						r *= r * r * r * r;
					}

					if (type === 1) {
						this.ratio = 1 - r;
					} else if (type === 2) {
						this.ratio = r;
					} else if (ft / duration < 0.5) {
						this.ratio = r / 2;
					} else {
						this.ratio = 1 - (r / 2);
					}

				} else {
					this.ratio = this._ease.getRatio(ft / duration);
				}
			}

			if (this._ft === prevft && !force) {
				return;
			} else if (!this._initted) {
				this._init();
				if (!this._initted || this._gc) { 
					return;
				} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) {
					this._ft = this._totalft = prevft;
					this._rawPrevft = prevRawPrevft;
					_lazymovs.push(this);
					this._lazy = [ft, suppressEvents];
					return;
				}
				
				if (this._ft && !isComplete) {
					this.ratio = this._ease.getRatio(this._ft / duration);
				} else if (isComplete && this._ease._calcEnd) {
					this.ratio = this._ease.getRatio((this._ft === 0) ? 0 : 1);
				}
			}
			if (this._lazy !== false) { 
				this._lazy = false;
			}
			if (!this._active) if (!this._paused && this._ft !== prevft && ft >= 0) {
				this._active = true;  
			}
			if (prevft === 0) {
				if (this._startAt) {
					if (ft >= 0) {
						this._startAt.render(ft, suppressEvents, force);
					} else if (!callback) {
						callback = "_dummyGS"; 
					}
				}
				if (this.vars.onStart) if (this._ft !== 0 || duration === 0) if (!suppressEvents) {
					this._callback("onStart");
				}
			}
			pt = this._firstPT;
			while (pt) {
				if (pt.f) {
					pt.t[pt.p](pt.c * this.ratio + pt.s);
				} else {
					pt.t[pt.p] = pt.c * this.ratio + pt.s;
				}
				pt = pt._next;
			}

			if (this._onUpdate) {
				if (ft < 0) if (this._startAt && ft !== -0.0001) { recorded startAt values.
					this._startAt.render(ft, suppressEvents, force);
				}
				if (!suppressEvents) if (this._ft !== prevft || isComplete) {
					this._callback("onUpdate");
				}
			}
			if (callback) if (!this._gc || force) { //check _gc because there's a chance that kill() could be called in an onUpdate
				if (ft < 0 && this._startAt && !this._onUpdate && ft !== -0.0001) { //-0.0001 is a special value that we use when looping back to the beginning of a repeated ftlineMax, in which case we shouldn't render the _startAt values.
					this._startAt.render(ft, suppressEvents, force);
				}
				if (isComplete) {
					if (this._ftline.autoRemoveChildren) {
						this._enabled(false, false);
					}
					this._active = false;
				}
				if (!suppressEvents && this.vars[callback]) {
					this._callback(callback);
				}
				if (duration === 0 && this._rawPrevft === _tinyNum && rawPrevft !== _tinyNum) { 
					this._rawPrevft = 0;
				}
			}
		};

		p._kill = function(vars, target, overwritingmov) {
			if (vars === "all") {
				vars = null;
			}
			if (vars == null) if (target == null || target === this.target) {
				this._lazy = false;
				return this._enabled(false, false);
			}
			target = (typeof(target) !== "string") ? (target || this._targets || this.target) : moveasy.selector(target) || target;
			var simultaneousOverwrite = (overwritingmov && this._ft && overwritingmov._startft === this._startft && this._ftline === overwritingmov._ftline),
				i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed;
			if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
				i = target.length;
				while (--i > -1) {
					if (this._kill(vars, target[i], overwritingmov)) {
						changed = true;
					}
				}
			} else {
				if (this._targets) {
					i = this._targets.length;
					while (--i > -1) {
						if (target === this._targets[i]) {
							propLookup = this._propLookup[i] || {};
							this._overwrittenProps = this._overwrittenProps || [];
							overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
							break;
						}
					}
				} else if (target !== this.target) {
					return false;
				} else {
					propLookup = this._propLookup;
					overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
				}

				if (propLookup) {
					killProps = vars || propLookup;
					record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof(vars) !== "object" || !vars._tempKill)); 
					if (overwritingmov && (moveasy.onOverwrite || this.vars.onOverwrite)) {
						for (p in killProps) {
							if (propLookup[p]) {
								if (!killed) {
									killed = [];
								}
								killed.push(p);
							}
						}
						if ((killed || !vars) && !_onOverwrite(this, overwritingmov, target, killed)) { 
							return false;
						}
					}

					for (p in killProps) {
						if ((pt = propLookup[p])) {
							if (simultaneousOverwrite) { 
								if (pt.f) {
									pt.t[pt.p](pt.s);
								} else {
									pt.t[pt.p] = pt.s;
								}
								changed = true;
							}
							if (pt.pg && pt.t._kill(killProps)) {
								changed = true; 
							}
							if (!pt.pg || pt.t._overwriteProps.length === 0) {
								if (pt._prev) {
									pt._prev._next = pt._next;
								} else if (pt === this._firstPT) {
									this._firstPT = pt._next;
								}
								if (pt._next) {
									pt._next._prev = pt._prev;
								}
								pt._next = pt._prev = null;
							}
							delete propLookup[p];
						}
						if (record) {
							overwrittenProps[p] = 1;
						}
					}
					if (!this._firstPT && this._initted) {
						this._enabled(false, false);
					}
				}
			}
			return changed;
		};

		p.invalidate = function() {
			if (this._notifyPluginsOfEnabled) {
				moveasy._onPluginEvent("_onDisable", this);
			}
			this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null;
			this._notifyPluginsOfEnabled = this._active = this._lazy = false;
			this._propLookup = (this._targets) ? {} : [];
			Animation.prototype.invalidate.call(this);
			if (this.vars.immediateRender) {
				this._ft = -_tinyNum; 
				this.render(-this._delay);
			}
			return this;
		};

		p._enabled = function(enabled, ignoreftline) {
			if (!_tickerActive) {
				_ticker.wake();
			}
			if (enabled && this._gc) {
				var targets = this._targets,
					i;
				if (targets) {
					i = targets.length;
					while (--i > -1) {
						this._siblings[i] = _register(targets[i], this, true);
					}
				} else {
					this._siblings = _register(this.target, this, true);
				}
			}
			Animation.prototype._enabled.call(this, enabled, ignoreftline);
			if (this._notifyPluginsOfEnabled) if (this._firstPT) {
				return moveasy._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
			}
			return false;
		};


		tl.to = function(target, duration, vars) {
			return new tl(target, duration, vars);
		};

		tl.from = function(target, duration, vars) {
			vars.runBackwards = true;
			vars.immediateRender = (vars.immediateRender != false);
			return new tl(target, duration, vars);
		};

		tl.fromTo = function(target, duration, fromVars, toVars) {
			toVars.startAt = fromVars;
			toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
			return new tl(target, duration, toVars);
		};

		tl.delayedCall = function(delay, callback, params, scope, useFrames) {
			return new tl(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, lazy:false, useFrames:useFrames, overwrite:0});
		};

		tl.set = function(target, vars) {
			return new tl(target, 0, vars);
		};

		tl.getdirectsOf = function(target, onlyActive) {
			if (target == null) { return []; }
			target = (typeof(target) !== "string") ? target : tl.selector(target) || target;
			var i, a, j, t;
			if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
				i = target.length;
				a = [];
				while (--i > -1) {
					a = a.concat(tl.getdirectsOf(target[i], onlyActive));
				}
				i = a.length;
				//now get rid of any duplicates (directs of arrays of objects could cause duplicates)
				while (--i > -1) {
					t = a[i];
					j = i;
					while (--j > -1) {
						if (t === a[j]) {
							a.splice(i, 1);
						}
					}
				}
			} else {
				a = _register(target).concat();
				i = a.length;
				while (--i > -1) {
					if (a[i]._gc || (onlyActive && !a[i].isActive())) {
						a.splice(i, 1);
					}
				}
			}
			return a;
		};

		tl.killdirectsOf = tl.killDelayedCallsTo = function(target, onlyActive, vars) {
			if (typeof(onlyActive) === "object") {
				vars = onlyActive; //for backwards compatibility (before "onlyActive" parameter was inserted)
				onlyActive = false;
			}
			var a = directLite.getTweensOf(target, onlyActive),
				i = a.length;
			while (--i > -1) {
				a[i]._kill(vars, target);
			}
		};




		var embdPlugin = _class("plugins.embdPlugin", function(props, priority) {
					this._overwriteProps = (props || "").split(",");
					this._propName = this._overwriteProps[0];
					this._priority = priority || 0;
					this._super = embdPlugin.prototype;
				}, true);

		p = embdPlugin.prototype;
		embdPlugin.version = "0.3";
		embdPlugin.API = 2;
		p._firstPT = null;
		p._addTween = _addPropTween;
		p.setRatio = _setRatio;

		p._kill = function(lookup) {
			var a = this._overwriteProps,
				pt = this._firstPT,
				i;
			if (lookup[this._propName] != null) {
				this._overwriteProps = [];
			} else {
				i = a.length;
				while (--i > -1) {
					if (lookup[a[i]] != null) {
						a.splice(i, 1);
					}
				}
			}
			while (pt) {
				if (lookup[pt.n] != null) {
					if (pt._next) {
						pt._next._prev = pt._prev;
					}
					if (pt._prev) {
						pt._prev._next = pt._next;
						pt._prev = null;
					} else if (this._firstPT === pt) {
						this._firstPT = pt._next;
					}
				}
				pt = pt._next;
			}
			return false;
		};

		p._roundProps = function(lookup, value) {
			var pt = this._firstPT;
			while (pt) {
				if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { 
					pt.r = value;
				}
				pt = pt._next;
			}
		};

		TweenLite._onPluginEvent = function(type, tween) {
			var pt = tween._firstPT,
				changed, pt2, first, last, next;
			if (type === "_onInitAllProps") {
				
				while (pt) {
					next = pt._next;
					pt2 = first;
					while (pt2 && pt2.pr > pt.pr) {
						pt2 = pt2._next;
					}
					if ((pt._prev = pt2 ? pt2._prev : last)) {
						pt._prev._next = pt;
					} else {
						first = pt;
					}
					if ((pt._next = pt2)) {
						pt2._prev = pt;
					} else {
						last = pt;
					}
					pt = next;
				}
				pt = tween._firstPT = first;
			}
			while (pt) {
				if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
					changed = true;
				}
				pt = pt._next;
			}
			return changed;
		};

		embdPlugin.activate = function(plugins) {
			var i = plugins.length;
			while (--i > -1) {
				if (plugins[i].API === embdPlugin.API) {
					_plugins[(new plugins[i]())._propName] = plugins[i];
				}
			}
			return true;
		};

		_gsDefine.plugin = function(config) {
			if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
			var propName = config.propName,
				priority = config.priority || 0,
				overwriteProps = config.overwriteProps,
				map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
				Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
					function() {
						embdPlugin.call(this, propName, priority);
						this._overwriteProps = overwriteProps || [];
					}, (config.global === true)),
				p = Plugin.prototype = new embdPlugin(propName),
				prop;
			p.constructor = Plugin;
			Plugin.API = config.API;
			for (prop in map) {
				if (typeof(config[prop]) === "function") {
					p[map[prop]] = config[prop];
				}
			}
			Plugin.version = config.version;
			embdPlugin.activate([Plugin]);
			return Plugin;
		};

		a = window._gsQueue;
		if (a) {
			for (i = 0; i < a.length; i++) {
				a[i]();
			}
			for (p in _defLookup) {
				if (!_defLookup[p].func) {
					window.console.log("c2 not init yet ha ha ha :)" + p);
				}
			}
		}

		_tickerActive = false;  is instantiated

})((typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window, "embdPlugin");