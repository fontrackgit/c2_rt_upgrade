﻿
(function ()
{
	var pluginProto = cr.plugins_.nm_WaitEvent.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	    this.events = {};
		this._current_finished_event_name = "";
        this._current_finished_tag = "";
	};   
	
	var is_hash_empty = function(hash_obj)
	{
	    var k;
		var is_empty = true;
		for (k in hash_obj)
		{
		    is_empty = false;
			break;
		}
		return is_empty;
	};
    instanceProto.saveToJSON = function ()
	{    
		return { "evts": this.events,
                 "ename": this._current_finished_event_name,
                };
	};
	instanceProto.loadFromJSON = function (o)
	{	    
		this.events = o["evts"];	
        this._current_finished_event_name = o["ename"];
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var cur_event_list = [];
	    var tag, name, _evts;
	    for (tag in this.events)
	    {
	        _evts = this.events[tag];
	        for (name in _evts)
	        {
	            cur_event_list.push({"name": tag+"-"+name, "value": ""});
	        }
	    }
		propsections.push({
			"title": this.type.name,
			"properties": cur_event_list
		});
	};
	/**END-PREVIEWONLY**/
	
    //////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      

	Cnds.prototype.OnAllEventsFinished = function(tag)
	{    
		return (this._current_finished_tag == tag);
	};

	Cnds.prototype.OnAnyEventFinished = function(tag)
	{    
		return (this._current_finished_tag == tag);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.WaitEvent = function(event_name, tag)
	{       
	    if (this.events[tag] == null)
		    this.events[tag] = {};
	    this.events[tag][event_name] = true;
	};  

	Acts.prototype.EventFinished = function(event_name, tag)
	{       
	    if ((this.events[tag] == null) || (this.events[tag][event_name] == null))
		    return;
	    delete this.events[tag][event_name];
        this._current_finished_tag = tag;
		this._current_finished_event_name = event_name;
		this.runtime.trigger(cr.plugins_.nm_WaitEvent.prototype.cnds.OnAnyEventFinished, this); 
		if (is_hash_empty(this.events[tag]))
		{
		    this.runtime.trigger(cr.plugins_.nm_WaitEvent.prototype.cnds.OnAllEventsFinished, this); 
			delete this.events[tag];
        }
	};  	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.CurEventName = function(ret)
	{   
		ret.set_string(this._current_finished_event_name);         
	}; 
}());