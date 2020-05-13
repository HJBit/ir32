module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Store Canvas Info",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Image Editing",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const find = ["Action", "Load Image", "Load Font"];
	return `${find[parseInt(data.find)]}`;
},

//https://github.com/LeonZ2019/
author: "LeonZ",
version: "1.1.0",

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	return ([data.varName, 'Number']);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["find", "action", "path", "size", "text", "storage", "varName", "storage2", "varName2"],

//---------------------------------------------------------------------
// Command HTML
//
// This function returns a string containing the HTML used for
// editting actions. 
//
// The "isEvent" parameter will be true if this action is being used
// for an event. Due to their nature, events lack certain information, 
// so edit the HTML to reflect this.
//
// The "data" parameter stores constants for select elements to use. 
// Each is an array: index 0 for commands, index 1 for events.
// The names are: sendTargets, members, roles, channels, 
//                messages, servers, variables
//---------------------------------------------------------------------

html: function(isEvent, data) {
	return `
<div>
	<div style="float: left; width: 47%;">
		Find By:<br>
		<select id="find" class="round" onchange="glob.onChange0(this)">
			<option value=0 selected>Action</option>
			<option value=1>Load Image</option>
			<option value=2>Load Text</option>
		</select>
	</div>
</div><br><br><br>
<div id="input0">
	<div style="float: left; width: 104%;">
		<div id="input0text">Select Canvas by Action:</div>
		<input id="action" class="round" type="text"><br>
	</div><br>
</div>
<div id="input1a">
	<div style="float: left; width: 47%;">
		Font Path:<br>
		<input id="path" class="round" type="text" value="fonts/"><br>
	</div>
	<div style="float: right; width: 47%;">
		Font Size:<br>
		<input id="size" class="round" type="text"><br>
	</div><br>
</div>
<div id="input1b">
	<div style="float: left; width: 104%;">
		Text:<br>
		<input id="text" class="round" type="text"><br>
	</div><br>
</div>
<div>
	<div style="float: left; width: 35%;">
		Width Store In:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select><br>
	</div>
	<div style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text"><br>
	</div>
</div><br><br><br>
<div>
	<div style="float: left; width: 35%;">
		Height Store In:<br>
		<select id="storage2" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName2" class="round" type="text"><br>
	</div>
</div>`
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
	const {glob, document} = this;

	const input1a = document.getElementById('input1a');
	const input1b = document.getElementById('input1b');
	const input0 = document.getElementById('input0');
	const input0text = document.getElementById('input0text');
	
	glob.onChange0 = function(find) {
		switch(parseInt(find.value)) {
			case 0:
				input0.style.display = null;
				input0text.innerHTML = "Select Canvas Action:";
				input1a.style.display = "none";
				input1b.style.display = "none";
				break;
			case 1:
				input0.style.display = null;
				input0text.innerHTML = "Local/Web URL:";
				input1a.style.display = "none";
				input1b.style.display = "none";
				break;
			case 2:
				input0.style.display = "none";
				input1a.style.display = null;
				input1b.style.display = null;
				break;
		}
	}
	
	glob.onChange0(document.getElementById('find'));
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const Canvas = require('canvas');
	const opentype = require('opentype.js');
	const find = parseInt(data.find);
	let width, height, image;
	if (find == 0) {
		let Action = parseInt(this.evalMessage(data.action, cache));
		if (isNaN(Action) || Action > cache.actions.length || Action < 1) {
			console.error("Something wrong about input box.");
			this.callNextAction(cache);
			return;
		} else {
			Action--;
		};
		let action = cache.actions[Action];
		switch (action.name) {
			case "Canvas Create Image":
				image = Canvas.loadImage(action.url);
				width = image.width;
				height = image.height;
				break;
			case "Canvas Draw Text on Image":
				const font = opentype.loadSync(action.fontPath).getPath(action.text, 0, 0, action.fontSize).getBoundingBox();
				width = font.x2 - font.x1;
				height = font.y2 - font.y1;
				break;
			case "Canvas Generate Progress Bar":
				switch(parseInt(action.type)) {
					case 0:
						if (action.lineWidth * 2 > action.height) {
							height = action.height;
						} else {
							height = action.lineWidth * 2
						}
						width = action.width / 100 * Number(action.percent);
						break;
					case 1:
						if (action.height > action.width * 2 + action.lineWidth) {
							width = action.width * 2 + action.lineWidth;
						} else {
							width = action.height;
						}
						height = width;
						break;
				}
				break;
			case "Canvas Create Background":
				width = parseFloat(action.width);
				height = parseFloat(action.height);
				break;
			case "Canvas Crop Image":
				if (cache.index < Action) {
					image = new Canvas.Image();
					image.src = this.getVariable(parseInt(action.storage), action.varName, cache);
					if (action.width.endsWith('%')) {
						width = image.width * parseFloat(action.width) / 100;
					} else {
						width = image.width;
					}
					if (action.height.endsWith('%')) {
						height = image.height * parseFloat(action.height) / 100;
					} else {
						height = image.height;
					}
				} else {
					width = image.width;
					height = image.height;
				}
				break;
			case "Canvas Image Options":
				image = new Canvas.Image();
				image.src = this.getVariable(parseInt(action.storage), action.varName, cache);
				if (cache.index < Action) {
					let radian = Math.PI / 180 * parseFloat(action.rotation);
					let imagex = image.width * Math.abs(Math.cos(radian)) + image.height * Math.abs(Math.sin(radian));
					let imagey = image.height * Math.abs(Math.cos(radian)) + image.width * Math.abs(Math.sin(radian));
					if (action.width.endsWith('%')) {
						width = parseInt(imagex) * parseFloat(action.width) / 100;
					} else {
						width = parseInt(imagex);
					}
					if (action.height.endsWith('%')) {
						height = parseInt(imagey) * parseFloat(action.height) / 100;
					} else {
						height = parseInt(imagey);
					}
				} else {
					width = image.width;
					height = image.height;
				}
				break;
		}
	} else if (find == 1) {
		image = Canvas.loadImage(this.evalMessage(data.action, cache));
		width = image.width;
		height = image.height;
	} else if (find == 2) {
		const path = this.evalMessage(data.path, cache);
		const size = parseInt(this.evalMessage(data.size, cache));
		const text = this.evalMessage(data.text, cache);
		const font = opentype.loadSync(path).getPath(text, 0, 0, size).getBoundingBox();
		width = font.x2 - font.x1;
		height = font.y2 - font.y1;
	}
	if (height && width) {
		const varName = this.evalMessage(data.varName, cache);
		const storage = parseInt(data.storage);
		const varName2 = this.evalMessage(data.varName2, cache);
		const storage2 = parseInt(data.storage2);
		if (storage) {
			this.storeValue(width, storage, varName, cache);
		}
		if (storage2) {
			this.storeValue(height, storage2, varName2, cache);
		}
	}
	this.callNextAction(cache);
},

//---------------------------------------------------------------------
// Action Bot Mod
//
// Upon initialization of the bot, this code is run. Using the bot's
// DBM namespace, one can add/modify existing functions if necessary.
// In order to reduce conflictions between mods, be sure to alias
// functions you wish to overwrite.
//---------------------------------------------------------------------

mod: function(DBM) {
}

}; // End of module