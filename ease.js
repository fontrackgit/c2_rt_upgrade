

(function ()
{
	
	var behaviorProto = cr.behaviors.anonymous.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.startPoint = this.properties[0];
		this.originX    = this.properties[1];
		this.originY    = this.properties[2];
		this.destX      = this.properties[3];
		this.destY      = this.properties[4];
		this.tPeriod    = this.properties[5];
		
		// current time position (0 is origin, tPeriod is dest)
		this.tCur = (this.startPoint==0)?0:this.tPeriod;
		
		// movement direction:
		//    0 when stopped otherwise
		//    1 to move origin-to-destination
		//   -1 to move destination-to-origin 
		this.moveDir = 0;
		
		// easing computation
		this.easeFunc = function(k) {
			// k is input on interval [0,1]
			// return is on interval [0,1]
			// behavior pattern:
			//   - treat input as linear on [0,1]
			//   - compute transform of k (eg: 0.5-(0.5*cos(Math.PI*k)) for easeInOut)
			//   - normalize transformed value to [0,1]
			//   - return normalized value			
			return k; // identity
		};
		this.halfPI=Math.PI/2.0;				
		
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		// this.myValue = 0;
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		// called every tick for you to update this.inst as necessary
		// dt is the amount of time passed since the last tick, in case it's a movement
		
		// advance by dt portion of movement period
		this.tCur+=dt*this.moveDir*(1.0/this.tPeriod)
		
		if (this.tCur<=0.0) {
			// moved before start so clamp to start (0) and stop
			this.tCur=0.0;
			if (this.moveDir!=0) {
				this.moveDir=0;
				this.runtime.trigger(cr.behaviors.GauVeldt_Ease.prototype.cnds.OnArrived, this.inst);
			}
			this.moveDir=0;
		}
		if (this.tCur>=this.tPeriod) {
			// moved past end so clamp to end (tPeriod) and stop
			this.tCur=this.tPeriod;
			if (this.moveDir!=0) {
				this.moveDir=0;
				this.runtime.trigger(cr.behaviors.GauVeldt_Ease.prototype.cnds.OnArrived, this.inst);
			}
			this.moveDir=0;
		}

		// allows an update event to apply actions to ease properties other than movement
		this.runtime.trigger(cr.behaviors.GauVeldt_Ease.prototype.cnds.OnUpdate, this.inst);
		
		// determine lerp factor on range 0 <= tFrac <= 1.0
		var tFrac=this.tCur/this.tPeriod;
		// transform lerp to eased fraction
		var tEase=this.easeFunc(tFrac);
		
		// move instance to interpolated position
		this.inst.x=this.originX+(tEase*(this.destX-this.originX));
		this.inst.y=this.originY+(tEase*(this.destY-this.originY));
		this.inst.set_bbox_changed();
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnArrived = function (which) {
		return (which==0 && this.tCur<=0) || (which==1 && this.tCur>=this.tPeriod);
	};
	cnds.OnUpdate = function (which) {
		return true;
	};
	cnds.IsInTransition = function ()
	{
		return (this.moveDir!=0);
	};
	cnds.IsAtDestination = function ()
	{
		return (this.tCur>=this.tPeriod);
	};
	cnds.IsAtOrigin = function ()
	{
		return (this.tCur<=0);
	};

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	// the example action
	acts.EaseIn = function ()
	{
		if (this.moveDir!=0) {
			// will not execute a new ease until current one finishes
			return;
		}

		// start transition easing into ending point

		if (this.tCur<=0) {
			// starting from 0 so ease at tPeriod
			this.easeFunc = function(k) {				
				return 0.0-Math.cos(this.halfPI+this.halfPI*k);
			};
			this.moveDir=1.0;			
		} else {
			// starting from tPeriod so ease at 0
			this.easeFunc = function(k) {
				return 1.0-Math.cos(this.halfPI*k);
			};			
			this.moveDir=-1.0;			
		}
	};
	acts.EaseOut = function ()
	{
		if (this.moveDir!=0) {
			// will not execute a new ease until current one finishes
			return;
		}

		// start transition easing away from starting point

		if (this.tCur<=0) {
			// starting from 0 so ease at 0
			this.easeFunc = function(k) {				
				return 1.0-Math.cos(this.halfPI*k);
			};
			this.moveDir=1.0;			
		} else {
			// starting from tPeriod so ease at tPeriod			
			this.easeFunc = function(k) {				
				return -Math.cos(this.halfPI+this.halfPI*k);
			};
			this.moveDir=-1.0;			
		}
	};
	acts.EaseInOut = function ()
	{
		if (this.moveDir!=0) {
			// will not execute a new ease until current one finishes
			return;
		}

		// start transition easing away from start and easing into end

		this.easeFunc = function(k) {
			return 0.5-(0.5*Math.cos(Math.PI*k));

		};				

		if (this.tCur<=0) {
			this.moveDir=1.0;			
		} else {
			this.moveDir=-1.0;			
		}
	};
	acts.SetOrigin = function(x,y) {
		// Changes origin endpoint
		this.originX=x;
		this.originY=y;
	}
	acts.SetDestination = function(x,y) {
		// Changes destination endpoint
		this.destX=x;
		this.destY=y;
	}
	acts.SetPeriod = function(t) {
		// Changes transition period if nonzero
		if (t!=0) {
			this.tPeriod=t;
		}
	}

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	// the example expression
	exps.IsEasing = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		if (this.moveDir==0) {
			ret.set_int(0);
		} else {
			ret.set_int(1);
		}
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	exps.GetTransition = function (ret)
	{
		// Expression to yield the easeing lerp factor
		var tFrac=this.tCur/this.tPeriod;
		var tEase=this.easeFunc(tFrac);
		ret.set_float(tEase);
	};
	
}());