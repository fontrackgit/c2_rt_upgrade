

(function ()
{
	var pluginProto = cr.plugins_.iScroll.prototype;
		
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
		this.triggerID = null;
		this.triggerSwipe = null;
		this.triggerToggle = null;
	};

	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		var wrapperID = "wrapper_"+this.uid;
		this.globalWidth = this.properties[11];
		this.truncate = [true,false][this.properties[24]];
		this.fakelink = [true,false][this.properties[9]];
		this.linkStyle = [this.properties[10]];
		this.isFullScreen = [true,false][this.properties[0]];
		this.vscrollbar = [true,false][this.properties[13]];
		this.vscrolling = [true,false][this.properties[12]];
		this.fixedScroll = [true,false][this.properties[14]];
		this.bounce = [true,false][this.properties[15]];
		this.backgroundD = [true,false][this.properties[22]];
		this.iOS_version = [true,false][this.properties[2]];
		var createHeader = [true,false][this.properties[16]];
		var createFooter = [true,false][this.properties[19]];
		

	// Disable auto-link as phone number, etc.
		var disablePhonelinks = "<meta name=\"format-detection\" content=\"telephone=no\" />" 
		jQuery(disablePhonelinks).appendTo("head");	
	


	// Feuille de style CSS pour toggle		
	//	jQuery(toggle_iosFive).appendTo("head");			
	
	
	
	// WRAPPER parent
		this.elem = document.createElement("div");
		this.elem.id = wrapperID;
		this.elem.style.position = "absolute";
		this.elem.style.width = "100%";
		this.elem.style.overflow = "auto";
		this.elem.style.margin = "0";
		var Header = document.getElementById("header");
		var Footer = document.getElementById("footer");
		if (window.navigator.standalone) { this.elem.style.top = "20px"; this.elem.style.bottom = "0px"; this.elem.style.left = "0px"; } 
			else { this.elem.style.top = "0px"; this.elem.style.bottom = "0px"; this.elem.style.left = "0px";} ; 
		if (this.backgroundD == true) { this.elem.style.background = this.properties[23]; } else { this.elem.style.background = "none"; };			
		if ( navigator.userAgent.indexOf('Opera') != -1 ) { this.elem.style.fontFamily = "arial"; } else { this.elem.style.fontFamily = "helvetica"; };
		this.elem.style.zIndex = this.properties[25];
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		
				
	// SCROLLER
		var newScroller = document.createElement("div");
			newScroller.id = "scroller_"+this.uid;
			newScroller.style.WebkitTransform = "translate3d(0,0,0)"; // prevent scrolling bug
			newScroller.style.position = "absolute";
			newScroller.style.zIndex = this.properties[25];
			newScroller.style.width = "100%";
			newScroller.style.padding = "0";
			newScroller.style.margin = "0";
	
	// UL 
		var newUL = document.createElement("ul");
			newUL.id = "ul_id_"+this.uid;
			newUL.style.width = this.globalWidth+"%";
			newUL.style.paddingLeft = (100-this.globalWidth)/2+"%";
			newUL.style.paddingRight = (100-this.globalWidth)/2+"%";
			newUL.style.margin = "0";
			newUL.style.WebkitTextSizeAdjust = "none"; // prevent bug text scaling on orient change

		var ElementParent = document.getElementById(this.elem.id);
			ElementParent.appendChild(newScroller);
		var ElementParent2 = document.getElementById("scroller_"+this.uid);
			ElementParent2.appendChild(newUL);
		
	// Header & Footer (set in properties)	
		if(createHeader == true)
			{ this.createHeader(); };
		if(createFooter == true)
			{ this.createFooter(); };
		
	// iScroll Initialization	
		var myScroll = new window["iScroll"] (wrapperID, {"hScrollbar": false, 
												"vScrollbar": this.vscrollbar, 
												"vScroll": this.vscrolling, 
												"fixedScrollbar": this.fixedScroll, 
												"bounce": this.bounce,
												// prevent form bug with iScroll
												"onBeforeScrollStart": function (e) { 
																		var target = e.target;
																		while (target.nodeType != 1) target = target.parentNode;
																		if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
																		e.preventDefault();
																	}
												}
									);
		
		this.myScroll = myScroll;	
			
	// Prevent bugs
		document.addEventListener('touchmove', function (e) {e.preventDefault(); }, false); // use this for compatibility with iDevice & Android (prevents whole window scrolling)
		document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false); 
		
		function loaded() 
			{
				setTimeout(function () {
				myScroll.refresh();
				}, 100);
				jQuery('.fakeHighlightLink').on('click', function(e){ e.preventDefault(); });	// disable default click on link with class "fakeHighlightLink"
											// -> live allows to influence also on new dynamically adds
			};
			
		window.addEventListener('load', loaded, false);
		
	// Triggers
		myScroll.options.onScrollMove = (function (self) {
			return function() {
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.onScrollMove, self);
			};
		})(this);
		
		myScroll.options.onScrollEnd = (function (self) {
			return function() {
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.onScrollEnd, self);
			};
		})(this);
		
		
		//save ID element ontouchmove
		jQuery(".swipe").on('touchstart', (function(self) {
				return function() {
					var id_triggering = jQuery(this).attr("id");
					//alert(id_triggering);
					self.triggerSwipe = id_triggering;
				};
			})(this));
		jQuery(".swipe").on('touchend', (function(self) {
				return function() {
					var id_triggering = jQuery(this).attr("id");
					//alert(id_triggering);
					self.triggerSwipe = null;
				};
			})(this));		

		//swipe to delete triggering
		jQuery(document).ready(( function(self) { 
				return function() {
				jQuery('.swipe').swipe({
					"swipeLeft": function() {
							self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isSwipingLeft, self);
							//alert(self.triggerSwipe);
							},
					"swipeRight": function() { 		
							self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isSwipingRight, self);
							//alert(self.triggerSwipe);
							}
							}); 
					}})(this));		

		this.updatePosition();
		this.runtime.tickMe(this);
	};

	instanceProto.createHeader = function()
	{
		// new Header
			var newHeader = document.createElement("header");
				newHeader.id = "header";
				newHeader.style.position = "absolute";
				if (window.navigator.standalone) { newHeader.style.top = "20px"; } else { newHeader.style.top = "0px";} ; // put the iscroll object under the status bar in an iphone webapp
				newHeader.style.left = "0";
				newHeader.style.height = this.properties[18]+"px";
				newHeader.style.lineHeight = this.properties[18]+"px";
				newHeader.style.width = "100%"
				newHeader.style.padding = "0";
				newHeader.style.background = "#6f85a3";
				

		// test webfonts (works)
			var webfont = document.createElement("link");
				webfont.href = "http://fonts.googleapis.com/css?family=Frijole";
				webfont.rel = "stylesheet";
				webfont.type = "text/css";
			document.getElementsByTagName('head')[0].appendChild(webfont);	
			//	newHeader.style.fontFamily = "helvetica";
				newHeader.style.fontFamily = "Frijole";
				
				newHeader.style.fontSize = "20px";
				newHeader.style.fontWeight = "bold";
				newHeader.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)";
				newHeader.style.textAlign = "center";
				newHeader.style.color = "#ffffff";
				newHeader.style.zIndex = this.properties[25]+1;
				if (window.navigator.standalone) { this.elem.style.top = this.properties[18]+20+"px"; } else { this.elem.style.top = this.properties[17]+"px"; };
			
			var newText = document.createElement("span");
				newText.id = "text_header";
				newText.innerHTML = this.properties[17];
			
			newHeader.appendChild(newText);
			jQuery(newHeader).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 
				
			// disable text selection
			if (newHeader.onmousedown) 
				{ newHeader["style"]["MozUserSelect"] = "normal"; }
			else
				{ newHeader["style"]["MozUserSelect"] = "none"; };
		
	};
	
	instanceProto.createFooter = function()
	{
		// new Footer
			var newFooter = document.createElement("footer");
				newFooter.id = "footer";
				newFooter.style.position = "absolute";
				newFooter.style.bottom = "0";
				newFooter.style.left = "0";
				newFooter.style.height = this.properties[21]+"px";
				newFooter.style.lineHeight = "45px";
				newFooter.style.width = "100%";
				newFooter.style.borderTop = "1px solid #444";
				newFooter.style.padding = "0";
				newFooter.style.background = "#171717";
				newFooter.style.fontFamily = "helvetica";
				newFooter.style.fontSize = "20px";
				newFooter.style.fontWeight = "bold";
				newFooter.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)";
				newFooter.style.textAlign = "center";
				newFooter.style.color = "#ffffff";
				newFooter.style.zIndex = this.properties[25]+1;
				this.elem.style.bottom = this.properties[21]+"px";
			
			var newText = document.createElement("span");
				newText.id = "text_footer";
				newText.innerHTML = this.properties[20];			
			
			newFooter.appendChild(newText);
			jQuery(newFooter).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 
					
			// disable text selection		
			if (newFooter.onmousedown) 
				{ newFooter["style"]["MozUserSelect"] = "normal"; }
			else
				{ newFooter["style"]["MozUserSelect"] = "none";};
		
	};
	
	instanceProto.fakeHighlightTap = function(link_anchor, highlight_bar, link_url) //click event on anchors is disabled - it's replaced by window.location
	{
		highlight_bar.style.display = "none";
		var timerA;
		var timerB;
						
		// onclick (for touch & desktop)
			link_anchor.onclick = function() 
			{ 
			timerA = setTimeout(function() { highlight_bar.style.display = "inline"; }, 200); // set link color after 200ms
			timerB = setTimeout(function() { window.location = link_url; }, 400); // fire the link after 400 ms (set link color + 200ms)
			setTimeout(function() { highlight_bar.style.display = "none"; }, 500); // the element is highlighted only 500ms ( 100ms after eventual the link was fired. Reduce the bug effect when onmousedown )
																				
			};
					
		// onTouchMove & onMouseMove
			link_anchor.onmousemove = function() 
			{
			clearTimeout(timerA); // reset Timeout
			clearTimeout(timerB); // reset Timeout 
			highlight_bar.style.display = "none";
			};
			link_anchor.ontouchmove = function() 
			{
			clearTimeout(timerA); // reset Timeout 
			clearTimeout(timerB); // reset Timeout 
			highlight_bar.style.display = "none";
			};
					
		// onTouchStart & onMouseDown
			link_anchor.ontouchstart = function() { highlight_bar.style.display = "none"; }; 
			link_anchor.onmousedown = function() { highlight_bar.style.display = "none"; }; 
					
		// onTouchEnd & onMouseUp
			link_anchor.onmouseup = function() { highlight_bar.style.display = "none"; }; 
			link_anchor.ontouchend = function() { highlight_bar.style.display = "none"; }; 
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
		
	instanceProto.tick = function ()
	{
		this.updatePosition();
    };
	
	instanceProto.updatePosition = function () 
	{
		if (this.isFullScreen == true) // if destination is fullscreen ( prevent a bug )
		{  }
		else if (this.isFullScreen == false) // if destination is a frame ( prevent a bug )
		{
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		
		// Is entirely offscreen or invisible: hide
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			jQuery(this.elem).hide();
			return;
		}
		
		if (this.truncate == true) // ability to disable
		{
			//Truncate to canvas size
			if (left < 1)
				left = 1;
			if (top < 1)
				top = 1;
			if (right >= this.runtime.width)
				right = this.runtime.width - 1;
			if (bottom >= this.runtime.height)
				bottom = this.runtime.height - 1; 
		} else {};
			
		jQuery(this.elem).show();
		
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(right - left); 
		jQuery(this.elem).height(bottom - top); 

		};
	};
	

	//////////////////////////////////////
	//Actions/////////////////////////////
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	//ACTION  addLine 
	acts.add_Line = function (text, id, linkActive, linkURL, topSpace, bottomSpace, leftSpace, rightSpace, topinnerSpace, bottominnerSpace, 
																					lineHeight, heightLine, lineWidth, bgColor, textAlign)      

	{
		if (linkActive === 0) // if a link
		{
		// link
			var newLink = document.createElement("a");
				newLink.href = linkURL;
				newLink.className = "fakeHighlightLink"; 
				newLink.style.textDecoration = "none";
		
		// new Line		
			var newLine = document.createElement("li");
				newLine.className = "swipe"; // add swipe to delete support
				if (id.toString() == ">USE UNIQUE ID<") { } else {  newLine.id = id; };
				newLine.style.width = lineWidth-(leftSpace+rightSpace)+"%"; 
				newLine.style.listStyle = "none";
				newLine.style.paddingLeft = leftSpace+"%";  
				newLine.style.paddingRight = rightSpace+"%";
				newLine.style.paddingTop = topinnerSpace+"%";  
				newLine.style.paddingBottom = bottominnerSpace+"%";
				newLine.style.left = (100-lineWidth)/2+"%";				
				newLine.style.marginTop= topSpace+"px"; 
				newLine.style.marginBottom = bottomSpace+"px"; 
				newLine.style.cssFloat = "none";
				newLine.style.overflow = "hidden"; 
				newLine.style.position = "relative";
				if (lineHeight.toString().toLowerCase() == "auto") // height of line
					{ 
					newLine.style.height = "auto"; 
					newLine.style.paddingTop = "3%";  
					newLine.style.paddingBottom = "3%";					
					}
				else
					{ newLine.style.height = lineHeight+"px"; };
				if (heightLine.toString().toLowerCase() == "auto") // line-height of line
					{ newLine.style.lineHeight = "normal"; }
				else
					{ newLine.style.lineHeight = heightLine+"px"; };
					
				newLine.style.background = bgColor.toString();
			/*	newLine.style.borderRadius = "0px 0px 0px 0px"; 
				newLine.style.MozBorderRadius = "0px 0px 0px 0px"; 
				newLine.style.WebkitBorderRadius = "0px 0px 0px 0px";  */ 
				newLine.style.fontFamily = "helvetica";
				newLine.style.fontSize = "12pt";
				newLine.style.color = "black";
				if (textAlign === 0){ newLine.style.textAlign = "left" } else if (textAlign === 1){ newLine.style.textAlign = "center" } else if (textAlign === 2) { newLine.style.textAlign = "right" };
				newLine.style.zIndex = this.properties[25];
			
				newLine.onclick = (function(self) { //self remplace this
						return function() {
						self.triggerID = id;
						//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
						//alert ("id renvoie "+id); //debug mode
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
						};
					})(this);	
						
			var newText = document.createElement("span"); 
				newText.id = "text_"+id;
				newText.innerHTML = text;			
				
			var ElementParent = document.getElementById("ul_id_"+this.uid);
				ElementParent.appendChild(newLink);
				newLine.appendChild(newText);
				newLink.appendChild(newLine);
			
			if (this.fakelink == true) 
			{
			// DIV fakeHighlightTap
				var newDIV = document.createElement("div");
					newDIV.id = "fakelink_"+id;
					newDIV.style.height = "100%";
					newDIV.style.width = "100%";
					newDIV.style.position = "absolute";
					newDIV.style.top = "0px";
					newDIV.style.left = "0px";
					newDIV.style.background = this.linkStyle.toString();
				/*	newDIV.style.borderRadius = "0px 0px 0px 0px"; 
					newDIV.style.MozBorderRadius = "0px 0px 0px 0px"; 
					newDIV.style.WebkitBorderRadius = "0px 0px 0px 0px"; */
					newDIV.style.display = "none";
					newDIV.style.zIndex = this.properties[25]+1;
				newLine.appendChild(newDIV);
				
				this.fakeHighlightTap(newLink, newDIV, linkURL); 
				
			} else {
		
			// onclick (for touch & desktop)
			newLink.onclick = function() 
				{ 
				setTimeout(function() { window.location = linkURL; }, 200);
				};
			};
		}
		else  //if not a link
		{
		// new Line
			var newLine = document.createElement("li"); //li
				if (id.toString() == ">USE UNIQUE ID<") { } else {  newLine.id = id; };
				newLine.className = "swipe"; // add swipe to delete support
				newLine.style.width = lineWidth-(leftSpace+rightSpace)+"%"; 
				newLine.style.listStyle = "none";
				newLine.style.paddingLeft = leftSpace+"%";  
				newLine.style.paddingRight = rightSpace+"%";
				newLine.style.paddingTop = topinnerSpace+"%";  
				newLine.style.paddingBottom = bottominnerSpace+"%";				
				newLine.style.left = (100-lineWidth)/2+"%";		
				newLine.style.position = "relative";
				newLine.style.marginTop= topSpace+"px"; 
				newLine.style.marginBottom = bottomSpace+"px"; 
				newLine.style.overflow = "hidden";
				if (lineHeight.toString().toLowerCase() == "auto") // height of line
					{ 
					newLine.style.height = "auto"; 
					newLine.style.paddingTop = "3%";  
					newLine.style.paddingBottom = "3%";					
					}
				else
					{ newLine.style.height = lineHeight+"px"; };
				if (heightLine.toString().toLowerCase() == "auto") // line-height of line
					{ newLine.style.lineHeight = "normal"; }
				else
					{ newLine.style.lineHeight = heightLine+"px"; };
					
				newLine.style.background = bgColor.toString();
			/*	newLine.style.borderRadius = "0px 0px 0px 0px"; 
				newLine.style.MozBorderRadius = "0px 0px 0px 0px"; 
				newLine.style.WebkitBorderRadius = "0px 0px 0px 0px";  */
				newLine.style.fontFamily = "helvetica";
				newLine.style.fontSize = "12pt";
				newLine.style.color = "black";
				if (textAlign === 0){ newLine.style.textAlign = "left" } else if (textAlign === 1){ newLine.style.textAlign = "center" } else if (textAlign === 2) { newLine.style.textAlign = "right" }; 
				newLine.style.zIndex = this.properties[25];
							
				var newText = document.createElement("span"); 
				newText.id = "text_"+id;
				newText.innerHTML = text;
				
				newLine.onclick = (function(self) {
						return function() {
						self.triggerID = id;
						//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
						//alert ("id renvoie "+id); //debug mode
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
						};
					})(this);

			var ElementParent = document.getElementById("ul_id_"+this.uid);
				ElementParent.appendChild(newLine);
				newLine.appendChild(newText);
				
		};

	};

		
	//ACTION addInputLine 
	acts.add_InputLine = function (text, textForm, id, inputHeight, inputWidth, inputType, inputReadonly, topSpace, bottomSpace, leftSpace, rightSpace, 
																			topinnerSpace, bottominnerSpace, lineHeight, lineWidth, bgColor)      

	{
		// new Input Line
			var newInputLine = document.createElement("li"); 
			newInputLine.className = "swipe"; // add swipe to delete support
				if (id.toString() == ">USE UNIQUE ID<") { } else {  newInputLine.id = id; };
				newInputLine["style"]["width"] = lineWidth-(leftSpace+rightSpace)+"%"; 
				newInputLine["style"]["listStyle"] = "none";
				newInputLine["style"]["paddingLeft"] = leftSpace+"%";  
				newInputLine["style"]["paddingRight"] = rightSpace+"%";
				newInputLine["style"]["paddingTop"] = topinnerSpace+"%";  
				newInputLine["style"]["paddingBottom"] = bottominnerSpace+"%";				
				newInputLine["style"]["left"] = (100-lineWidth)/2+"%";						
				newInputLine["style"]["position"] = "relative";
				newInputLine["style"]["marginTop"] = topSpace+"px";
				newInputLine["style"]["marginBottom"] = bottomSpace+"px"; 
				newInputLine["style"]["overflow"] = "hidden";
				newInputLine["style"]["fontFamily"] = "helvetica";
				newInputLine["style"]["fontSize"] = "12pt";
				newInputLine["style"]["color"] = "black";
				if (lineHeight == "auto") 
					{ newInputLine["style"]["height"] = "auto"; }
				else
					{ newInputLine["style"]["height"] = lineHeight.valueOf()+"px"; };  
				if (lineHeight == "auto")
					{ newInputLine["style"]["lineHeight"] = "normal"; } 
				else
					{ newInputLine["style"]["lineHeight"] = lineHeight.valueOf()+"px"; };
				newInputLine["style"]["background"] = bgColor.toString();
			/*	newInputLine.style.borderRadius = "0px 0px 0px 0px"; 
				newInputLine.style.MozBorderRadius = "0px 0px 0px 0px"; 
				newInputLine.style.WebkitBorderRadius = "0px 0px 0px 0px"; */
				newInputLine["style"]["zIndex"] = this.properties[25];
		
		var newText = document.createElement("span"); 
				newText.id = "text_"+id;
				newText.innerHTML = text;
				newText.style.marginRight = "3%";
		
		// input form	
			//rajouter à insérer correctement
			var newLabel = document.createElement("span");
				newLabel.style.cssFloat = "right";
				newLabel.style.width = inputWidth+"%";
				newLabel.style.height = inputHeight+"%";
				
			var newInput = document.createElement("input");
				switch (inputType) {
					case 0:
						newInput["type"] = "text";
					break;
					case 1:
						newInput["type"] = "password";
					break;
					case 2:
						newInput["type"] = "email";
					break;
					case 3:
						newInput["type"] = "number";
					break;
					case 4:
						newInput["type"] = "tel";
					break;
					case 5:
						newInput["type"] = "url";
					break;
				};
				
				newInput["id"] = id+"_input";
				newInput["value"] = textForm;
				newInput["style"]["cssFloat"] = "right";
				if (inputReadonly === 0) { newInput["readOnly"] = true; } else { newInput["readOnly"] = false;};
				if (inputWidth == "auto") { newInput["style"]["width"] = "auto"; } else { newInput["style"]["width"] = inputWidth+"%"; };
				if (inputHeight == "auto") { newInput["style"]["height"] = "auto"; } else { newInput["style"]["height"] = inputHeight+"%"; };
				newInput["style"]["position"] = "relative";
				newInput["style"]["marginRight"] = "auto";
				
			// prevent a bug with form elements in iScroll	
				newInput.addEventListener('mousedown', function(e) {
				e.stopPropagation();
				}, false);
				
				newInput.addEventListener('touchstart', function(e) {
				e.stopPropagation();
				}, false);
				
				newInputLine.onclick = (function(self) {
						return function() {
						self.triggerID = id;
						//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
						//alert ("id renvoie "+id); //debug mode
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
						};
					})(this);
		
				newInput.oninput = (function(self) { 
						return function() {
						self.triggerID = id+"_input";
					//	alert ("this.triggerID renvoie "+self.triggerID); //debug mode
					//	alert ("id renvoie "+id+"_input"); //debug mode
						self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.onTextChanged, self);
						};
					})(this);				
	
			var ElementParent = document.getElementById("ul_id_"+this.uid);
				ElementParent.appendChild(newInputLine);
				newInputLine.appendChild(newText);
				newLabel.appendChild(newInput);
				newInputLine.appendChild(newLabel);
				
				
	};
	
	//ACTION addToggleLine 
	acts.add_ToggleLine = function (text, id, toggleStatus, topSpace, bottomSpace, leftSpace, rightSpace, 
																			topinnerSpace, bottominnerSpace, lineHeight, lineWidth, bgColor)      

	{
		// new Toggle Line
			var newToggleLine = document.createElement("li"); 
			newToggleLine.className = "swipe"; // add swipe to delete support
				newToggleLine.style.listStyle = "none";
				if (id.toString() == ">USE UNIQUE ID<") { } else {  newToggleLine.id = id; };
			// css style for toggle buttons.
				if (this.iOS_version === true || this.iOS_version === false) { ++toggle_t; }; 
				if (this.iOS_version === true && toggle_t == 1) { jQuery(toggle_iosFour).appendTo("head"); } else if (this.iOS_version === false && toggle_t == 1) { jQuery(toggle_iosFive).appendTo("head"); };
				newToggleLine.style.width = lineWidth-(leftSpace+rightSpace)+"%"; 
				if (lineHeight == "auto") 
					{ newToggleLine.style.height = "auto"; }
				else
					{ newToggleLine.style.height = lineHeight.valueOf()+"px"; };  
				if (lineHeight == "auto")
					{ newToggleLine.style.lineHeight = "normal"; } 
				else
					{ newToggleLine.style.lineHeight = lineHeight.valueOf()+"px"; };
				newToggleLine.style.paddingLeft = leftSpace+"%";  
				newToggleLine.style.paddingRight = rightSpace+"%";
				newToggleLine.style.paddingTop = topinnerSpace+"%";  
				newToggleLine.style.paddingBottom = bottominnerSpace+"%";
				newToggleLine.style.left = (100-lineWidth)/2+"%";						
				newToggleLine.style.position = "relative";				
				newToggleLine.style.marginTop= topSpace+"px";
				newToggleLine.style.marginBottom = bottomSpace+"px"; 	
				newToggleLine.style.background = bgColor.toString();
	
			var newText = document.createElement("span"); 
				newText.id = "text_"+id;
				newText.innerHTML = text;
					
			var newSwitch = document.createElement("span"); 
				newSwitch.id = "toggle_"+id;
				if(toggleStatus === 0) { newSwitch.className = "switch on"; } else { newSwitch.className = "switch";};
							
			var newThumb = document.createElement("span");
				newThumb.className = "thumb";
			var newCheckbox = document.createElement("input");
				newCheckbox.type = "checkbox";
				
		// onclick, change on to off (& vv)	
			newSwitch.onclick = function () {
				if (newSwitch.className == "switch on")
					{
						newSwitch.className = "switch";
					} 
				else	
					{
						newSwitch.className = "switch on";
					};
				};
				
			newToggleLine.onclick = (function(self) {
							return function() {
							self.triggerID = id;
							if (newSwitch.className == "switch on")
							{ self.triggerToggle =  0; } else { self.triggerToggle = 1; };
							//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
							//alert ("id renvoie "+id); //debug mode
							self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.toggleStatus, self);
							};
						})(this);		
			
			newSwitch.addEventListener('touchstart', function(e) {
				e.stopPropagation();
				}, false);			
		
	
			var ElementParent = document.getElementById("ul_id_"+this.uid);
				ElementParent.appendChild(newToggleLine);
				newToggleLine.appendChild(newText);
				newToggleLine.appendChild(newSwitch);
				newSwitch.appendChild(newThumb);
				newSwitch.appendChild(newCheckbox);
				
	};
	
	//ACTION addHeader
	acts.add_Header = function (text, headerHeight, headerWidth, bgColor, fontSize, textAlign, fontWeight, fontColor, shadow, linkActive, linkURL)
	{
	// remove the default header
		var initHeader = document.getElementById("header");
			if (initHeader)
			{
				jQuery(initHeader).remove();
			};
			
		if (linkActive === 0) // if a link
		{
		// link
			var newLink = document.createElement("a");
				newLink.href = linkURL;
				newLink.className = "fakeHighlightLink"; 
				newLink.style.textDecoration = "none";	
	
		// new Header
			var newHeader = document.createElement("header")
				newHeader.id = "header";
				newHeader.style.position = "absolute";
				if (window.navigator.standalone) { newHeader.style.top = "20px"; } else { newHeader.style.top = "0px";} ; // essayer en supprimant totalement cette ligne
				newHeader.style.left = (100-headerWidth)/2+"%";
				newHeader.style.height = headerHeight+"px";
				newHeader.style.lineHeight = headerHeight+"px";
				newHeader.style.width = headerWidth+"%";
				newHeader.style.padding = "0";
				newHeader.style.background = bgColor.toString();
				newHeader.style.fontFamily = "helvetica";		
				newHeader.style.fontSize = fontSize+"pt";
				if (fontWeight === 0){ newHeader.style.fontWeight = "normal" } else if (fontWeight === 1){ newHeader.style.fontWeight = "bold" };
				if (shadow === 0){ newHeader.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)" } else if (shadow === 1){ newHeader.style.textShadow = "" };
				if (textAlign === 0){ newHeader.style.textAlign = "left" } else if (textAlign === 1){ newHeader.style.textAlign = "center" } else if (textAlign === 2) { newHeader.style.textAlign = "right" };
				newHeader.style.color = fontColor.toString();
				newHeader.style.zIndex = this.properties[25]+1;
				if (window.navigator.standalone) { this.properties[17]+20+"px"; } else { this.elem.style.top = headerHeight+"px"; }; 
				
			var newText = document.createElement("span");
				newText.id = "text_header";
				newText.innerHTML = text;
			
			newHeader.appendChild(newText);
			newLink.appendChild(newHeader);
			jQuery(newLink).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 

			newHeader.onclick = (function(self) {
				return function() {
				self.triggerID = "header";
				//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
				//alert ("id renvoie "+id); //debug mode
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
				};
			})(this);			
	
			if (this.fakelink == true) 
			{
			// DIV fakeHighlightTap
				var newDIV = document.createElement("div");
					newDIV.style.height = "100%";
					newDIV.style.width = "100%";
					newDIV.style.position = "absolute";
					newDIV.style.top = "0px";
					newDIV.style.left = "0px";
					newDIV.style.background = this.linkStyle.toString();
					newDIV.style.display = "none";
					newDIV.style.zIndex = this.properties[25]+1;
				newHeader.appendChild(newDIV);
				
				this.fakeHighlightTap(newLink, newDIV, linkURL); 
				
			} else {
		// onclick (for touch & desktop)
			newLink.onclick = function() 
				{ 
				setTimeout(function() { window.location = linkURL; }, 200); 
				};
			};
			

		} 
		else  // if not a link
		{
		// new Header
			var newHeader = document.createElement("header")
				newHeader.id = "header";
				newHeader.style.position = "absolute";
				if (window.navigator.standalone) { newHeader.style.top = "20px"; } else { newHeader.style.top = "0px";} ; // essayer en supprimant totalement cette ligne
				newHeader.style.left = (100-headerWidth)/2+"%";
				newHeader.style.height = headerHeight+"px";
				newHeader.style.lineHeight = headerHeight+"px";
				newHeader.style.width = headerWidth+"%";
				newHeader.style.padding = "0";
				newHeader.style.background = bgColor.toString();
				newHeader.style.fontFamily = "helvetica";		
				newHeader.style.fontSize = fontSize+"pt";
				if (fontWeight === 0){ newHeader.style.fontWeight = "normal" } else if (fontWeight === 1){ newHeader.style.fontWeight = "bold" };
				if (shadow === 0){ newHeader.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)" } else if (shadow === 1){ newHeader.style.textShadow = "" };
				if (textAlign === 0){ newHeader.style.textAlign = "left" } else if (textAlign === 1){ newHeader.style.textAlign = "center" } else if (textAlign === 2) { newHeader.style.textAlign = "right" };
				newHeader.style.color = fontColor.toString();
				newHeader.style.zIndex = this.properties[25]+1;
				if (window.navigator.standalone) { this.properties[17]+20+"px"; } else { this.elem.style.top = headerHeight+"px"; }; 

			var newText = document.createElement("span");
				newText.id = "text_header";
				newText.innerHTML = text;
			
			
			newHeader.onclick = (function(self) {
				return function() {
				self.triggerID = "header";
				//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
				//alert ("id renvoie "+id); //debug mode
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
				};
			})(this);

			newHeader.appendChild(newText);
			jQuery(newHeader).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 
		};

		// disable text selection
			if (newHeader.onmousedown) 
				{ newHeader["style"]["MozUserSelect"] = "normal"; }
			else
				{ newHeader["style"]["MozUserSelect"] = "none"; };
	
	
	};
		
	//ACTION addFooter
	acts.add_Footer = function (text, footerHeight, footerWidth, borderSize, bgColor, fontSize, textAlign, fontWeight, fontColor, shadow, linkActive, linkURL)
	{
		// remove the default footer
			var initFooter = document.getElementById("footer");
				if (initFooter)
				{ 
					jQuery(initFooter).remove();
				};

		if (linkActive === 0) // if a link
		{
		// link
			var newLink = document.createElement("a");
				newLink.href = linkURL;
				newLink.className = "fakeHighlightLink"; 
				newLink.style.textDecoration = "none";	
					
		// new Footer	
			var newFooter = document.createElement("footer");
				newFooter.id = "footer";
				newFooter.style.position = "absolute";
				newFooter.style.bottom = "0";
				newFooter.style.left = (100-footerWidth)/2+"%";
				newFooter.style.height = footerHeight+"px";
				newFooter.style.lineHeight = "45px";
				newFooter.style.width = footerWidth+"%";
				newFooter.style.borderTop = borderSize+"px solid #444";
				newFooter.style.padding = "0";
				newFooter.style.background = bgColor.toString();
				newFooter.style.fontFamily = "helvetica";
				newFooter.style.fontSize = fontSize+"pt";
				if (fontWeight === 0){ newFooter.style.fontWeight = "normal" } else if (fontWeight === 1){ newFooter.style.fontWeight = "bold" };
				if (shadow === 0){ newFooter.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)" } else if (shadow === 1){ newFooter.style.textShadow = "" };
				if (textAlign === 0){ newFooter.style.textAlign = "left" } else if (textAlign === 1){ newFooter.style.textAlign = "center" } else if (textAlign === 2) { newFooter.style.textAlign = "right" };
				newFooter.style.color = fontColor.toString();
				newFooter.style.zIndex = this.properties[25]+1;
				this.elem.style.bottom = footerHeight+"px";
				
			var newText = document.createElement("span");
				newText.id = "text_footer";
				newText.innerHTML = text;
			
			newFooter.appendChild(newText);
			newLink.appendChild(newFooter);
			jQuery(newLink).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 

			newFooter.onclick = (function(self) {
				return function() {
				self.triggerID = "footer";
				//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
				//alert ("id renvoie "+id); //debug mode
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
				};
			})(this);				

			if (this.fakelink == true) 
			{
			// DIV fakeHighlightTap
				var newDIV = document.createElement("div");
					newDIV.style.height = "100%";
					newDIV.style.width = "100%";
					newDIV.style.position = "absolute";
					newDIV.style.top = "0px";
					newDIV.style.left = "0px";
					newDIV.style.background = this.linkStyle.toString();
					newDIV.style.display = "none";
					newDIV.style.zIndex = this.properties[25]+1;
				newFooter.appendChild(newDIV);
				
				this.fakeHighlightTap(newLink, newDIV, linkURL); 
				
			} else {
			newLink.onclick = function() 
				{ 
				setTimeout(function() { window.location = linkURL; }, 200); 
				};
			};
		
		
		} 
		else  // if not a link
		{
		// new Footer
			var newFooter = document.createElement("footer");
				newFooter.id = "footer";
				newFooter.style.position = "absolute";
				newFooter.style.bottom = "0";
				newFooter.style.left = (100-footerWidth)/2+"%";
				newFooter.style.height = footerHeight+"px";
				newFooter.style.lineHeight = "45px";
				newFooter.style.width = footerWidth+"%";
				newFooter.style.borderTop = borderSize+"px solid #444";
				newFooter.style.padding = "0";
				newFooter.style.background = bgColor.toString();
				newFooter.style.fontFamily = "helvetica";
				newFooter.style.fontSize = fontSize+"pt";
					if (fontWeight === 0){ newFooter.style.fontWeight = "normal" } else if (fontWeight === 1){ newFooter.style.fontWeight = "bold" };
				if (shadow === 0){ newFooter.style.textShadow = "0 -1px 0 rgba(0,0,0,0.5)" } else if (shadow === 1){ newFooter.style.textShadow = "" };
				if (textAlign === 0){ newFooter.style.textAlign = "left" } else if (textAlign === 1){ newFooter.style.textAlign = "center" } else if (textAlign === 2) { newFooter.style.textAlign = "right" };
				newFooter.style.color = fontColor.toString();
				newFooter.style.zIndex = this.properties[25]+1;
				this.elem.style.bottom = footerHeight+"px";
				
			var newText = document.createElement("span");
				newText.id = "text_footer";
				newText.innerHTML = text;

			newFooter.onclick = (function(self) {
				return function() {
				self.triggerID = "footer";
				//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
				//alert ("id renvoie "+id); //debug mode
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
				};
			})(this);					
			
			newFooter.appendChild(newText);
			jQuery(newFooter).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"); 
		};				

			newFooter.onclick = (function(self) {
				return function() {
				self.triggerID = "footer";
				//alert ("this.triggerID renvoie "+self.triggerID); //debug mode
				//alert ("id renvoie "+id); //debug mode
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isClicked, self);
				self.runtime.trigger(cr.plugins_.iScroll.prototype.cnds.isAnyClicked, self);
				};
			})(this);
		
		// disable text selection	
			if (newFooter.onmousedown) 
				{ newFooter["style"]["MozUserSelect"] = "normal"; }
			else
				{ newFooter["style"]["MozUserSelect"] = "none";};
		
	};
	
	//ACTION iSCROLL removeHeader 
	acts.remove_Header = function ()
	{
		var a = document.getElementById("header");
		if (a)
		{ 
			jQuery(a).remove();
			if (window.navigator.standalone) { this.elem.style.top = "20px"; } else { this.elem.style.top = "0px"; };
		};
	};
		
	//ACTION iSCROLL removeFooter 
	acts.remove_Footer = function ()
	{
		var a = document.getElementById("footer");
		if (a)
		{ 
			jQuery(a).remove();
			this.elem.style.bottom = "0px";
		};
	};
	
	//ACTION removeLine 
	acts.remove_Line = function (id)
	{
		var a = document.getElementById(id);
		if (a)
		{ 
			jQuery(a).remove();
			this.myScroll.refresh();
		};
	};
	
	//ACTION enable/disable vertical scrolling 
	acts.enable_scrolling = function (i)
	{
		if ( i === 0 )
		{
		this.myScroll.options.vScroll = true;
		this.myScroll.options.vScrollbar = [true,false][this.properties[12]]; //prevent a conflict between properties & action
		this.myScroll.refresh();
		}
		else
		{
		this.myScroll.options.vScroll = false;
		this.myScroll.options.vScrollbar = [true,false][this.properties[12]]; //prevent a conflict between properties & action
		this.myScroll.refresh();
		};
	};
	
	//ACTION Scroll to an element
	acts.scrollTo_element = function (i)
	{
		this.myScroll.scrollToElement('#'+i.toString(), 100);
	};

	//ACTION Scroll to Y
	acts.scrollTo_Y = function (i)
	{
		this.myScroll.scrollTo(0, -i, 100);
	};
		
	
	//ACTION refresh scroller 
	acts.refresh_Scroller = function ()
	{
		this.myScroll.refresh();
	};
	
	//ACTION set_toggleStatus
	acts.set_toggleStatus = function (id, status)
	{
		var elem = document.getElementById("toggle_"+id);
			
		if (!elem) 
			{ return false; }
		else if (status === 0) 
			{ elem.className = "switch on"; } 
		else if (status === 1) 
			{ elem.className = "switch"; };
	};
	
	
	//ACTION modify_radiusCorner 
	acts.modify_radiusCorner = function (id, tl, tr, br, bl)
	{
		var elem = document.getElementById(id);
		var link = document.getElementById("fakelink_"+id);
		
		if (elem)
		{
			elem["style"]["borderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
			elem["style"]["MozBorderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
			elem["style"]["WebkitBorderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
		};

		if (link)
		{
			link["style"]["borderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
			link["style"]["MozBorderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
			link["style"]["WebkitBorderRadius"] = tl+"px "+tr+"px "+br+"px "+bl+"px"; 
		};
	};

	//ACTION modify_borders 
	acts.modify_borders = function (id, tb, bb, lb, rb, color)
	{
		var elem = document.getElementById(id);
		
		if (elem)
		{
			elem.style.borderTop = tb+"px solid "+color;
			elem.style.borderBottom = bb+"px solid "+color;
			elem.style.borderLeft = lb+"px solid "+color;		
			elem.style.borderRight = rb+"px solid "+color;
			if (lb+rb != 0) { elem.style.marginLeft = "-"+(lb+rb)/2+"px"; };
		};
	};	
	
	//ACTION modify_fonts 
	acts.modify_fonts = function (id, ffamily, fcolor, fsize)
	{
		var elem = document.getElementById(id);
	
		if (elem)
		{
			elem.style.fontFamily = ffamily;
			elem.style.fontSize = fsize+"pt";
			elem.style.color = fcolor;		
		};
	};	
	
	//ACTION modify_shadow
	acts.modify_shadow = function (id, i, color)
	{
		var elem = document.getElementById(id);
		
		if (elem) {
			if (i === 0)
			{
				elem["style"]["boxShadow"]  = "1px 1px 7px "+color;
				elem["style"]["MozBoxShadow"]  = "1px 1px 7px "+color;
				elem["style"]["WebkitBoxShadow"]  = "1px 1px 7px "+color;
			} else {};
		};
	};
	
	//ACTION modify_images
	acts.modify_images = function (id, bgimage, bgalign, bgrepeat, iconactive, iconimage, iconalign)
	{
		var elem = document.getElementById(id);
		var bg_Align;
		var icon_Align;
		var bg_Repeat;
		switch (bgalign) { case 0: bg_Align = "left"; break; case 1: bg_Align = "center"; break; case 2: bg_Align = "right"; break; };
		switch (iconalign) { case 0: icon_Align = "left, "; break; case 1: icon_Align = "right, "; };
		switch (bgrepeat) { case 0: bg_Repeat = "no-repeat"; break; case 1: bg_Repeat = "repeat-x"; break; case 2: bg_Repeat = "repeat-y"; break; case 3: bg_Repeat = "repeat"; break;};
		
		if (elem) {
		
			if (iconactive === 0) 
			{
				elem.style.backgroundImage = "url('"+iconimage+"'), url('"+bgimage+"')";
				elem.style.backgroundPosition = icon_Align+bg_Align;
				elem.style.backgroundRepeat = "no-repeat, "+bg_Repeat;
			} else {
				elem.style.backgroundImage = "url('"+bgimage+"')";
				elem.style.backgroundPosition = bg_Align;
				elem.style.backgroundRepeat = bg_Repeat;
			};
		};
	};
	
	
	//ACTION modify_text
	acts.modify_text = function (id, texte)
	{
		var elem = document.getElementById("text_"+id);
		
		if (elem) {
		elem.innerHTML = texte;
		};	
	};	
	
	//ACTION append_Text
	acts.append_Text = function (id, texte)
	{
		var elem = document.getElementById("text_"+id);
		var i = elem.innerHTML;
		
		if (elem) {
		elem.innerHTML = i+texte;
		};	
	};	

	//ACTION append_specialText
	acts.append_specialText = function (id, texte)
	{
		var elem = document.getElementById(id);
		var i = elem.innerHTML;
		
		if (elem) {
		elem.innerHTML = i+texte;
		};	
	};	

	
	//ACTION modify_inputText
	acts.modify_inputText = function (id, texte)
	{
		var elem = document.getElementById(id+"_input");
		
		if (elem) {
		elem.value = texte;
		};	
	};	

	//ACTION modify_setReadOnly
	acts.modify_setReadOnly = function (id, i)
	{
		var elem = document.getElementById(id+"_input");
		
		if (elem && i === 0) 
		{ elem["readOnly"] = true; } else { elem["readOnly"] = false; };	
	};		
	
	//NULL ACTION Comment 
	acts.null_action = function ()
	{
	};
	//NULL BLANK Comment 
	acts.null_blank = function ()
	{
	};
	
	//////////////////////////////////////
	//Conditions/////////////////////////
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	//CONDITION isClicked
	cnds.isClicked = function (id) 
	{
		//alert(this.triggerID); //debug mode
		return id == this.triggerID;
	};
	
	//CONDITION isAnyClicked
	cnds.isAnyClicked = function () 
	{
		//alert(this.triggerID); //debug mode
		return true;
	};
	
	//CONDITION onScrollMove		
	cnds.onScrollMove = function ()
	{
		return true;
	};
	
	//CONDITION onScrollEnd	
	cnds.onScrollEnd = function ()
	{
		return true;
	};
	
	//CONDITION onTextChanged
	cnds.onTextChanged = function (id) 
	{
		//alert("condition debug: "+this.triggerID); //debug mode
		return id+"_input" == this.triggerID;
	};

	//CONDITION toggleStatus
	cnds.toggleStatus = function (id, status) 
	{
		//alert(this.triggerID); //debug mode
		return id == this.triggerID && this.triggerToggle == status;
	};

	//CONDITION isSwipingLeft
	cnds.isSwipingLeft = function (id) 
	{
		//alert(this.triggerID); //debug mode
		return id == this.triggerSwipe;
	};	
	//CONDITION isSwipingRight
	cnds.isSwipingRight = function (id) 
	{
		//alert(this.triggerID); //debug mode
		return id == this.triggerSwipe;
	};	
	
	//////////////////////////////////////
	//Expressions/////////////////////////
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	//EXPRESSION inputText	
	exps.inputText = function (ret, id)
	{
		var elem = document.getElementById(id+"_input");		
		ret.set_any(elem.value);
	};
	
	//EXPRESSION actualElementId	
	exps.actualElementId = function (ret)
	{
		if (this.triggerID != null) { ret.set_any(this.triggerID); };
	};
	
	//EXPRESSION scrollingPosition	
	exps.scrollingPosition = function (ret)
	{
		ret.set_int(-(this.myScroll.y));
	};

	//EXPRESSION countTtElement	
	exps.countTtElement = function (ret)
	{
		var id = "#ul_id_"+this.uid;
		var count_elem = jQuery(id).children().size();
		ret.set_int(count_elem);
	};	
	
	//EXPRESSION getText	
	exps.getText = function (ret, id)
	{
		var elem = document.getElementById("text_"+id);		
		ret.set_any(elem.innerHTML);
	};
	


	
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}());