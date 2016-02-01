

(function ()
{
	
	instanceProto.onCreate = function()
	{
		
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		
		this.curTouchX = 0;
		this.curTouchY = 0;
		
		this.trigger_index = 0;
		this.trigger_id = 0;
		
		this.useMouseInput = (this.properties[0] !== 0);
		
		// Use document touch input for PhoneGap or fullscreen mode
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		
		// Use elem2 to attach the up and cancel events to document, since we want to know about
		// these even if they happen off the main canvas.
		var elem2 = document;
		
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
			
		var self = this;
		
		if (window.navigator["msPointerEnabled"])
		{
			elem.addEventListener("MSPointerDown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			
			elem.addEventListener("MSPointerMove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			
			// Always attach up/cancel events to document (note elem2),
			// otherwise touches dragged off the canvas could get lost
			elem2.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			
			// Treat pointer cancellation the same as a touch end
			elem2.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		else
		{
			elem.addEventListener("touchstart",
				function(info) {
					self.onTouchStart(info);
				},
				false
			);
			
			elem.addEventListener("touchmove",
				function(info) {
					self.onTouchMove(info);
				},
				false
			);
			
			// Always attach up/cancel events to document (note elem2),
			// otherwise touches dragged off the canvas could get lost
			elem2.addEventListener("touchend",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
			
			// Treat touch cancellation the same as a touch end
			elem2.addEventListener("touchcancel",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
		}
		
		if (this.isWindows8)
		{
			
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
			
            if (accelerometer)
			{
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
			
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			
			if (inclinometer)
			{
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"])
				{
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else
				{
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else
		{
			window.addEventListener("deviceorientation", function (eventData) {
			
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			
			}, false);
			
			window.addEventListener("devicemotion", function (eventData) {
			
				if (eventData["accelerationIncludingGravity"])
				{
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"];
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"];
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"];
				}
				
				if (eventData["acceleration"])
				{
					self.acc_x = eventData["acceleration"]["x"];
					self.acc_y = eventData["acceleration"]["y"];
					self.acc_z = eventData["acceleration"]["z"];
				}
				
			}, false);
		}
		
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
		}
		
		// Use AppMobi in case browser does not support accelerometer but device does
		if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
		{
			AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
		}
		
		// Use PhoneGap in case browser does not support accelerometer but device does
		if (this.runtime.isPhoneGap)
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
		
		this.runtime.tick2Me(this);
		
		this.enable = (this.properties[1] == 1);
	};
	
	instanceProto.onPointerMove = function (info)
	{	    
	    if (!this.enable)
	        return;
	        
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
			
	    this._is_mouse_mode = false;			
		if (info.preventDefault)
			info.preventDefault();
		
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		
		if (i >= 0)
		{
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			
			// Ignore events <2ms after the last event - seems events sometimes double-fire
			// very close which throws off speed measurements
			if (nowtime - t.time < 2)
				return;
			
			t.lasttime = t.time;
			t.lastx = t.x;
			t.lasty = t.y;
			t.time = nowtime;
			t.x = info.pageX - offset.left;
			t.y = info.pageY - offset.top;
		}
	};

	instanceProto.onPointerStart = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
	
	    this._is_mouse_mode = false;			
		if (info.preventDefault)
			info.preventDefault();
		
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		
		this.touches.push({ time: nowtime,
							x: touchx,
							y: touchy,
							lasttime: nowtime,
							lastx: touchx,
							lasty: touchy,
							"id": info["pointerId"],
							startindex: this.trigger_index
						});
		
		// Trigger OnNthTouchStart then OnTouchStart
		this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchStart, this);
		
		// Trigger OnTouchObject for each touch started event		
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchObject, this);
        
        var hooki, cnt=this._plugins_hook.length;
        for (hooki=0; hooki<cnt; hooki++)
		{
			if (this._plugins_hook[hooki].OnTouchStart)
                this._plugins_hook[hooki].OnTouchStart(this.trigger_id, this.curTouchX, this.curTouchY);
	    }
	};

	instanceProto.onPointerEnd = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
	
        this._is_mouse_mode = false;			
		if (info.preventDefault)
			info.preventDefault();
			
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);

		// Trigger OnNthTouchEnd & OnTouchEnd
		this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchEnd, this);
        
        var cnt=this._plugins_hook.length, hooki; 
        for (hooki=0; hooki<cnt; hooki++)
		{
		    if (this._plugins_hook[hooki].OnTouchEnd)
                this._plugins_hook[hooki].OnTouchEnd(this.trigger_id);
		}
		
		// Remove touch
		if (i >= 0)
		{
			this.touches.splice(i, 1);
		}
	};

	instanceProto.onTouchMove = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		if (info.preventDefault)
			info.preventDefault();
		
		var nowtime = cr.performance_now();
		
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var j = this.findTouch(t["identifier"]);
			
			if (j >= 0)
			{
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				
				// Ignore events <2ms after the last event - seems events sometimes double-fire
				// very close which throws off speed measurements
				if (nowtime - u.time < 2)
					continue;
				
				u.lasttime = u.time;
				u.lastx = u.x;
				u.lasty = u.y;
				u.time = nowtime;
				u.x = t.pageX - offset.left;
				u.y = t.pageY - offset.top;
			}
		}
	};

	instanceProto.onTouchStart = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		if (info.preventDefault)
			info.preventDefault();
			
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		
		var i, len, t;
        var cnt=this._plugins_hook.length, hooki;        
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
			
			// Trigger OnNthTouchStart then OnTouchStart
			this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchStart, this);
            
			// Trigger OnTouchObject for each touch started event		
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchObject, this);
            
            for (hooki=0; hooki<cnt; hooki++)
			{
				if (this._plugins_hook[hooki].OnTouchStart)
                    this._plugins_hook[hooki].OnTouchStart(this.trigger_id, this.curTouchX, this.curTouchY);
			}
		}		
	};

	instanceProto.onTouchEnd = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		if (info.preventDefault)
			info.preventDefault();
		
		var i, len, t;
        var cnt=this._plugins_hook.length, hooki;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var j = this.findTouch(t["identifier"]);
			this.trigger_index = (j >= 0 ? this.touches[j].startindex : -1);
			this.trigger_id = (j >= 0 ? this.touches[j]["id"] : -1);
			
			// Trigger OnNthTouchEnd & OnTouchEnd
			this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
			this.runtime.trigger(cr.plugins_.nm_TouchWrap.prototype.cnds.OnTouchEnd, this);

            for (hooki=0; hooki<cnt; hooki++)
			{
			    if (this._plugins_hook[hooki].OnTouchEnd)
                    this._plugins_hook[hooki].OnTouchEnd(this.trigger_id);
			}
			
			// Remove touch
			if (j >= 0)
			{
				this.touches.splice(j, 1);
			}
		}
	};
	
	
	
	instanceProto.onMouseMove = function(info)
	{
	    if (!this.enable)
	        return;
	        	    
        this._is_mouse_mode = true;
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
			
		//if (!this.mouseDown)
		//	return;
			
		// Send a fake touch move event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		if (this.touches.length==0)
		    this._fake_onTouchStart(fakeinfo);
		else
		    this.onTouchMove(fakeinfo);
	};

	instanceProto.onMouseUp = function(info)
	{
	    if (!this.enable)
	        return;
	        	    
	    this._is_mouse_mode = true;	    
		this.mouseDown = false;			    
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
			
		this.runtime.had_a_click = true;
		
		// Send a fake touch end event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
		this._fake_onTouchStart(fakeinfo);
	};
	
	instanceProto.tick2 = function()
	{
	    if (!this.enable)
	        return;
	        	    
		var i, len, t;
		var nowtime = cr.performance_now();
		
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			// Update speed for touches which haven't moved for 50ms
			t = this.touches[i];
			
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
		}
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsInTouch = function ()
	{
		return this.IsInTouch();
	};
	
	Cnds.prototype.OnTouchObject = function (type)
	{
		if (!type)
			return false;
			
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	
	Cnds.prototype.IsTouchingObject = function (type)
	{
		if (!type)
			return false;
			
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		
		var touching = [];
			
		// Check all touches for overlap with any instance
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			var inst = instances[i];
			inst.update_bbox();
			
			for (j = 0, lenj = this.touches.length; j < lenj; j++)
			{
				var touch = this.touches[j];
				
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				
				if (inst.contains_pt(px, py))
				{
					touching.push(inst);
					break;
				}
			}
		}
		
		if (touching.length)
		{
			sol.select_all = false;
			sol.instances = touching;
			return true;
		}
		else
			return false;
	};
	
	
	Exps.prototype.XForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			// use given layer param
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.Y = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		
			if (cr.is_undefined(layerparam))
			{
				// calculate X position on bottom layer as if its scale were 1.0
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxY = layer.parallaxY;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxY = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxY = oldParallaxY;
				layer.angle = oldAngle;
			}
			else
			{
				// use given layer param
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
					
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			// use given layer param
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.YForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			// use given layer param
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}

		ret.set_float(this.touches[index].x);
	};
	
	Exps.prototype.AbsoluteXForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];

		ret.set_float(touch.x);
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}

		ret.set_float(this.touches[index].y);
	};
	
	Exps.prototype.AbsoluteYForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];

		ret.set_float(touch.y);
	};
	
	Exps.prototype.SpeedAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	
	Exps.prototype.SpeedForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	
	Exps.prototype.AngleAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	
	Exps.prototype.AngleForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.getAlpha());
	};
	
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.getBeta());
	};
	
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.getGamma());
	};
	
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.acc_g_y);
	};
	
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.acc_g_z);
	};
	
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.acc_x);
	};
	
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.acc_y);
	};
	
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.acc_z);
	};
	
	Exps.prototype.TouchIndex = function (ret)
	{
		ret.set_int(this.trigger_index);
	};
	
	Exps.prototype.TouchID = function (ret)
	{
		ret.set_float(this.trigger_id);
	};
	
	pluginProto.exps = new Exps();
	
    
    // wrapper --------
	instanceProto._fake_onTouchStart = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
			
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		
		var i, len, t;        
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			
			this.trigger_index = this.touches.length;
			
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
		}		
	};

    instanceProto.HookMe = function (obj)
    {
        this._plugins_hook.push(obj);
    };

    instanceProto.UnHookMe = function (obj)
    {
        var i, cnt=this._plugins_hook.length, hookobj;
        for (i=0; i<cnt; i++)
        {
            hookobj = this._plugins_hook[i];
            if (obj === hookobj)
            {
                cr.arrayRemove(this._plugins_hook, i);
                break;
            }
        }
    };    
    instanceProto.UseMouseInput = function()
    {
        return this.useMouseInput;
    }
	instanceProto.IsMouseMode = function ()
	{
		return this._is_mouse_mode;
	};
	instanceProto.IsInTouch = function ()
	{
		return (this._is_mouse_mode)? this.mouseDown : this.touches.length;
	};    
    // wrapper --------    
    
}());