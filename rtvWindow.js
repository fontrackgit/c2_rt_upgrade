

(function ()
{
	var pluginProto = cr.plugins_.iosdialogs.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;
	
	// called on startup for each object type	
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

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		var css = "<style type=\"text/css\"> .button{ width: 125px; height: 40px; font-size: 16px; line-height: 37px; font-weight: bold; overflow: hidden; display: inline-block; text-align: center; margin-top: 15px; margin-bottom: 7px; margin-left: 5px; margin-right: 5px; border: solid 1px #192542;	background-image: linear-gradient(bottom, rgba(45,61,100,0.7) 12%, rgba(36,53,94,0.7) 50%, rgba(71,85,120,0.7) 0%, rgba(178,188,212,0.7) 99%); background-image: -o-linear-gradient(bottom, rgba(45,61,100,0.7) 12%, rgba(36,53,94,0.7) 50%, rgba(71,85,120,0.7) 0%, rgba(178,188,212,0.7) 99%); background-image: -moz-linear-gradient(bottom, rgba(45,61,100,0.7) 12%, rgba(36,53,94,0.7) 50%, rgba(71,85,120,0.7) 0%, rgba(178,188,212,0.7) 99%); background-image: -webkit-linear-gradient(bottom, rgba(45,61,100,0.7) 12%, rgba(36,53,94,0.7) 50%, rgba(71,85,120,0.7) 0%, rgba(178,188,212,0.7) 99%); background-image: -ms-linear-gradient(bottom, rgba(45,61,100,0.7) 12%, rgba(36,53,94,0.7) 50%, rgba(71,85,120,0.7) 0%, rgba(178,188,212,0.7) 99%); color: #fff; text-shadow: 0px -1px 0px #000; text-align: center; -webkit-border-radius: 6px; border-radius: 6px; box-shadow: 0pt 1pt 0px 0px rgba(255,255,255,0.3) inset, 0pt 1.5pt 0px 0px #5d6a8b; -webkit-box-shadow: 0pt 1pt 0px 0px rgba(255,255,255,0.3) inset, 0pt 1.5pt 0px 0px #5d6a8b; -moz-box-shadow: 0pt 1pt 0px 0px rgba(255,255,255,0.3) inset, 0pt 1.5pt 0px 0px #5d6a8b;}.button.default { background-image: linear-gradient(bottom, rgba(104,115,143) 12%, rgb(80,92,124) 50%, rgb(118,127,152) 0%, rgb(176,181,196) 99%); background-image: -o-linear-gradient(bottom, rgb(104,115,143) 12%, rgb(80,92,124) 50%, rgb(118,127,152) 0%, rgb(176,181,196) 99%); background-image: -moz-linear-gradient(bottom, rgb(104,115,143) 12%, rgb(80,92,124) 50%, rgb(118,127,152) 0%, rgb(176,181,196) 99%); background-image: -webkit-linear-gradient(bottom, rgb(104,115,143) 12%, rgb(80,92,124) 50%, rgb(118,127,152) 0%, rgb(176,181,196) 99%); background-image: -ms-linear-gradient(bottom, rgb(104,115,143) 12%, rgb(80,92,124) 50%, rgb(118,127,152) 0%, rgb(176,181,196) 99%);}.button:hover, button.hover { background-image: linear-gradient(bottom, rgb(44,51,67) 12%, rgba(27,31,41,0.9) 50%, rgb(64,69,86) 0%, rgb(108,113,132) 99%); background-image: -o-linear-gradient(bottom, rgb(44,51,67) 12%, rgba(27,31,41,0.9) 50%, rgb(64,69,86) 0%, rgb(108,113,132) 99%); background-image: -moz-linear-gradient(bottom, rgb(44,51,67) 12%, rgba(27,31,41,0.9) 50%, rgb(64,69,86) 0%, rgb(108,113,132) 99%); background-image: -webkit-linear-gradient(bottom, rgb(44,51,67) 12%, rgba(27,31,41,0.9) 50%, rgb(64,69,86) 0%, rgb(108,113,132) 99%); background-image: -ms-linear-gradient(bottom, rgb(44,51,67) 12%, rgba(27,31,41,0.9) 50%, rgb(64,69,86) 0%, rgb(108,113,132) 99%);} .input { margin-top: 15px; padding: 5px; resize: none; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; border: solid 0px rgba(0,0,0,0.5); border-radius: 0px; -webkit-box-shadow: 0px 1pt 3px 1px rgba(0,0,0,0.8) inset; -moz-box-shadow: 0px 1pt 3px 1px rgba(0,0,0,0.8) inset; box-shadow: 0px 1pt 3px 1px rgba(0,0,0,0.8) inset;}</style>"
		jQuery(css).appendTo("head");
		
		// Prevent bugs
		document.addEventListener('touchmove', function (e) 
			{ e.preventDefault(); }, false); // use this for compatibility with iDevice & Android (prevents whole window scrolling)		
		
		window.onresize = function() { instanceProto.updateDialogPosition(); };
	
	};
	

	instanceProto.updateDialogPosition = function()
	{
		// different ways to get the browser height
			var browser = { height: window.innerHeight || document.documentElement.clientHeight || document.body.offsetHeight };
		// user agent
			var useragent = navigator.userAgent;
			var iphone = (useragent.indexOf('iPhone') != -1);
			var ipod = (useragent.indexOf('iPod') != -1);
			//var ipad = (useragent.indexOf('iPad') != -1);
			//var android = (useragent.indexOf('Android') != -1);
			//var blackberry = (useragent.indexOf('BlackBerry') != -1);	
			
		var popup = document.getElementById("popup");
		var text_content = document.getElementById("text_content");
		if (text_content)
		{
		var i = text_content.innerHTML; //wait for all content of text_content is loaded
		};
		
		if (popup)
		{
		var popup_height = document.getElementById("popup").offsetHeight; //dynamic height of the dialog (with dynamic content, borders,...)
		var pos = ((browser.height-popup_height)/2);
			popup["style"]["top"] = pos+"px"; 
		};
				
	
		// prevent dialogs to go out of reach on mobile screen.
		if (iphone && popup || ipod && popup)
		{
			var popup_height = document.getElementById("popup").offsetHeight;
			var content_height = document.getElementById("text_content").offsetHeight;
			if (popup_height >= browser.height)
				{ 
					popup["style"]["height"] = (browser.height-10)+"px"; 
					var over = popup_height-browser.height;
					text_content["style"]["height"] = (content_height-over-10)+"px";
					//alert("browser: "+browser.height+" popup: "+popup_height+" content: "+content_height);
					/*if (browser.height == 320) // horizontal
					{ text_content["style"]["maxHeight"] = "130px"; }
					else // vertical 
					{ text_content["style"]["minHeight"] = "290px"; }*/
				}	
			};
			
	};

	instanceProto.addDialog = function(id, title, content, type, defaultvalue, nb_button, buttonA, buttonB, defaultbutton)
	{	

	//null
		var div_null = document.createElement("div");
			div_null.id = "div_null";
			div_null["style"]["visibility"] = "hidden";
			div_null["style"]["opacity"] = "0";
			div_null["style"]["position"] = "fixed";
			div_null["style"]["top"] = "0";
			div_null["style"]["left"] = "0";
			div_null["style"]["right"] = "0";
			div_null["style"]["bottom"] = "0";
			div_null["style"]["width"] = "100%";
			div_null["style"]["height"] = "100%";
			div_null["style"]["background"] = "-moz-radial-gradient(center, ellipse cover, rgba(255,255,255,0.5) 30%, rgba(0,0,0,0.7) 120%)";			
			div_null["style"]["background"] = "-webkit-radial-gradient(center, ellipse cover, rgba(255,255,255,0.5) 30%, rgba(0,0,0,0.7) 120%)";				

	// popup
		var Popup = document.createElement("div");
		var Popup_size = 275;
			Popup.id = "popup";
			Popup["style"]["cursor"] = "default";
			Popup["style"]["overflow"] = "hidden";
			Popup["style"]["position"] = "absolute";
			Popup["style"]["top"] = "25%";
			Popup["style"]["left"] = "50%";
			Popup["style"]["width"] = Popup_size+"px";
			Popup["style"]["height"] = "auto";
			Popup["style"]["marginLeft"] = "-"+(Popup_size/2)+"px";;
			Popup["style"]["opacity"] = "0"; 
			Popup["style"]["webkitTransform"] = "scale(0)";
			Popup["style"]["webkitTransition"] = "all 0.25s  ease-in-out";
			Popup["style"]["zIndex"] = "1000";
			
			Popup["style"]["fontFamily"] = "Tahoma, Arial, Helvetica, sans-serif";
			Popup["style"]["fontSize"] = "15px";
			Popup["style"]["color"] = "#fff"; 
			Popup["style"]["textShadow"] = "0px -1px 0px #000";
			Popup["style"]["textAlign"] = "center";

			Popup["style"]["border"] = "solid 2.5px rgba(241,246,255,0.9)";
			Popup["style"]["borderRadius"] = "10px";
			Popup["style"]["webkitBoxShadow"] = "0pt 0px 0px 1px rgba(140, 140, 140, 0.5), 0px 0px 1px #72767b, 0px 4px 6px #666, 0px 0px 200px rgba(192,205,223,0.9)"; 
			Popup["style"]["mozBoxShadow"] = "0pt 0px 0px 1px rgba(140, 140, 140, 0.5), 0px 0px 1px #72767b, 0px 4px 6px #666, 0px 0px 200px rgba(192,205,223,0.9)";
			Popup["style"]["boxShadow"] = "0pt 0px 0px 1px rgba(140, 140, 140, 0.5), 0px 0px 1px #72767b, 0px 4px 6px #666, 0px 0px 200px rgba(192,205,223,0.9)";

			Popup["style"]["backgroundColor"] = "rgba(171, 171, 171, 0)";
			Popup["style"]["background"] = "-moz-radial-gradient(center, ellipse cover, rgba(0,22,77,0.8) 0%, rgba(16,36,82,0.8) 100%)";			
			Popup["style"]["background"] = "-webkit-radial-gradient(center, ellipse cover, rgba(0,22,77,0.8) 0%, rgba(16,36,82,0.8) 100%)";			
			
			Popup["style"]["webkitTapHighlightColor"] = "rgba(0,0,0,0)"; // disable highlight tap
						
		Popup.ontouchstart = (function (self) {
				return function() {
					self.runtime.trigger(cr.plugins_.iosdialogs.prototype.cnds.isOnTouch, self);
					};
				})(this);
		
		// desktop escape
		jQuery(document).keyup(function(e) {
				if (e.keyCode == 27) { 
					jQuery(Popup).fadeOut(100);
							setTimeout(function() { jQuery(div_null).fadeOut(400); }, 100); 						
							setTimeout(function() { jQuery(div_null).remove(); }, 500); 
					}   
		});
		
		/* prevent enter
		jQuery(document).keyup(function(e) {
				if (e.keyCode == 13) { 
					
					}   
		});*/
	
		/*Popup.ondblclick = (function (self) {
				return function() {
					self.runtime.trigger(cr.plugins_.iosdialogs.prototype.cnds.isOnTouch, self);
					};
				})(this);	*/	
				
		var Glossy = document.createElement("div");
			Glossy["style"]["width"] = "350px"; 
			Glossy["style"]["height"] = "100px"; 
			Glossy["style"]["position"] = "absolute"; 
			Glossy["style"]["top"] = "-80px"; 
			Glossy["style"]["left"] = "-30px"; 
			Glossy["style"]["background"] = "-moz-radial-gradient(center, ellipse cover, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.1) 75%, rgba(19,19,19,0) 40%, rgba(19,19,19,0) 70%)";
			Glossy["style"]["background"] = "-webkit-radial-gradient(center, ellipse cover, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.1) 75%, rgba(19,19,19,0) 40%, rgba(19,19,19,0) 70%)"; 
	
	// content
		var Text_title = document.createElement("span");
			Text_title["style"]["display"] = "block";
			Text_title["style"]["padding"] = "15px";
			Text_title["style"]["fontWeight"] = "bold";
			Text_title["style"]["fontSize"] = "17px";
			Text_title.innerHTML = title;
		var Text_content = document.createElement("span");
			Text_content.id = "text_content";
			Text_content["style"]["display"] = "block";
			Text_content["style"]["overflow"] = "hidden"; //
			Text_content["style"]["margin"] = "0 10px";
		if (nb_button == 0) { Text_content["style"]["marginBottom"] = "15px"; };
			Text_content.innerHTML = content;
		
		// disable text selection
		Text_title.onmousedown = function () {
			Text_title["style"]["UserSelect"] = "none"; 
			Text_title["style"]["MozUserSelect"] = "none"; 
			Text_title["style"]["webkitUserSelect"] = "none"; 
			return false;
			};
		Text_content.onmousedown = function () {
			Text_content["style"]["UserSelect"] = "none"; 
			Text_content["style"]["MozUserSelect"] = "none"; 
			Text_content["style"]["webkitUserSelect"] = "none"; 
			return false;
			};	
			
		// prevent selection when long tap	
		Text_title.ontouchstart = function () {
			return false;
			};	
		Text_content.ontouchstart = function () {
			return false;
			};		
			
			
		if (type == 1) //input
		{
			var Inputform = document.createElement("form");
				Inputform.id = "input_form";
			var Inputline = document.createElement("input");
				Inputline.id = "input_line_"+id;
				Inputline.className = "input";	
				Inputline.name = "inputtext_form";
				Inputline["style"]["width"] = "96%";
				Inputline.type = "text";
				Inputline.value = defaultvalue;
				if (nb_button == 0) { Inputline["style"]["marginBottom"] = "15px"; };
			// corrige bug touch plugin
			Inputline.addEventListener('touchstart', function(e) {
					e.stopPropagation();
					}, false);	
			Inputline.addEventListener('touchmove', function(e) {
					e.stopPropagation();
					}, false);	
			Inputline.addEventListener('touchend', function(e) {
					e.stopPropagation();
					}, false);	
			
		}
		else if (type == 2) //multiline
		{	
			var Inputform = document.createElement("form");
				Inputform.id = "input_form";
			var Inputline = document.createElement("textarea");
				Inputline.id = "input_line_"+id;
				Inputline.name = "textarea_form";
				Inputline.className = "input";	
				Inputline["style"]["width"] = "96%";
				Inputline.value = defaultvalue;
				if (nb_button == 0) { Inputline["style"]["marginBottom"] = "15px"; };
				// corrige bug touch plugin
				Inputline.addEventListener('touchstart', function(e) {
					e.stopPropagation();
					}, false);	
				Inputline.addEventListener('touchmove', function(e) {
					e.stopPropagation();
					}, false);	
				Inputline.addEventListener('touchend', function(e) {
					e.stopPropagation();
					}, false);
		} else {};
		
		
		
		if (nb_button == 1)
		{
		// footer
		var Footer = document.createElement("div");
			Footer["style"]["width"] = "100%";
			Footer["style"]["maxHeight"] = "62px"; 
		var ButtonA = document.createElement("span");
			ButtonA.innerHTML = buttonA;
				if (defaultbutton == 0) { var bAclass = "button default" } else { var bAclass = "button" };
			ButtonA.className = bAclass;
		// disable text selection
		Footer.onmousedown = function () {
			Footer["style"]["UserSelect"] = "none"; 
			Footer["style"]["MozUserSelect"] = "none"; 
			Footer["style"]["webkitUserSelect"] = "none"; 
			};
		} 
		else if (nb_button == 2)
		{
		// footer
		var Footer = document.createElement("div");
			Footer["style"]["width"] = "100%";
			Footer["style"]["maxHeight"] = "62px"; 
		var ButtonA = document.createElement("span");
			ButtonA.innerHTML = buttonA;
				if (defaultbutton == 0) { var bAclass = "button default" } else { var bAclass = "button" };
			ButtonA.className = bAclass;
		var ButtonB = document.createElement("span");
				if (defaultbutton == 1) { var bBclass = "button default" } else { var bBclass = "button" };
			ButtonB.className = bBclass;
			ButtonB.innerHTML = buttonB;
		Footer.onmousedown = function () {
			Footer["style"]["UserSelect"] = "none"; 
			Footer["style"]["MozUserSelect"] = "none"; 
			Footer["style"]["webkitUserSelect"] = "none"; 
			};			
		} else {};
			
	// function renvoie information saisie (button, text..)	
		
		if (nb_button == 1)
		{
			ButtonA.ontouchstart = function()
						{
							ButtonA.className = "button hover";
						};
			ButtonA.ontouchend = function()
						{
							ButtonA.className = bAclass;
						};	
			ButtonA.onclick = (function (self) {
				return function() {
					input_idSpace[id]["first_button"] = true; 
					input_idSpace[id]["second_button"] = false; 
				if (type != 0)
					{ var input_value = document.forms["input_form"].elements["input_line_"+id].value;
					input_idSpace[id]["input_content"] = input_value; };
					triggerID = id;
					//alert(id+" "+input_idSpace[id].first_button+" "+input_idSpace[id].second_button+" "+input_idSpace[id].input_content); // debug
					jQuery(Popup).fadeOut(100);
					setTimeout(function() { jQuery(div_null).fadeOut(400); }, 100); 						
					setTimeout(function() { jQuery(div_null).remove(); }, 500); 
					self.runtime.trigger(cr.plugins_.iosdialogs.prototype.cnds.isFirstClicked, self);
					};
				})(this);	
				
			// GREG - Bug Touch Plugin	
			ButtonA.addEventListener('touchstart', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonA.addEventListener('touchmove', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonA.addEventListener('touchend', function(e) {
					e.stopPropagation();
					}, false);
			/////////////////////////////
		} else if (nb_button == 2)
		{
			ButtonA.ontouchstart = function()
							{
								ButtonA.className = "button hover";
							};
			ButtonA.ontouchend = function()
							{
								ButtonA.className = bAclass;
							};
			ButtonA.onclick = (function (self) {
				return function() {
					input_idSpace[id]["first_button"] = true; 
					input_idSpace[id]["second_button"] = false; 
				if (type != 0)
					{ var input_value = document.forms["input_form"].elements["input_line_"+id].value;
					input_idSpace[id]["input_content"] = input_value; };
					triggerID = id;
					//alert(id+" "+input_idSpace[id].first_button+" "+input_idSpace[id].second_button+" "+input_idSpace[id].input_content); // debug
					jQuery(Popup).fadeOut(100);
					setTimeout(function() { jQuery(div_null).fadeOut(400); }, 100); 						
					setTimeout(function() { jQuery(div_null).remove(); }, 500); 
					self.runtime.trigger(cr.plugins_.iosdialogs.prototype.cnds.isFirstClicked, self);
					};
				})(this);
			ButtonB.ontouchstart = function()
						{
							ButtonB.className = "button hover";
						};
					
			ButtonB.ontouchend = function()
						{
							ButtonB.className = bBclass;
						};	
			ButtonB.onclick = (function (self) {
				return function() {
					input_idSpace[id]["first_button"] = false; 
					input_idSpace[id]["second_button"] = true; 
				if (type != 0)
					{ var input_value = document.forms["input_form"].elements["input_line_"+id].value;
					input_idSpace[id]["input_content"] = input_value; };
					triggerID = id;
					//alert(id+" "+input_idSpace[id].first_button+" "+input_idSpace[id].second_button+" "+input_idSpace[id].input_content); // debug
					jQuery(Popup).fadeOut(100);
					setTimeout(function() { jQuery(div_null).fadeOut(400); }, 100); 						
					setTimeout(function() { jQuery(div_null).remove(); }, 500); 
					self.runtime.trigger(cr.plugins_.iosdialogs.prototype.cnds.isSecondClicked, self);
					};
				})(this);
			// GREG - Bug Touch Plugin	
			ButtonA.addEventListener('touchstart', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonA.addEventListener('touchmove', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonA.addEventListener('touchend', function(e) {
					e.stopPropagation();
					}, false);
			ButtonB.addEventListener('touchstart', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonB.addEventListener('touchmove', function(e) {
					e.stopPropagation();
					}, false);	
			ButtonB.addEventListener('touchend', function(e) {
					e.stopPropagation();
					}, false);
			/////////////////////////////	
		};
		
		jQuery(div_null).appendTo("body"); 
					div_null.appendChild(Popup);
					Popup.appendChild(Glossy);
					Popup.appendChild(Text_title);
					Popup.appendChild(Text_content);
					if (type == 1 || type == 2) { Popup.appendChild(Inputform); Inputform.appendChild(Inputline); };
					if (nb_button == 1) {
						Popup.appendChild(Footer);
						Footer.appendChild(ButtonA);
					} else if (nb_button == 2) {
						Popup.appendChild(Footer);
						Footer.appendChild(ButtonA);
						Footer.appendChild(ButtonB);
					};
	};
	
	
	instanceProto.draw = function ()
	{
	};	
		
	instanceProto.drawGL = function(glw)
	{
	};
				
	instanceProto.onDestroy = function ()
	{
		jQuery(this.elem).remove();
		this.elem = null;
	};
	

	//////////////////////////////////////
	//Actions/////////////////////////////
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	
	acts.inputbox = function (id, title, message, input, nb_button, label_buttonA, label_buttonB, default_button)
	{	
			
	// test system id		
		input_idSpace[id] = this.addDialog(id, title, message, 1, input, nb_button, label_buttonA, label_buttonB, default_button); 
		input_idSpace[id] = { 
			first_button 	: false,
			second_button	: false,
			input_content	: "" };
				
		var div_null = document.getElementById("div_null");
			div_null["style"]["opacity"] = "1";	
			div_null["style"]["visibility"] = "visible";
			jQuery(div_null).fadeIn();	
		var Popup = document.getElementById("popup");
			Popup["style"]["opacity"] = "1"; 
			Popup["style"]["webkitTransform"] = "scale(1)";
		
		this.updateDialogPosition();
		var text_content = document.getElementById("text_content");
		var i = text_content.innerHTML;
		jQuery(i).load(function() { instanceProto.updateDialogPosition(); });
	
	//	document.getElementById("input_line_"+id).focus();
	//	document.getElementById("input_line_"+id).select();
		
			
	};

	acts.alertbox = function (id, title, message, nb_button, label_buttonA, label_buttonB, default_button)
	{	
		input_idSpace[id] = this.addDialog(id, title, message, 0, "", nb_button, label_buttonA, label_buttonB, default_button); 	
		input_idSpace[id] = { 
			first_button 	: false,
			second_button	: false,
			input_content	: "" };

		var div_null = document.getElementById("div_null");
			div_null["style"]["opacity"] = "1";	
			div_null["style"]["visibility"] = "visible";
			jQuery(div_null).fadeIn();	
		var Popup = document.getElementById("popup");
			Popup["style"]["opacity"] = "1"; 
			Popup["style"]["webkitTransform"] = "scale(1)";
		
		this.updateDialogPosition();
		var text_content = document.getElementById("text_content");
		var i = text_content.innerHTML;
		jQuery(i).load(function() { instanceProto.updateDialogPosition(); });
	};	
	
	acts.listbox = function (id, title, message, input, nb_button, label_buttonA, label_buttonB, default_button)
	{	
		input_idSpace[id] = this.addDialog(id, title, message, 2, input, nb_button, label_buttonA, label_buttonB, default_button);
		input_idSpace[id] = { 
			first_button 	: false,
			second_button	: false,
			input_content	: "" };

		var div_null = document.getElementById("div_null");
			div_null["style"]["opacity"] = "1";	
			div_null["style"]["visibility"] = "visible";
			jQuery(div_null).fadeIn();	
		var Popup = document.getElementById("popup");
			Popup["style"]["opacity"] = "1"; 
			Popup["style"]["webkitTransform"] = "scale(1)";
		
	//	document.getElementById("input_line_"+id).focus();
	//	document.getElementById("input_line_"+id).select();		
		
		this.updateDialogPosition();
		var text_content = document.getElementById("text_content");
		var i = text_content.innerHTML;
		jQuery(i).load(function() { instanceProto.updateDialogPosition(); });	
	};	
	
	acts.customInputForm = function (id, valueText, textAlignment, formType, placeHolder, toolTip, enabledStatus, readOnlyStatus, maxlengthForm, widthForm)
	{	
		var elem = document.getElementById("input_line_"+id);
		if (!elem) { return false; };
		
		if (widthForm >= 96) { elem["style"]["width"] = "96%"; } else { elem["style"]["width"] = widthForm+"%"; }; 
		if (elem.name == "inputtext_form")
		{
			switch (formType) {
								case 0:
									elem.type = "text";
								break;
								case 1:
									elem.type = "password";
								break;
								case 2:
									elem.type = "email";
								break;
								case 3:
									elem.type = "number";
								break;
								case 4:
									elem.type = "tel";
								break;
								case 5:
									elem.type = "url";
								break;
							};	
		};
		elem.value = valueText;
		if (textAlignment == 0) { elem["style"]["textAlign"] = "left"; } 
			else if (textAlignment == 1) { elem["style"]["textAlign"] = "center"; }
			else { elem["style"]["textAlign"] = "right"; };
		elem.placeholder = placeHolder;
		elem.title = toolTip;
		elem.maxLength = maxlengthForm;
		elem.disabled = (enabledStatus === 1);
		elem.readOnly = (readOnlyStatus === 0);
		
	};		
	
	acts.closeDialog = function ()
	{	
		var div_null = document.getElementById("div_null");
		var Popup = document.getElementById("popup");
			jQuery(Popup).fadeOut(100);
			setTimeout(function() { jQuery(div_null).fadeOut(400); }, 100); 						
			setTimeout(function() { jQuery(div_null).remove(); }, 500); 
	};	
	
	/*acts.debugTool = function ()
	{	
		alert(screen.height+" "+screen.width); 
	};	*/
	
		
	//////////////////////////////////////
	//Conditions/////////////////////////
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	cnds.isFirstClicked = function (id)
	{
		if (id == triggerID) { return input_idSpace[id]["first_button"]; };
	};
	
	cnds.isSecondClicked = function (id)
	{
		if (id == triggerID) { return input_idSpace[id]["second_button"]; }
	};
	
	cnds.isOnTouch = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	//Expressions/////////////////////////
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	exps.getInput = function(ret, id)
	{
		var i = input_idSpace[id]["input_content"];
		ret.set_any(i);
	};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}());