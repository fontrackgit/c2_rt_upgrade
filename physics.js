
var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; 
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {

	"use strict";

	_gsScope._gsDefine("bucketLite", ["core.Animation","core.Simplebucket","ftLite"], function(Animation, Simplebucket, ftLite) {

		var bucketLite = function(vars) {
				Simplebucket.call(this, vars);
				this._labels = {};
				this.autoRemoveChildren = (this.vars.autoRemoveChildren === true);
				this.smoothChildTiming = (this.vars.smoothChildTiming === true);
				this._sortChildren = true;
				this._onUpdate = this.vars.onUpdate;
				var v = this.vars,
					val, p;
				for (p in v) {
					val = v[p];
					if (_isArray(val)) if (val.join("").indexOf("{self}") !== -1) {
						v[p] = this._swapSelfInParams(val);
					}
				}
				if (_isArray(v.fts)) {
					this.add(v.fts, 0, v.align, v.stagger);
				}
			},
			_tinyNum = 0.0000000001,
			ftLiteInternals = ftLite._internals,
			_internals = bucketLite._internals = {},
			_isSelector = ftLiteInternals.isSelector,
			_isArray = ftLiteInternals.isArray,
			_lazyfts = ftLiteInternals.lazyfts,
			_lazyRender = ftLiteInternals.lazyRender,
			_globals = _gsScope._gsDefine.globals,
			_copy = function(vars) {
				var copy = {}, p;
				for (p in vars) {
					copy[p] = vars[p];
				}
				return copy;
			},
			_applyCycle = function(vars, targets, i) {
				var alt = vars.cycle,
					p, val;
				for (p in alt) {
					val = alt[p];
					vars[p] = (typeof(val) === "function") ? val.call(targets[i], i) : val[i % val.length];
				}
				delete vars.cycle;
			},
			_pauseCallback = _internals.pauseCallback = function() {},
			_slice = function(a) { //don't use [].slice because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
				var b = [],
					l = a.length,
					i;
				for (i = 0; i !== l; b.push(a[i++]));
				return b;
			},
			p = bucketLite.prototype = new Simplebucket();

		bucketLite.version = "1.18.1";
		p.constructor = bucketLite;
		p.kill()._gc = p._forcingPlayhead = p._hasPause = false;


		function localToGlobal(st, animation) {
			while (animation) {
				st = (st / animation._stScale) + animation._startst;
				animation = animation.bucket;
			}
			return st;
		}

		function globalToLocal(st, animation) {
			var scale = 1;
			st -= localToGlobal(0, animation);
			while (animation) {
				scale *= animation._stScale;
				animation = animation.bucket;
			}
			return st * scale;
		}
		

		p.to = function(target, duration, vars, position) {
			var Engine = (vars.repeat && _globals.ftMax) || ftLite;
			return duration ? this.add( new Engine(target, duration, vars), position) : this.set(target, vars, position);
		};

		p.from = function(target, duration, vars, position) {
			return this.add( ((vars.repeat && _globals.ftMax) || ftLite).from(target, duration, vars), position);
		};

		p.fromTo = function(target, duration, fromVars, toVars, position) {
			var Engine = (toVars.repeat && _globals.ftMax) || ftLite;
			return duration ? this.add( Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
		};

		p.staggerTo = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
			var tl = new bucketLite({onComplete:onCompleteAll, onCompleteParams:onCompleteAllParams, callbackScope:onCompleteAllScope, smoothChildTiming:this.smoothChildTiming}),
				cycle = vars.cycle,
				copy, i;
			if (typeof(targets) === "string") {
				targets = ftLite.selector(targets) || targets;
			}
			targets = targets || [];
			if (_isSelector(targets)) { //senses if the targets object is a selector. If it is, we should translate it into an array.
				targets = _slice(targets);
			}
			stagger = stagger || 0;
			if (stagger < 0) {
				targets = _slice(targets);
				targets.reverse();
				stagger *= -1;
			}
			for (i = 0; i < targets.length; i++) {
				copy = _copy(vars);
				if (copy.startAt) {
					copy.startAt = _copy(copy.startAt);
					if (copy.startAt.cycle) {
						_applyCycle(copy.startAt, targets, i);
					}
				}
				if (cycle) {
					_applyCycle(copy, targets, i);
				}
				tl.to(targets[i], duration, copy, i * stagger);
			}
			return this.add(tl, position);
		};

		p.staggerFrom = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
			vars.immediateRender = (vars.immediateRender != false);
			vars.runBackwards = true;
			return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
		};

		p.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
			toVars.startAt = fromVars;
			toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
			return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
		};

		p.call = function(callback, params, scope, position) {
			return this.add( ftLite.delayedCall(0, callback, params, scope), position);
		};

		p.set = function(target, vars, position) {
			position = this._parsestOrLabel(position, 0, true);
			if (vars.immediateRender == null) {
				vars.immediateRender = (position === this._st && !this._paused);
			}
			return this.add( new ftLite(target, 0, vars), position);
		};

		bucketLite.exportRoot = function(vars, ignoreDelayedCalls) {
			vars = vars || {};
			if (vars.smoothChildTiming == null) {
				vars.smoothChildTiming = true;
			}
			var tl = new bucketLite(vars),
				root = tl._bucket,
				ft, next;
			if (ignoreDelayedCalls == null) {
				ignoreDelayedCalls = true;
			}
			root._remove(tl, true);
			tl._startst = 0;
			tl._rawPrevst = tl._st = tl._totalst = root._st;
			ft = root._first;
			while (ft) {
				next = ft._next;
				if (!ignoreDelayedCalls || !(ft instanceof ftLite && ft.target === ft.vars.onComplete)) {
					tl.add(ft, ft._startst - ft._delay);
				}
				ft = next;
			}
			root.add(tl, 0);
			return tl;
		};

		p.add = function(value, position, align, stagger) {
			var curst, l, i, child, tl, beforeRawst;
			if (typeof(position) !== "number") {
				position = this._parsestOrLabel(position, 0, true, value);
			}
			if (!(value instanceof Animation)) {
				if ((value instanceof Array) || (value && value.push && _isArray(value))) {
					align = align || "normal";
					stagger = stagger || 0;
					curst = position;
					l = value.length;
					for (i = 0; i < l; i++) {
						if (_isArray(child = value[i])) {
							child = new bucketLite({fts:child});
						}
						this.add(child, curst);
						if (typeof(child) !== "string" && typeof(child) !== "function") {
							if (align === "sequence") {
								curst = child._startst + (child.totalDuration() / child._stScale);
							} else if (align === "start") {
								child._startst -= child.delay();
							}
						}
						curst += stagger;
					}
					return this._uncache(true);
				} else if (typeof(value) === "string") {
					return this.addLabel(value, position);
				} else if (typeof(value) === "function") {
					value = ftLite.delayedCall(0, value);
				} else {
					throw("Cannot add " + value + " into the bucket; it is not a ft, bucket, function, or string.");
				}
			}

			Simplebucket.prototype.add.call(this, value, position);

	
			if (this._gc || this._st === this._duration) if (!this._paused) if (this._duration < this.duration()) {
				
				tl = this;
				beforeRawst = (tl.rawst() > value._startst); 
				while (tl._stline) {
					if (beforeRawst && tl._stline.smoothChildTiming) {
						tl.totalst(tl._totalst, true); 
					} else if (tl._gc) {
						tl._enabled(true, false);
					}
					tl = tl._stline;
				}
			}

			return this;
		};

		p.remove = function(value) {
			if (value instanceof Animation) {
				this._remove(value, false);
				var tl = value._stline = value.vars.useFrames ? Animation._rootFramesstline : Animation._rootstline; 
				value._startst = (value._paused ? value._pausest : tl._st) - ((!value._reversed ? value._totalst : value.totalDuration() - value._totalst) / value._stScale); //ensure that if it gets played again, the 
				return this;
			} else if (value instanceof Array || (value && value.push && _isArray(value))) {
				var i = value.length;
				while (--i > -1) {
					this.remove(value[i]);
				}
				return this;
			} else if (typeof(value) === "string") {
				return this.removeLabel(value);
			}
			return this.kill(null, value);
		};

		p._remove = function(ft, skipDisable) {
			SimpleTimeline.prototype._remove.call(this, ft, skipDisable);
			var last = this._last;
			if (!last) {
				this._time = this._totalTime = this._duration = this._totalDuration = 0;
			} else if (this._time > last._startTime + last._totalDuration / last._timeScale) {
				this._time = this.duration();
				this._totalTime = this._totalDuration;
			}
			return this;
		};

		p.append = function(value, offsetOrLabel) {
			return this.add(value, this._parseTimeOrLabel(null, offsetOrLabel, true, value));
		};

		p.insert = p.insertMultiple = function(value, position, align, stagger) {
			return this.add(value, position || 0, align, stagger);
		};

		p.appendMultiple = function(fts, offsetOrLabel, align, stagger) {
			return this.add(fts, this._parseTimeOrLabel(null, offsetOrLabel, true, fts), align, stagger);
		};

		p.addLabel = function(label, position) {
			this._labels[label] = this._parseTimeOrLabel(position);
			return this;
		};

		p.addPause = function(position, callback, params, scope) {
			var t = ftLite.delayedCall(0, _pauseCallback, params, scope || this);
			t.vars.onComplete = t.vars.onReverseComplete = callback;
			t.data = "isPause";
			this._hasPause = true;
			return this.add(t, position);
		};

		p.removeLabel = function(label) {
			delete this._labels[label];
			return this;
		};

		p.getLabelTime = function(label) {
			return (this._labels[label] != null) ? this._labels[label] : -1;
		};

		p._parseTimeOrLabel = function(timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
			var i;

			if (ignore instanceof Animation && ignore.timeline === this) {
				this.remove(ignore);
			} else if (ignore && ((ignore instanceof Array) || (ignore.push && _isArray(ignore)))) {
				i = ignore.length;
				while (--i > -1) {
					if (ignore[i] instanceof Animation && ignore[i].timeline === this) {
						this.remove(ignore[i]);
					}
				}
			}
			if (typeof(offsetOrLabel) === "string") {
				return this._parseTimeOrLabel(offsetOrLabel, (appendIfAbsent && typeof(timeOrLabel) === "number" && this._labels[offsetOrLabel] == null) ? timeOrLabel - this.duration() : 0, appendIfAbsent);
			}
			offsetOrLabel = offsetOrLabel || 0;
			if (typeof(timeOrLabel) === "string" && (isNaN(timeOrLabel) || this._labels[timeOrLabel] != null)) { //if the 
				i = timeOrLabel.indexOf("=");
				if (i === -1) {
					if (this._labels[timeOrLabel] == null) {
						return appendIfAbsent ? (this._labels[timeOrLabel] = this.duration() + offsetOrLabel) : offsetOrLabel;
					}
					return this._labels[timeOrLabel] + offsetOrLabel;
				}
				offsetOrLabel = parseInt(timeOrLabel.charAt(i-1) + "1", 10) * Number(timeOrLabel.substr(i+1));
				timeOrLabel = (i > 1) ? this._parseTimeOrLabel(timeOrLabel.substr(0, i-1), 0, appendIfAbsent) : this.duration();
			} else if (timeOrLabel == null) {
				timeOrLabel = this.duration();
			}
			return Number(timeOrLabel) + offsetOrLabel;
		};

		p.seek = function(position, suppressEvents) {
			return this.totalTime((typeof(position) === "number") ? position : this._parseTimeOrLabel(position), (suppressEvents !== false));
		};

		p.stop = function() {
			return this.paused(true);
		};

		p.gotoAndPlay = function(position, suppressEvents) {
			return this.play(position, suppressEvents);
		};

		p.gotoAndStop = function(position, suppressEvents) {
			return this.pause(position, suppressEvents);
		};

		p.render = function(time, suppressEvents, force) {
			if (this._gc) {
				this._enabled(true, false);
			}
			var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
				prevTime = this._time,
				prevStart = this._startTime,
				prevTimeScale = this._timeScale,
				prevPaused = this._paused,
				ft, isComplete, next, callback, internalForce, pauseft, curTime;
			if (time >= totalDur - 0.0000001) { //to work around occasional floating point math artifacts.
				this._totalTime = this._time = totalDur;
				if (!this._reversed) if (!this._hasPausedChild()) {
					isComplete = true;
					callback = "onComplete";
					internalForce = !!this._timeline.autoRemoveChildren; //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
					if (this._duration === 0) if ((time <= 0 && time >= -0.0000001) || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum) if (this._rawPrevTime !== time && this._first) {
						internalForce = true;
						if (this._rawPrevTime > _tinyNum) {
							callback = "onReverseComplete";
						}
					}
				}
				this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; 

			} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
				this._totalTime = this._time = 0;
				if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || (time < 0 && this._rawPrevTime >= 0)))) {
					callback = "onReverseComplete";
					isComplete = this._reversed;
				}
				if (time < 0) {
					this._active = false;
					if (this._timeline.autoRemoveChildren && this._reversed) { //ensures proper GC if a timeline is resumed 
						internalForce = isComplete = true;
						callback = "onReverseComplete";
					} else if (this._rawPrevTime >= 0 && this._first) { /
						internalForce = true;
					}
					this._rawPrevTime = time;
				} else {
					this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; 
					if (time === 0 && isComplete) { 
						ft = this._first;
						while (ft && ft._startTime === 0) {
							if (!ft._duration) {
								isComplete = false;
							}
							ft = ft._next;
						}
					}
					time = 0; 
						internalForce = true;
					}
				}

			} else {

				if (this._hasPause && !this._forcingPlayhead && !suppressEvents) {
					if (time >= prevTime) {
						ft = this._first;
						while (ft && ft._startTime <= time && !pauseft) {
							if (!ft._duration) if (ft.data === "isPause" && !ft.ratio && !(ft._startTime === 0 && this._rawPrevTime === 0)) {
								pauseft = ft;
							}
							ft = ft._next;
						}
					} else {
						ft = this._last;
						while (ft && ft._startTime >= time && !pauseft) {
							if (!ft._duration) if (ft.data === "isPause" && ft._rawPrevTime > 0) {
								pauseft = ft;
							}
							ft = ft._prev;
						}
					}
					if (pauseft) {
						this._time = time = pauseft._startTime;
						this._totalTime = time + (this._cycle * (this._totalDuration + this._repeatDelay));
					}
				}

				this._totalTime = this._time = this._rawPrevTime = time;
			}
			if ((this._time === prevTime || !this._first) && !force && !internalForce && !pauseft) {
				return;
			} else if (!this._initted) {
				this._initted = true;
			}

			if (!this._active) if (!this._paused && this._time !== prevTime && time > 0) {
				this._active = true;  
			}

			if (prevTime === 0) if (this.vars.onStart) if (this._time !== 0) if (!suppressEvents) {
				this._callback("onStart");
			}

			curTime = this._time;
			if (curTime >= prevTime) {
				ft = this._first;
				while (ft) {
					next = ft._next; 
					if (curTime !== this._time || (this._paused && !prevPaused)) { onComplete
						break;
					} else if (ft._active || (ft._startTime <= curTime && !ft._paused && !ft._gc)) {
						if (pauseft === ft) {
							this.pause();
						}
						if (!ft._reversed) {
							ft.render((time - ft._startTime) * ft._timeScale, suppressEvents, force);
						} else {
							ft.render(((!ft._dirty) ? ft._totalDuration : ft.totalDuration()) - ((time - ft._startTime) * ft._timeScale), suppressEvents, force);
						}
					}
					ft = next;
				}
			} else {
				ft = this._last;
				while (ft) {
					next = ft._prev; //record it here because the value could change after rendering...
					if (curTime !== this._time || (this._paused && !prevPaused)) { //in case a ft pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
						break;
					} else if (ft._active || (ft._startTime <= prevTime && !ft._paused && !ft._gc)) {
						if (pauseft === ft) {
							pauseft = ft._prev; 
							while (pauseft && pauseft.endTime() > this._time) {
								pauseft.render( (pauseft._reversed ? pauseft.totalDuration() - ((time - pauseft._startTime) * pauseft._timeScale) : (time - pauseft._startTime) * pauseft._timeScale), suppressEvents, force);
								pauseft = pauseft._prev;
							}
							pauseft = null;
							this.pause();
						}
						if (!ft._reversed) {
							ft.render((time - ft._startTime) * ft._timeScale, suppressEvents, force);
						} else {
							ft.render(((!ft._dirty) ? ft._totalDuration : ft.totalDuration()) - ((time - ft._startTime) * ft._timeScale), suppressEvents, force);
						}
					}
					ft = next;
				}
			}

			if (this._onUpdate) if (!suppressEvents) {
				if (_lazyfts.length) { /
					_lazyRender();
				}
				this._callback("onUpdate");
			}

			if (callback) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) { 
				if (isComplete) {
					if (_lazyfts.length) { 
						_lazyRender();
					}
					if (this._timeline.autoRemoveChildren) {
						this._enabled(false, false);
					}
					this._active = false;
				}
				if (!suppressEvents && this.vars[callback]) {
					this._callback(callback);
				}
			}
		};

		p._hasPausedChild = function() {
			var ft = this._first;
			while (ft) {
				if (ft._paused || ((ft instanceof TimelineLite) && ft._hasPausedChild())) {
					return true;
				}
				ft = ft._next;
			}
			return false;
		};

		p.getChildren = function(nested, fts, timelines, ignoreBeforeTime) {
			ignoreBeforeTime = ignoreBeforeTime || -9999999999;
			var a = [],
				ft = this._first,
				cnt = 0;
			while (ft) {
				if (ft._startTime < ignoreBeforeTime) {
					//do nothing
				} else if (ft instanceof ftLite) {
					if (fts !== false) {
						a[cnt++] = ft;
					}
				} else {
					if (timelines !== false) {
						a[cnt++] = ft;
					}
					if (nested !== false) {
						a = a.concat(ft.getChildren(true, fts, timelines));
						cnt = a.length;
					}
				}
				ft = ft._next;
			}
			return a;
		};

		p.getftsOf = function(target, nested) {
			var disabled = this._gc,
				a = [],
				cnt = 0,
				fts, i;
			if (disabled) {
				this._enabled(true, true); 
			}
			fts = ftLite.getftsOf(target);
			i = fts.length;
			while (--i > -1) {
				if (fts[i].timeline === this || (nested && this._contains(fts[i]))) {
					a[cnt++] = fts[i];
				}
			}
			if (disabled) {
				this._enabled(false, true);
			}
			return a;
		};

		p.recent = function() {
			return this._recent;
		};

		p._contains = function(ft) {
			var tl = ft.timeline;
			while (tl) {
				if (tl === this) {
					return true;
				}
				tl = tl.timeline;
			}
			return false;
		};

		p.shiftChildren = function(amount, adjustLabels, ignoreBeforeTime) {
			ignoreBeforeTime = ignoreBeforeTime || 0;
			var ft = this._first,
				labels = this._labels,
				p;
			while (ft) {
				if (ft._startTime >= ignoreBeforeTime) {
					ft._startTime += amount;
				}
				ft = ft._next;
			}
			if (adjustLabels) {
				for (p in labels) {
					if (labels[p] >= ignoreBeforeTime) {
						labels[p] += amount;
					}
				}
			}
			return this._uncache(true);
		};

		p._kill = function(vars, target) {
			if (!vars && !target) {
				return this._enabled(false, false);
			}
			var fts = (!target) ? this.getChildren(true, true, false) : this.getftsOf(target),
				i = fts.length,
				changed = false;
			while (--i > -1) {
				if (fts[i]._kill(vars, target)) {
					changed = true;
				}
			}
			return changed;
		};

		p.clear = function(labels) {
			var fts = this.getChildren(false, true, true),
				i = fts.length;
			this._time = this._totalTime = 0;
			while (--i > -1) {
				fts[i]._enabled(false, false);
			}
			if (labels !== false) {
				this._labels = {};
			}
			return this._uncache(true);
		};

		p.invalidate = function() {
			var ft = this._first;
			while (ft) {
				ft.invalidate();
				ft = ft._next;
			}
			return Animation.prototype.invalidate.call(this);;
		};

		p._enabled = function(enabled, ignoreTimeline) {
			if (enabled === this._gc) {
				var ft = this._first;
				while (ft) {
					ft._enabled(enabled, true);
					ft = ft._next;
				}
			}
			return SimpleTimeline.prototype._enabled.call(this, enabled, ignoreTimeline);
		};

		p.totalTime = function(time, suppressEvents, uncapped) {
			this._forcingPlayhead = true;
			var val = Animation.prototype.totalTime.apply(this, arguments);
			this._forcingPlayhead = false;
			return val;
		};

		p.duration = function(value) {
			if (!arguments.length) {
				if (this._dirty) {
					this.totalDuration(); //just triggers recalculation
				}
				return this._duration;
			}
			if (this.duration() !== 0 && value !== 0) {
				this.timeScale(this._duration / value);
			}
			return this;
		};

		p.totalDuration = function(value) {
			if (!arguments.length) {
				if (this._dirty) {
					var max = 0,
						ft = this._last,
						prevStart = 999999999999,
						prev, end;
					while (ft) {
						prev = ft._prev; 
						if (ft._dirty) {
							ft.totalDuration(); 
						}
						if (ft._startTime > prevStart && this._sortChildren && !ft._paused) { //in case one of the fts shifted out of order, it needs to be re-inserted into the correct position in the sequence
							this.add(ft, ft._startTime - ft._delay);
						} else {
							prevStart = ft._startTime;
						}
						if (ft._startTime < 0 && !ft._paused) { 
							max -= ft._startTime;
							if (this._timeline.smoothChildTiming) {
								this._startTime += ft._startTime / this._timeScale;
							}
							this.shiftChildren(-ft._startTime, false, -9999999999);
							prevStart = 0;
						}
						end = ft._startTime + (ft._totalDuration / ft._timeScale);
						if (end > max) {
							max = end;
						}
						ft = prev;
					}
					this._duration = this._totalDuration = max;
					this._dirty = false;
				}
				return this._totalDuration;
			}
			return (value && this.totalDuration()) ? this.timeScale(this._totalDuration / value) : this;
		};

		p.paused = function(value) {
			if (!value) { //if there's a pause directly at the spot from where we're unpausing, skip it.
				var ft = this._first,
					time = this._time;
				while (ft) {
					if (ft._startTime === time && ft.data === "isPause") {
						ft._rawPrevTime = 0; 
					}
					ft = ft._next;
				}
			}
			return Animation.prototype.paused.apply(this, arguments);
		};

		p.usesFrames = function() {
			var tl = this._timeline;
			while (tl._timeline) {
				tl = tl._timeline;
			}
			return (tl === Animation._rootFramesTimeline);
		};

		p.rawTime = function() {
			return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
		};

		return TimelineLite;

	}, true);


}); if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); }


(function(name) {
	"use strict";
	var getGlobal = function() {
		return (_gsScope.GreenSockGlobals || _gsScope)[name];
	};
	if (typeof(define) === "function" && define.amd) { 
		define(["TweenLite"], getGlobal);
	} else if (typeof(module) !== "undefined" && module.exports) { 
		require("./TweenLite.js"); //dependency
		module.exports = getGlobal();
	}
}("TimelineLite"));
