// JavaScript Document
// localStorage.clear();  //decomment for debugging purposes
var WikiGame = function()
{
	var settings = {spam_interval:0, default_page:'wiki-schools/', css_files:["PAT_wikigame/wikigame.css"], websocket_url:"ws://127.0.0.1:8888/wikigame"};

	var wikigame = this;
	var wikiframe;
	var server_connector;
	var message_handler;
	var notification_controller;
    var dialog_controller;
    var hint_controller;
	var event_controller;
	var css_controller;
	var game_controller;
    var tutorial_controller;
    var analyzer;
    var user;
	var buttstrap;
    var helper;
	var client_id;
    var debug;

    //WARNING: THIS IS DONE VIA BROWSER SNIFFING WHICH IS BAD!!!!
    var IE_FALLBACK_MODE = false;

    var Debug = function()
    {
        this.debug_reset = function()
        {
            server_connector.send_message('DEBUG_RESET', null, false);
            game_controller.reset();
        };



        var reset_frame = helper.create_object('div', ['debug_frame', 'close']);

        var reset_text = helper.create_object('div', ['abort_text']);

        reset_text.appendChild(document.createTextNode("DEBUG RESET"));
        reset_text.addEventListener('click', function(){debug.debug_reset();}, false);
        reset_frame.appendChild(reset_text);

        document.body.appendChild(reset_frame);

        debug = this;
    };

    var Helper = function()
    {
        this.create_object = function(_type, _classes, _dataset)
        {
            var new_object = document.createElement(_type);
            if(typeof _classes != "undefined")
            {
                for(var i = 0; i < _classes.length; ++i)
                {
                    new_object.classList.add(_classes[i]);
                }
            }

            if(typeof _dataset != "undefined")
            {
                for(var property in _dataset)
                {
                    new_object.dataset[property] = _dataset[property];
                }
            }

            return new_object;
        };

        this.clear_content = function(_object)
        {
            while(_object.hasChildNodes())
            {
                _object.removeChild(_object.firstChild);
            }
        };
        helper = this;
    };

	var Game_Controller = function()
	{
        var game_info = {game_id: "", game_name: "", start_page: "", goal_page: "", distance: 0};
		var game_status = {game_id:0,current_page:""};
		var status = {active:true,running:false,paused:false,menu:true};
		var timers = {start_time:0,paused_time:0,pause_start_time:0};
		var mouse = {position:{x:0,y:0},buttons_pressed:{left:false,middle:false,right:false}};
        var viewport = {size:{x:0,y:0}, scroll:{x:0,y:0}, scrollsize:{x:0, y:0}};
        var keys = [];
        var abort_button = null;

        var block_broadcast = false;

        this.attach_abort = function()
        {
            if(abort_button != null)
            {
                document.body.removeChild(abort_button);
            }
            var abort_frame = helper.create_object('div', ['abort_frame', 'close']);

            var abort_text = helper.create_object('div', ['abort_text']);
            abort_text.appendChild(document.createTextNode("Abort Task"));
            abort_text.addEventListener('click', function(){game_controller.abort_game(false);}, false);
            abort_frame.appendChild(abort_text);

            document.body.appendChild(abort_frame);

            abort_button = abort_frame;
        };

        this.block = function(_state)
        {
            block_broadcast = _state;
        };

        this.get_block_state = function()
        {
            return block_broadcast;
        };

        this.reset = function()
        {
            dialog_controller.text_dialog("Resetting", 'The system will now reset!', function(){localStorage.clear(); location.reload(true);})

        };

        this.reset_menu = function()
        {
            css_controller.hide_menu(!status.menu);
        };

        this.set_menu = function(_state)
        {
            status.menu = _state;
            css_controller.hide_menu(!_state)
        };

        this.load_page = function(_url)
        {
            wikiframe.contentWindow.location.href = _url;
        };

        this.set_game = function(_game_data)
        {
            game_controller.block(true);
            game_info.game_id = _game_data.game_name;
            game_status.game_id = _game_data.game_name;
            game_info.game_name = _game_data.game_name;
            game_info.start_page = _game_data.start_page;
            game_info.goal_page = _game_data.goal_page;
            game_info.distance = _game_data.distance;


            status.running = true;
            timers.start_time = new Date().getTime();

            wikiframe.contentWindow.location.href = game_info.start_page.url;

            // BUTTSTRAP STUFF
            var buttstrap_content = helper.create_object('div');
            var start_link = helper.create_object('a');
            start_link.href = _game_data.start_page.url;
            start_link.target = '_blank';
            start_link.appendChild(document.createTextNode(_game_data.start_page.name));
            var goal_link = helper.create_object('a');
            goal_link.href = _game_data.goal_page.url;
            goal_link.target = '_blank';
            goal_link.appendChild(document.createTextNode(_game_data.goal_page.name));

            var buttstrap_arrow_container = helper.create_object('div', ['buttstrap_arrow_container']);
            var buttstrap_arrow_start = helper.create_object('div', ['buttstrap_arrow', 'buttstrap_arrow_post']);
            buttstrap_arrow_start.appendChild(start_link);
            buttstrap_arrow_start.style.backgroundColor = 'rgba(200, 0, 0, 1)';
            buttstrap_arrow_start.style.zIndex = game_info.distance;
            buttstrap_arrow_start.id = "buttstrap_distance_" + game_info.distance;
            buttstrap_arrow_container.appendChild(buttstrap_arrow_start);

            for(var i = 1; i < game_info.distance; ++i)
            {
                var buttstrap_arrow_mid = helper.create_object('div', ['buttstrap_arrow', 'buttstrap_arrow_post']);
                var color_split = game_info.distance / 2;
                var red_part = Math.round((2 * Math.min(game_info.distance  - i, color_split) / game_info.distance)  * 200);
                var blue_part = Math.round((2 * Math.min(i, color_split) / game_info.distance)  * 200);
                buttstrap_arrow_mid.style.backgroundColor = 'rgba(' + red_part + ', ' + blue_part + ', 0, 1)';
                buttstrap_arrow_mid.style.zIndex = game_info.distance - i;
                buttstrap_arrow_mid.id = "buttstrap_distance_" + (game_info.distance - i);
                buttstrap_arrow_container.appendChild(buttstrap_arrow_mid);
            }

            var buttstrap_arrow_goal = helper.create_object('div', ['buttstrap_arrow']);
            buttstrap_arrow_goal.appendChild(goal_link);
            buttstrap_arrow_goal.style.backgroundColor = 'rgba(0, 200, 0, 1)';
            buttstrap_arrow_goal.style.textAlign = 'right';
            buttstrap_arrow_goal.style.zIndex = 0;
            buttstrap_arrow_goal.id = "buttstrap_distance_0";
            buttstrap_arrow_container.appendChild(buttstrap_arrow_goal);
            buttstrap.set_content({action: "set", content: buttstrap_arrow_container});


            buttstrap.open();
            game_controller.attach_abort();
        };

		this.set_current_page = function(_url)
		{
			game_status.current_page = _url;
		};

		this.set_title = function(_title)
		{
			document.title = _title;
		};

		this.set_mouse = function(_x,_y)
		{
			mouse.position.x = _x - wikiframe.offsetLeft;
			mouse.position.y = _y - wikiframe.offsetTop;
		};

		this.set_mouse_button = function(_button,_pressed)
		{
			switch(_button)
			{
				case 0:
				{
					mouse.buttons_pressed.left = _pressed;
					break;
				}
				case 1:
				{
					mouse.buttons_pressed.middle = _pressed;
					break;
				}
				case 2:
				{
					mouse.buttons_pressed.right = _pressed;
					break;
				}
			}
//			console.log(JSON.stringify(mouse.buttons_pressed));
		};

        this.set_key = function(_key, _pressed)
        {
            if (_pressed)
            {
                if (keys.indexOf(_key) != -1)
                {
                    return;
                }

                keys.push(_key);
            }
            else
            {
                var key_index = keys.indexOf(_key);
                if (key_index == -1)
                {
                    return;
                }

                keys.splice(key_index,1);
            }
        };

		this.get_status = function()
		{
			return status;
		};

        this.get_mouse = function()
        {
            return mouse;
        };

		this.start = function()
		{
            server_connector.send_message('start', null,false);
		};

		this.pause = function()
		{
			status.paused = true;
			timers.pause_start_time = new Date().getTime();
		};

		this.unpause = function()
		{
			status.paused = false;
			timers.paused_time = new Date().getTime() - timers.pause_start_time;
		};

		this.extract_features = function()
		{
			var features = {};
			features.timestamp = new Date().getTime() - timers.start_time - timers.paused_time;
			features.game_status = game_status;
			features.mouse = mouse;
            features.viewport = viewport;
            features.keys = keys;

			return features;
		};

        this.update_viewport = function()
        {
            viewport.size.x = wikiframe.offsetWidth;
            viewport.size.y = wikiframe.offsetHeight;
            viewport.scroll.x = wikiframe.contentWindow.document.documentElement.scrollLeft;
            viewport.scroll.y = wikiframe.contentWindow.document.documentElement.scrollTop;
            viewport.scrollsize.x = wikiframe.contentWindow.document.documentElement.scrollWidth;
            viewport.scrollsize.y = wikiframe.contentWindow.document.documentElement.scrollHeight;
        };

        this.abort_game = function(_silent)
        {
            if(!_silent)
            {
                var confirmed = dialog_controller.confirm_dialog("Are you sure?", "Do you really want to abort the mission?", function(_response){if(_response){server_connector.send_message("abort", null, true);}});
                return;
            }
            server_connector.send_message("abort", null, true);
        };

		game_controller = this;
	};

    var Analyzer = function()
    {
        this.get_object_offset = function(_object)
        {
            function clean_list(_array)
            {
                var objects_to_strip = [".", ""];

                for(var i = 0; i < objects_to_strip.length; ++i)
                {
                    while(true)
                    {
                        var array_index = _array.indexOf(objects_to_strip[i]);

                        if(array_index == -1)
                        {
                            break;
                        }

                        _array.splice(array_index,1);
                    }
                }

                return _array;
            }
            var start_object = wikiframe.contentWindow.document.getElementById("mw-content-text").getElementsByTagName('p')[0];
            var thumb = false;
            //----------- CASE thumbnail
            if(_object.parentNode.classList.contains('thumbcaption'))
            {
                start_object = _object.parentNode;
                thumb = true;
            }

            var target_clone = helper.create_object('div');
            var target_range = document.createRange();
            target_range.setStart(start_object, 0);
            target_range.setEndBefore(_object);

            target_clone.appendChild(target_range.cloneContents());
            target_html = target_clone.innerHTML;
            target_html_cleaned = target_html.trim().replace(/(<([^>]+)>)/ig, " ");
            var count_split = target_html_cleaned.split(/\s+/gi);
            count_split = clean_list(count_split);

            var link_nr = 0;
            var links = wikiframe.contentWindow.document.getElementsByTagName('a');
            for(var i = 0; i < links.length; ++i)
            {
                if(links[i] === _object)
                {
                    link_nr = i;
                    break;
                }
            }


            return {thumb: thumb, offset: count_split.length, link_nr:link_nr};
        };

        analyzer = this;
    };

    var User = function()
    {
        var send_feature = function(_name, _value)
        {
            localStorage.setItem("wikigame_user_attribute_" + _name,_value);
            server_connector.send_message('user_feature',{name:_name,value:_value},false);
        };

        this.request_feature = function(_data_array)
        {
            var text = _data_array[0];
            var name = _data_array[1];
            var type = _data_array[2];
            var payload = _data_array[3];

            if (localStorage.getItem("wikigame_user_attribute_" + name) !== null)
            {
                send_feature(name, localStorage.getItem("wikigame_user_attribute_" + name));
            }
            else
            {

                dialog_controller.dialog(text, type, payload, function(_response){send_feature(name,_response);});
            }
        };
        user = this;
    };

	var CSS_Controller = function()
	{
		this.hide_menu = function(_hidden)
		{
			var state_string = "block";
			if(_hidden)

			{
                //notification_controller.notify("hint","Hiding menu!");
				state_string = "none";
            }
            else
            {
                //notification_controller.notify("hint","Showing menu!")
            }

            var menu_items = wikiframe.contentWindow.document.getElementsByClassName('menu');
            for(var i = 0; i < menu_items.length; ++i)
            {
                menu_items[i].style.display = state_string;
            }
            try
            {
                wikiframe.contentWindow.document.getElementById('siteSub').style.display = state_string;
            }
            catch(_e)
            {
                //nothing to change
            }


/*
			var css_rule = find_rule("wikiframe","div.menu");
			if(css_rule != false)
			{
				css_rule.style.display = state_string;
			}
*/
		};

		var find_rule = function(_window, _rule_name)
		{
			var target_document = "";
			if(_window == "main")
			{
				target_document = document;
			}
			else if(_window == "wikiframe")
			{
				target_document = wikiframe.contentWindow.document;
			}
			else
			{
				return false;
			}

			console.log("trying to find: " + _rule_name);
			var css_rule_name = _rule_name.toLowerCase();
			for(var i = 0; i < target_document.styleSheets.length;++i)
			{
				var current_stylesheet = target_document.styleSheets[i];
				for(var j = 0; j < current_stylesheet.cssRules.length;++j)
				{
					var current_rule = current_stylesheet.cssRules[j];
					try
					{
						if(current_rule.selectorText.toLowerCase() == css_rule_name)
						{
							return current_rule;
						}
					}
					catch(e)
					{
						console.log("not a css-rule");
					}

				}
			}
			return false;
		};


        this.lock_frame = function()
        {
            wikiframe.classList.add('locked')
        };

        this.unlock_frame = function()
        {
            wikiframe.classList.remove('locked')
        };


//		handle_menu = find_rule("wikiframe","div.menu");
		css_controller = this;
	};

	var Event_Controller = function()
	{
		var setup = function()
		{

			wikiframe.addEventListener('load', wikigame, false);
			window.addEventListener("resize", wikigame, false);

            if(IE_FALLBACK_MODE)
            {
                console.log("Setting up events for IE....");
                wikiframe.onload = wikigame.handleEvent;
                wikiframe.onresize = wikigame.handleEvent;
                console.log("DONE!");
            }
		};

		this.attach_events = function()
		{
            var content_window = (wikiframe.contentWindow || wikiframe.contentDocument);
            var content_document = content_window;
            if(content_window.document)
            {
                content_document = content_document.document;
            }

            content_document.addEventListener('click', wikigame, false);
            content_document.addEventListener('mousemove', wikigame, false);
            content_document.addEventListener('mousedown', wikigame, false);
            content_document.addEventListener('mouseup', wikigame, false);
            content_document.addEventListener('mousemove', wikigame, false);
            content_document.addEventListener('dblclick', wikigame, false);
            content_document.addEventListener("scroll", wikigame, false);
            content_document.addEventListener("keypress", wikigame, false);
            content_document.addEventListener("keyup", wikigame, false);
            content_document.addEventListener("keydown", wikigame, false);

            content_window.addEventListener("beforeunload", wikigame, false);



            if(IE_FALLBACK_MODE)
            {
                console.log("Attaching events for IE....");

                content_document.onclick = wikigame.handleEvent;
                content_document.onmousemove = wikigame.handleEvent;
                content_document.onmousedown = wikigame.handleEvent;
                content_document.onmouseup = wikigame.handleEvent;
                content_document.ondblclick = wikigame.handleEvent;
                content_document.onscroll = wikigame.handleEvent;
                content_document.onkeypress = wikigame.handleEvent;
                content_document.onkeyup = wikigame.handleEvent;
                content_document.onkeydown = wikigame.handleEvent;
                content_document.onbeforeunload = wikigame.handleEvent;

                console.log("DONE!");
            }
		};

		setup();
		event_controller = this;
	};

    var Dialog_Controller = function()
    {
        var dialog_background = helper.create_object('div', ['dialog_background']);
        document.body.appendChild(dialog_background);

        var background_show = function(_state)
        {
            if(_state)
            {
                dialog_background.classList.add('dialog_background_visible');
            }
            else
            {
                dialog_background.classList.remove('dialog_background_visible');
            }
        };

        var dialog_input_string = function()
        {
            var input_frame = helper.create_object('div', ['dialog_content']);
            var input_field = helper.create_object('input', ['dialog_input']);
            input_field.type = "text";
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_int = function()
        {
            var input_frame = helper.create_object('div', ['dialog_content']);
            var input_field = helper.create_object('input', ['dialog_input']);
            input_field.type = "number";
            input_field.value = 0;
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_bool = function()
        {
            var input_frame = helper.create_object('div', ['dialog_content']);
            var input_field = helper.create_object('select', ['dialog_input']);

            var option_true = helper.create_object('option');
            option_true.appendChild(document.createTextNode('Yes'));
            option_true.value = 1;
            input_field.appendChild(option_true);

            var option_false = helper.create_object('option');
            option_false.appendChild(document.createTextNode('No'));
            option_false.value = 0;
            input_field.appendChild(option_false);

            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_range = function(_from, _to)
        {
            var input_frame = helper.create_object('div', ['dialog_content']);
            var input_tooltip = helper.create_object('div', ['dialog_tooltip', 'dialog_tooltip_range']);
            input_tooltip.appendChild(document.createTextNode("👎"));
            input_tooltip.appendChild(helper.create_object('br'));
            input_tooltip.appendChild(document.createTextNode("(bad)"));

            var input_tooltip_right = helper.create_object('div', ['dialog_tooltip_range_hover_right']);
            input_tooltip_right.appendChild(document.createTextNode("👍"));
            input_tooltip_right.appendChild(helper.create_object('br'));
            input_tooltip_right.appendChild(document.createTextNode("(good)"));
            input_tooltip.appendChild(input_tooltip_right);
            input_frame.appendChild(input_tooltip);
            var input_field = helper.create_object('input', ['dialog_input']);
            input_field.type = "range";
            input_field.min = _from;
            input_field.max = _to;
            input_field.value = (_from + _to) / 2;
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var typecheck = function(_type, _value)
        {
            if(_value == "")
            {
                notification_controller.notify("error", "Please enter the required data");
                return false;
            }

            switch(_type)
            {
                case "int":
                {
                    if(isNaN(_value))
                    {
                        notification_controller.notify("error", "Entered data is of invalid type");
                        return false;
                    }
                    break;
                }
                case "range":
                {
                    if(isNaN(_value))
                    {
                        notification_controller.notify("error", "Entered data is of invalid type");
                        return false;
                    }
                    break;
                }
                case "bool":
                {
                    if(isNaN(_value))
                    {
                        notification_controller.notify("error", "Entered data is of invalid type");
                        return false;
                    }
                    break;
                }
            }

            return true;
        };

        this.dialog = function(_text, _type, _payload, _callback)
        {
            background_show(true);
            var dialog_frame = helper.create_object('div', ['dialog_frame']);
            document.body.appendChild(dialog_frame);

            var dialog_label = helper.create_object('div', ['dialog_label']);
            dialog_label.appendChild(document.createTextNode(_text));
            dialog_frame.appendChild(dialog_label);

            var input;
            switch(_type)
            {
                case 'string':
                {
                    input = dialog_input_string();
                    break;
                }
                case 'int':
                {
                    input = dialog_input_int();
                    break;
                }
                case 'bool':
                {
                    input = dialog_input_bool();
                    break;
                }
                case 'range':
                {
                    input = dialog_input_range(_payload[0],_payload[1]);
                    break;
                }
                default:
                {
                    input = dialog_input_string();
                    break;
                }
            }

            dialog_frame.appendChild(input.frame);

            var dialog_buttons = helper.create_object('div', ['dialog_buttons']);

            var dialog_button_ok = helper.create_object('button', ['dialog_button', 'confirm']);
            dialog_button_ok.appendChild(document.createTextNode('ok'));
            dialog_button_ok.addEventListener('click',function(){if(typecheck(_type, input.field.value)){_callback(input.field.value); background_show(false); document.body.removeChild(dialog_frame);}},false);
            dialog_buttons.appendChild(dialog_button_ok);
/*
            var dialog_button_cancel = helper.create_object('button', ['dialog_button', 'close']);
            dialog_button_cancel.appendChild(document.createTextNode('cancel'));
            dialog_button_cancel.addEventListener('click',function(){background_show(false); document.body.removeChild(dialog_frame)},false);
            dialog_buttons.appendChild(dialog_button_cancel);
*/
            dialog_frame.appendChild(dialog_buttons);
        };

        this.text_dialog = function(_title, _text, _callback)
        {
            background_show(true);
            var dialog_frame = helper.create_object('div', ['dialog_frame']);
            document.body.appendChild(dialog_frame);

            var dialog_label = helper.create_object('div', ['dialog_label']);
            dialog_label.appendChild(document.createTextNode(_title));
            dialog_frame.appendChild(dialog_label);

            var input_frame = helper.create_object('div', ['dialog_content']);

            var text_content = helper.create_object('div', ['dialog_text']);
            text_content.innerHTML = _text;
            input_frame.appendChild(text_content);
            dialog_frame.appendChild(input_frame);
            var dialog_buttons = helper.create_object('div', ['dialog_buttons']);

            var dialog_button_ok = helper.create_object('button', ['dialog_button', 'confirm']);
            dialog_button_ok.appendChild(document.createTextNode('ok'));
            dialog_button_ok.addEventListener('click',function(){if(_callback){_callback()} background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_ok);


            dialog_frame.appendChild(dialog_buttons);
        };

        this.confirm_dialog = function(_title, _text, _callback)
        {
            background_show(true);
            var dialog_frame = helper.create_object('div', ['dialog_frame']);
            document.body.appendChild(dialog_frame);

            var dialog_label = helper.create_object('div', ['dialog_label']);
            dialog_label.appendChild(document.createTextNode(_title));
            dialog_frame.appendChild(dialog_label);

            var input_frame = helper.create_object('div', ['dialog_content']);

            var text_content = helper.create_object('div', ['dialog_text']);
            text_content.innerHTML = _text;
            input_frame.appendChild(text_content);
            dialog_frame.appendChild(input_frame);

            var dialog_buttons = helper.create_object('div', ['dialog_buttons']);

            var dialog_button_yes = helper.create_object('button', ['dialog_button', 'confirm']);
            dialog_button_yes.appendChild(document.createTextNode('yes'));
            dialog_button_yes.addEventListener('click',function(){_callback(true); background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_yes);

            var dialog_button_no = helper.create_object('button', ['dialog_button', 'close']);
            dialog_button_no.appendChild(document.createTextNode('no'));
            dialog_button_no.addEventListener('click',function(){_callback(false); background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_no);

            dialog_frame.appendChild(dialog_buttons);

        };

        dialog_controller = this;
    };

    var Hint_Controller = function()
    {
        var hints_frame = helper.create_object('div', ['hints_frame']);
        document.body.appendChild(hints_frame);

        this.display_hint = function(_type, _text, _link)
        {
            var hint_frame = helper.create_object('div', ['hint_frame', _type]);

            var hint_text = helper.create_object('div', ['hint_text']);
            hint_text.appendChild(document.createTextNode(_text));
            hint_text.addEventListener('click', function(){hint_follow(_link, hint_frame);}, false);

            var hint_close = helper.create_object('div', ['hint_close', 'close']);
            hint_close.appendChild(document.createTextNode('×'));
            hint_close.addEventListener('click', function(){hint_remove(hint_frame);}, false);

            hint_frame.appendChild(hint_text);
            hint_frame.appendChild(hint_close);

            hints_frame.appendChild(hint_frame);
        };

        var hint_remove = function(_hint_frame)
        {
            server_connector.send_message("hint_remove",'');
            hints_frame.removeChild(_hint_frame);
        };

        var hint_follow = function(_link, _hint_frame)
        {
            game_controller.load_page(_link);
            server_connector.send_message("hint_follow",_link);
            hints_frame.removeChild(_hint_frame);
        };

        this.clear_hints = function()
        {
            while(hints_frame.hasChildNodes())
            {
                hints_frame.removeChild(hints_frame.firstChild);
            }
        };

        hint_controller = this;
    };

    var Tutorial_Controller = function()
    {
        var tutorial_frames = [];

        var get_frame_index = function(_name)
        {
            for(var i = 0; i<tutorial_frames.length; ++i)
            {
                if(tutorial_frames[i].name == _name)
                {
                    return i;
                }
            }
            return -1;
        };

        this.show_tutorial_frame = function(_tutorial_package)
        {
            if(_tutorial_package == "CLEAR_ALL")
            {
                tutorial_controller.clear_tutorial();
                return;
            }
            var name = _tutorial_package.name;
            var frame_type = _tutorial_package.type;
            var position = _tutorial_package.position;
            var arrow_position = _tutorial_package.arrow_position;
            var title = _tutorial_package.title;
            var text = _tutorial_package.text;

            if(get_frame_index(name) != -1)
            {
                return;
            }
            var tutorial_frame = helper.create_object('div', ['tutorial_frame', frame_type, "tutorial_frame_arrow"]);
            var tutorial_title = helper.create_object('div', ['tutorial_title']);
            tutorial_title.innerHTML = title;
            tutorial_frame.appendChild(tutorial_title);
            var tutorial_text = helper.create_object('div', ['tutorial_text']);
            tutorial_text.innerHTML = text;
            tutorial_frame.appendChild(tutorial_text);

            switch(position.x.alignment)
            {
                case "left":
                {
                    tutorial_frame.style.left = position.x.offset;
                    break;
                }
                case "center":
                {
                    tutorial_frame.style.left = "50%";
                    tutorial_frame.style.transform = "translateX(-50%)";
                    break;
                }
                case "right":
                {
                    tutorial_frame.style.right = position.x.offset;
                    break;
                }
            }

            switch(position.y.alignment)
            {
                case "top":
                {
                    tutorial_frame.style.top = position.y.offset;
                    break;
                }
                case "center":
                {
                    tutorial_frame.style.top = "50%";
                    if(position.x.alignment == "center")
                    {
                        tutorial_frame.style.transform = "translate(-50%, -50%)";
                    }
                    else
                    {
                        tutorial_frame.style.transform = "translateY(-50%)";
                    }
                    break;
                }
                case "bottom":
                {
                    tutorial_frame.style.bottom = position.y.offset;
                    break;
                }
            }

            tutorial_frame.classList.add("tutorial_arrow_position_" + arrow_position);

            var tutorial_closer = helper.create_object('div', ['tutorial_closer', 'close']);
            tutorial_closer.appendChild(document.createTextNode("x"));
            tutorial_closer.addEventListener('click', function(){tutorial_controller.close_tutorial_frame(name)}, false);
            tutorial_frame.appendChild(tutorial_closer);

            var tutorial_buttons = helper.create_object('div', ['dialog_buttons']);

            var tutorial_ok = helper.create_object('button', ['dialog_button', 'confirm']);
            tutorial_ok.addEventListener('click', function(){tutorial_controller.close_tutorial_frame(name)}, false);
            tutorial_ok.appendChild(document.createTextNode("OK"));

            tutorial_buttons.appendChild(tutorial_ok);
            tutorial_frame.appendChild(tutorial_buttons);

            document.body.appendChild(tutorial_frame);
            tutorial_frames.push({name: name, frame: tutorial_frame});
        };

        this.close_tutorial_frame = function(_name)
        {
            var frame_index = get_frame_index(_name);
            if(frame_index == -1)
            {
                return
            }

            document.body.removeChild(tutorial_frames[frame_index].frame);
            tutorial_frames.splice(frame_index, 1);

            server_connector.send_message("tutorial_close", _name);
        };

        this.clear_tutorial = function()
        {
            for(var i=0; i<tutorial_frames.length; ++i)
            {
                document.body.removeChild(tutorial_frames[i].frame);
            }
            tutorial_frames = [];
        };

        tutorial_controller = this;
    };

	var Notification_Controller = function()
	{
		var notification_frame;
		var notification_list = [];

		var notification = function(_type,_inner_html)
		{
			this.node = helper.create_object('div', ['notification', _type]);

			var inner_core = helper.create_object('div', ['notification_message_core']);
			inner_core.addEventListener('mouseover',function(){return function(evt){evt.target.parentNode.style.animationPlayState="paused"}}());
			inner_core.addEventListener('mouseout',function(){return function(evt){evt.target.parentNode.style.animationPlayState="running"}}());
			inner_core.innerHTML = _inner_html;
			this.node.appendChild(inner_core);

			return this;
		};

		//AVAIL TYPES:
		//	default
		//	emphasis
		//	error
		//	hint
		this.notify = function(_type,_message)
		{
			var new_notification = new notification(_type,_message);
			notification_frame.insertBefore(new_notification.node,notification_frame.firstChild);
            notification_list.push(new_notification);

            setTimeout(function(){notification_frame.removeChild(new_notification.node);},6000); };

		notification_frame = helper.create_object('div', ['notification_frame']);
		document.body.appendChild(notification_frame);

		notification_controller = this;
	};

	var Message_Handler = function()
	{
		this.handle_message = function(_message)
		{
			var message_package;
			try
			{
				message_package = JSON.parse(_message);
			}
			catch(exception)
			{
				notification_controller.notify("error","Could not read message!<br /><br /><b>Error:</b><br />" + exception);
				return;
			}

			switch(message_package.type)
			{
				case "handshake":
				{
					client_id = message_package.message;

					if (localStorage.getItem("wikigame_client_id") === null)
					{
						localStorage.setItem("wikigame_client_id",client_id);
					}
					else
					{
						client_id = localStorage.getItem("wikigame_client_id");
					}

					notification_controller.notify("default","Client ID: " + client_id);
					server_connector.send_message("handshake",client_id,false);
					break;
				}
                case "menu_state":
                {
                    game_controller.set_menu(message_package.message);
                    break;
                }
                case "feature_request":
                {
                    user.request_feature(message_package.message);
                    break;
                }
                case "session_request":
                {
                    var session_id = false;
                    if (localStorage.getItem("session_id") !== null)
                    {
                        console.log("Found Session!");
                        session_id = localStorage.getItem("session_id");
                    }
                    server_connector.send_message("session_response", session_id, false);
                    break;
                }
                case "session_update":
                {
                    console.log("SESSION UPDATE! -> "  + message_package.message);
                    localStorage.setItem("session_id", message_package.message);
                    break;
                }
                case "new_game":
                {
                    game_controller.set_game(message_package.message);
                    break;
                }
                case "game_complete":
                {
                    dialog_controller.text_dialog('Mission Completed', message_package.message, null);
                    break;
                }
                case "buttstrap":
                {
                    buttstrap.set_html_content(message_package.message);
                    break;
                }
                case "hint":
                {
//                    console.log("HINT PACKAGE: " + JSON.stringify((message_package.message)));
                    hint_controller.display_hint(message_package.message.type, message_package.message.text,message_package.message.url);
                    break;
                }
                case "reset":
                {
                    game_controller.reset();
                    break;
                }
                case "current_distance":
                {
                    buttstrap.highlight_distance(message_package.message);
                    break;
                }
                case "tutorial":
                {
                    tutorial_controller.show_tutorial_frame(message_package.message);
                    break;
                }
                case "dialog":
                {
                    dialog_controller.text_dialog(message_package.message.title, message_package.message.text, null);
                    break;
                }
                case "session_complete":
                {
                    game_controller.block(true);
                    dialog_controller.text_dialog('Session Completed', "Thank you for participating", function(){game_controller.reset()});
                    break;
                }

                default:
                {
                    notification_controller.notify("default", "MESSAGE" + JSON.stringify(message_package));
                    break;
                }
			}
		};
		message_handler = this;
	};

	var Server_Connector = function(_address)
	{
        var message_queue = [];
		var socket = null;
		var server_address = _address;

        var crashed = false;

		var construct_message = function(_type,_message,_attach_features)
		{
			var message = {};
			message.type = _type;
			message.timestamp = new Date().getTime();
			message.message = _message;
			if(_attach_features)
			{
				message.game_features = game_controller.extract_features();
			}
			return JSON.stringify(message);
		};

		var create_socket = function()
		{
			socket = new WebSocket(server_address);

			socket.addEventListener('message',function(){return function(_event){message_handler.handle_message(_event.data);}}());
			socket.addEventListener('open',function(){console.log("crashed_state: " + crashed); if(crashed){game_controller.start()} flush_queue(); notification_controller.notify("emphasis","Server connection established!");},false);
			socket.addEventListener('close',function(){crashed = true; socket = null; setTimeout(create_socket, 5000); notification_controller.notify("error","Server connection terminated!");},false);
		};

		this.send_message = function(_type,_message,_attach_features)
		{
            message_queue.push(construct_message(_type,_message,_attach_features));
            flush_queue();
		};

        var flush_queue = function()
        {
            if(socket == null)
            {
                console.log("Trying to flush with socket state: NULL");
                return;
            }

            console.log("Trying to flush with socket state: " + socket.readyState);
            if(socket.readyState != 1)
            {
                setTimeout(flush_queue, 3000);
            }
            else
            {
                while (message_queue.length != 0)
                {
                    socket.send(message_queue.shift());
                }
            }
        };
		create_socket();
		server_connector = this;
	};

	var attach_wikiframe = function(_parent,_start_page)
	{
		//clear parent
		while(_parent.hasChildNodes())
		{
			_parent.removeChild(_parent.firstChild);
		}

		//attach frame
		var frame = helper.create_object('iframe', ['wikiframe']);
		frame.src = _start_page;
		_parent.appendChild(frame);
		wikiframe = frame;
	};

	var attach_css = function(_path)
	{
		var wikigame_css = helper.create_object('link');
		wikigame_css.rel = "Stylesheet";
		wikigame_css.href = _path;
		document.head.appendChild(wikigame_css);
	};

	var Buttstrap = function()
	{
		var frame;
        var content;
		var label;
		var state = false;

        this.highlight_distance = function(_distance)
        {
            var arrows = document.getElementsByClassName('buttstrap_arrow');
            for(var i = 0; i < arrows.length; ++i)
            {
                arrows[i].classList.remove('buttstrap_arrow_active');
            }
            try
            {
                var active_arrow = document.getElementById('buttstrap_distance_' + _distance);
                active_arrow.classList.add('buttstrap_arrow_active');
            }catch(_e){}
        };

		this.set_content = function(_message_package)
		{
            var clear = false;
            var append = false;
            switch(_message_package.action)
            {
                case "reset":
                {
                    clear = true;
                    break;
                }
                case "set":
                {
                    clear = true;
                    append = true;
                    break;
                }
                case "append":
                {
                    append = true;
                    break;
                }
            }

            if(clear)
            {
                while(content.hasChildNodes())
                {
                    content.removeChild(content.firstChild);
                }
            }

            if(append)
            {
                content.appendChild(_message_package.content);
            }
		};

        this.set_html_content = function(_content)
        {
            content.innerHTML = _content;
        };

		this.toggle = function()
		{
			if(state)
			{
//				console.log("closing");
				frame.classList.remove('buttstrap_open');
				label.innerHTML = "▼";
				state = false;
			}
			else
			{
//				console.log("opening");
                frame.classList.add('buttstrap_open');
				label.innerHTML = "▲";
				state = true;
			}
		};

        this.open = function()
        {
            state = false;
            this.toggle();
        };

        this.close = function()
        {
            state = true;
            this.toggle();
        };

		var attach = function()
		{
            frame = helper.create_object('div', ['buttstrap']);

			label = helper.create_object('div', ['buttstrap_label']);
			label.appendChild(document.createTextNode("▼"));
			label.addEventListener('click',function(){buttstrap.toggle()},false);
            frame.appendChild(label);

            content = helper.create_object('div', ['buttstrap_content']);
            frame.appendChild(content);

			document.body.appendChild(frame);
		};

		attach();
		buttstrap = this;
	};

    function screenshot(_x,_y)
    {
        var mouse_position = game_controller.get_mouse().position;
/*
        var canvas = helper.create_object('canvas');
        canvas.width = wikiframe.offsetWidth;
        canvas.height = wikiframe.offsetHeight;

        var context = canvas.getContext('2d');

        domvas.toImage(wikiframe.contentWindow.document.body, function() {
            context.drawImage(this, 0, 0);
            context.strokeStyle = 'rgba(255,0,0,0.7)';
            context.lineWidth = 5;
            context.beginPath();
            context.arc(mouse_position.x,mouse_position.y,15,0,2*Math.PI,false);
            context.stroke();

            server_connector.send_message('screenshot', canvas.toDataURL());
        });
*/
        html2canvas(wikiframe.contentWindow.document.body, {logging:false, width:wikiframe.offsetWidth, height:wikiframe.offsetHeight,
            onrendered: function(_canvas)
            {
                var context = _canvas.getContext("2d");

                context.strokeStyle = 'rgba(255,0,0,0.7)';
                context.lineWidth = 5;
                context.beginPath();
                context.arc(mouse_position.x,mouse_position.y,15,0,2*Math.PI,false);
                context.stroke();

                server_connector.send_message('screenshot', _canvas.toDataURL(), true);
            }
        });

    }

	var setup = function()
	{
        if(document.documentMode)
        {
            IE_FALLBACK_MODE = true
        }
//        start_domvas();
        Helper();
		attach_wikiframe(document.body, settings.default_page);
		Buttstrap();
		Game_Controller();
        Analyzer();
        User();
		CSS_Controller();
		Notification_Controller();
        Hint_Controller();
        Dialog_Controller();
		Message_Handler();
        Tutorial_Controller();
        Debug();

        for(var i = 0; i < settings.css_files.length; ++i)
        {
            attach_css(settings.css_files[i]);
        }
		Server_Connector(settings.websocket_url);
//        Server_Connector("ws://129.27.12.44:8888/wikigame");
		Event_Controller();

        if(IE_FALLBACK_MODE)
        {
            dialog_controller.text_dialog("WARNING", '<div style="outline: 10px #CC0000 solid;">You are running in IE fallback mode. <br /> If you are NOT using the Microsoft Internet Explorer please contact [email]</div>', function(){dialog_controller.text_dialog("Welcome", '[WELCOME] <br /> [INTRODUCTION TEXT] <br /> [DATA SECURITY STATEMENT]', game_controller.start);});
        }
        else
        {
            dialog_controller.text_dialog("Welcome", '[WELCOME] <br /> [INTRODUCTION TEXT] <br /> [DATA SECURITY STATEMENT] <br /> PLACEHOLDER <br /> PLACEHOLDER <br /> PLACEHOLDER <br /> PLACEHOLDER', game_controller.start);
        }
		//temporary start

        //temporary hint
        //setTimeout(function(){hint_controller.display_hint('hint', 'INSTANT SOLUTION', 'wiki-schools/wp/e/Eastern_Europe.htm')}, 5000);
/*
        tutorial_controller.show_tutorial_frame({name: 'topleft', type: 'tutorial', position: {x: {alignment: "left", offset: "1rem"}, y: {alignment: "top", offset: "1rem"}}, arrow_position:"bottomright", title:"topleft", text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."});
        tutorial_controller.show_tutorial_frame('topcenter', 'emphasis', {x: {alignment: "center", offset: "1rem"}, y: {alignment: "top", offset: "1rem"}}, "bottomcenter",  "topcenter", "<br><br><br>PLACEHOLDER");
        tutorial_controller.show_tutorial_frame('topright', 'default', {x: {alignment: "right", offset: "1rem"}, y: {alignment: "top", offset: "1rem"}}, "bottomleft",  "topright", "<br><br><br>PLACEHOLDER");
        tutorial_controller.show_tutorial_frame('left', 'tutorial', {x: {alignment: "left", offset: "1rem"}, y: {alignment: "center", offset: "1rem"}}, "rightcenter", "left", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
        tutorial_controller.show_tutorial_frame('center', 'emphasis', {x: {alignment: "center", offset: "1rem"}, y: {alignment: "center", offset: "1rem"}}, "",  "center", "<br><br><br>PLACEHOLDER");
        tutorial_controller.show_tutorial_frame('right', 'default', {x: {alignment: "right", offset: "1rem"}, y: {alignment: "center", offset: "1rem"}}, "leftcenter",  "right", "<br><br><br>PLACEHOLDER");
        tutorial_controller.show_tutorial_frame('bottomleft', 'tutorial', {x: {alignment: "left", offset: "1rem"}, y: {alignment: "bottom", offset: "1rem"}}, "topright", "bottomleft", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
        tutorial_controller.show_tutorial_frame('bottomcenter', 'emphasis', {x: {alignment: "center", offset: "1rem"}, y: {alignment: "bottom", offset: "1rem"}}, "topcenter",  "bottomcenter", "<br><br><br>PLACEHOLDER");
        tutorial_controller.show_tutorial_frame('bottomright', 'error', {x: {alignment: "right", offset: "1rem"}, y: {alignment: "bottom", offset: "1rem"}}, "topleft",  "bottomright", "<br><br><br>PLACEHOLDER");
*/
    };

	this.handleEvent = function(_event)
	{
		var broadcast = false;

		switch(_event.type)
		{
			case "load":
			{
                console.log("CAPTURED LOAD");

                game_controller.block(false);
				broadcast = true;
				event_controller.attach_events();
                game_controller.reset_menu();
                game_controller.update_viewport();
                hint_controller.clear_hints();
				game_controller.set_current_page(wikiframe.contentWindow.location.href);
				game_controller.set_title(wikiframe.contentWindow.document.title);
                css_controller.unlock_frame();
				break;
			}

            case "resize":
            {
                broadcast = true;
                game_controller.update_viewport();
                break;
            }

            case "scroll":
            {
                broadcast = true;
                game_controller.update_viewport();
                break;
            }

			case "click":
			{
                if(_event.target.tagName == "A")
                {
                    server_connector.send_message("link_data", {target: _event.target.href, inner_text: _event.target.textContent, offset: analyzer.get_object_offset(_event.target)}, true);
                }
				broadcast = true;
				break;
			}

			case "dblclick":
			{
				broadcast = true;
				break;
			}

			case "mousemove":
			{
				broadcast = true;
				game_controller.set_mouse(_event.clientX,_event.clientY);
				break;
			}

			case "mousedown":
			{
				game_controller.set_mouse_button(_event.button,true);
				break;
			}

			case "mouseup":
			{
				game_controller.set_mouse_button(_event.button,false);
				break;
			}

            case "beforeunload":
            {
                //screenshot(_event.clientX,_event.clientY);
                css_controller.lock_frame();
                break;
            }

            case "keydown":
            {
                broadcast = true;
                game_controller.set_key(_event.which, true);
                break;
            }

            case "keyup":
            {
                broadcast = true;
                game_controller.set_key(_event.which, false);
                break;
            }
		}

		if(broadcast)
		{
            if(game_controller.get_block_state())
            {
                console.log("BLOCKED BROADCAST: " + _event.type)
            }
            else
            {
                server_connector.send_message("event", _event.type, true);
            }
		}
	};
	setup();
};

window.addEventListener("load", WikiGame,false);