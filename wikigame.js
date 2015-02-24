// JavaScript Document
//localStorage.clear();
var WikiGame = function()
{
	var settings = {spam_interval:10};

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
    var analyzer;
    var user;
	var buttstrap;
    var helper;
	var client_id;

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

        this.reset = function()
        {

            dialog_controller.text_dialog("DONE", 'The system will now reset!', game_controller.start);
            localStorage.clear();
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
            var buttstrap_content = document.createElement('div');
            var start_link = document.createElement('a');
            start_link.href = _game_data.start_page.url;
            start_link.target = '_blank';
            start_link.appendChild(document.createTextNode(_game_data.start_page.name));
            var goal_link = document.createElement('a');
            goal_link.href = _game_data.goal_page.url;
            goal_link.target = '_blank';
            goal_link.appendChild(document.createTextNode(_game_data.goal_page.name));

            var buttstrap_arrow_container = document.createElement('div');
            buttstrap_arrow_container.classList.add('buttstrap_arrow_container');
            var buttstrap_arrow_start = document.createElement('div');
            buttstrap_arrow_start.classList.add('buttstrap_arrow');
            buttstrap_arrow_start.classList.add('buttstrap_arrow_post');
            buttstrap_arrow_start.appendChild(start_link);
            buttstrap_arrow_start.style.backgroundColor = 'rgba(200, 0, 0, 1)';
            buttstrap_arrow_start.style.zIndex = game_info.distance;
            buttstrap_arrow_start.id = "buttstrap_distance_" + game_info.distance;
            buttstrap_arrow_container.appendChild(buttstrap_arrow_start);

            for(var i = 1; i < game_info.distance; ++i)
            {
                var buttstrap_arrow_mid = document.createElement('div');
                buttstrap_arrow_mid.classList.add('buttstrap_arrow');
                buttstrap_arrow_mid.classList.add('buttstrap_arrow_post');
                var color_split = game_info.distance / 2;
                var red_part = Math.round((2 * Math.min(game_info.distance  - i, color_split) / game_info.distance)  * 200);
                var blue_part = Math.round((2 * Math.min(i, color_split) / game_info.distance)  * 200);
                buttstrap_arrow_mid.style.backgroundColor = 'rgba(' + red_part + ', ' + blue_part + ', 0, 1)';
                buttstrap_arrow_mid.style.zIndex = game_info.distance - i;
                buttstrap_arrow_mid.id = "buttstrap_distance_" + (game_info.distance - i);
                buttstrap_arrow_container.appendChild(buttstrap_arrow_mid);
            }

            var buttstrap_arrow_goal = document.createElement('div');
            buttstrap_arrow_goal.classList.add('buttstrap_arrow');
            buttstrap_arrow_goal.appendChild(goal_link);
            buttstrap_arrow_goal.style.backgroundColor = 'rgba(0, 200, 0, 1)';
            buttstrap_arrow_goal.style.textAlign = 'right';
            buttstrap_arrow_goal.style.zIndex = 0;
            buttstrap_arrow_goal.id = "buttstrap_distance_0";
            buttstrap_arrow_container.appendChild(buttstrap_arrow_goal);
            buttstrap.set_content({action: "set", content: buttstrap_arrow_container});


            buttstrap.open();
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

            var abort_frame = document.createElement('div');
            abort_frame.classList.add('abort_frame');
            abort_frame.classList.add("close");

            var abort_text = document.createElement('div');
            abort_text.classList.add('abort_text');
            abort_text.appendChild(document.createTextNode("Abort Task"));
            abort_text.addEventListener('click', function(){game_controller.abort_game(false);}, false);
            abort_frame.appendChild(abort_text);

            document.body.appendChild(abort_frame);

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
                var confirmed = dialog_controller.confirm_dialog("Are you sure?", "Do you really want to abort the mission?", function(_response){if(_response){server_connector.send_message("abort", null, false);}})
                return;
            }
            server_connector.send_message("abort", null, false);
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

            var target_clone = document.createElement('div');
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
			wikiframe.addEventListener('load', this, false);
			window.addEventListener("resize", this, false);
            wikiframe.addEventListener('scroll', this, false);
            wikiframe.contentWindow.addEventListener('readystatechange', this, false);
		};

		this.attach_events = function()
		{
			wikiframe.contentWindow.document.addEventListener('click', wikigame, false);
			wikiframe.contentWindow.document.addEventListener('mousemove', wikigame, false);
			wikiframe.contentWindow.document.addEventListener('mousedown', wikigame, false);
			wikiframe.contentWindow.document.addEventListener('mouseup', wikigame, false);
			wikiframe.contentWindow.document.addEventListener('mousemove', wikigame, false);
			wikiframe.contentWindow.document.addEventListener('dblclick', wikigame, false);
			wikiframe.contentWindow.document.addEventListener("scroll", wikigame, false);
            wikiframe.contentWindow.document.addEventListener("keypress", wikigame, false);
            wikiframe.contentWindow.document.addEventListener("keyup", wikigame, false);
            wikiframe.contentWindow.document.addEventListener("keydown", wikigame, false);

			wikiframe.contentWindow.addEventListener("beforeunload", wikigame, false);
		};

		setup();
		event_controller = this;
	};

    var Dialog_Controller = function()
    {
        var dialog_background = document.createElement('div');
        dialog_background.classList.add('dialog_background');
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
            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");
            var input_field = document.createElement('input');
            input_field.classList.add("dialog_input");
            input_field.type = "text";
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_int = function()
        {
            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");
            var input_field = document.createElement('input');
            input_field.classList.add("dialog_input");
            input_field.type = "number";
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_bool = function()
        {
            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");
            var input_field = document.createElement('select');
            input_field.classList.add("dialog_input");

            var option_true = document.createElement('option');
            option_true.appendChild(document.createTextNode('Yes'));
            option_true.value = true;
            input_field.appendChild(option_true);

            var option_false = document.createElement('option');
            option_false.appendChild(document.createTextNode('No'));
            option_false.value = false;
            input_field.appendChild(option_false);

            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        var dialog_input_range = function(_from, _to)
        {
            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");
            var input_tooltip = document.createElement('div');
            input_tooltip.classList.add('dialog_tooltip');
            input_tooltip.classList.add('dialog_tooltip_range');
            input_tooltip.appendChild(document.createTextNode("😕"));

            var input_tooltip_right = document.createElement('span');
            input_tooltip_right.style = "float: right";
            input_tooltip_right.appendChild(document.createTextNode("😀"));
            input_tooltip.appendChild(input_tooltip_right);
            input_frame.appendChild(input_tooltip);
            var input_field = document.createElement('input');
            input_field.classList.add("dialog_input");
            input_field.type = "range";
            input_field.min = _from;
            input_field.max = _to;
            input_field.value = (_from + _to) / 2;
            input_frame.appendChild(input_field);
            return {frame:input_frame, field:input_field};
        };

        this.dialog = function(_text, _type, _payload, _callback)
        {
            background_show(true);
            var dialog_frame = document.createElement('div');
            dialog_frame.classList.add('dialog_frame');
            document.body.appendChild(dialog_frame);

            var dialog_label = document.createElement('div');
            dialog_label.classList.add('dialog_label');
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

            var dialog_buttons = document.createElement('div');
            dialog_buttons.classList.add('dialog_buttons');

            var dialog_button_ok = document.createElement('button');
            dialog_button_ok.classList.add('dialog_button');
            dialog_button_ok.classList.add('confirm');
            dialog_button_ok.appendChild(document.createTextNode('ok'));
            dialog_button_ok.addEventListener('click',function(){_callback(input.field.value); background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_ok);

            var dialog_button_cancel = document.createElement('button');
            dialog_button_cancel.classList.add('dialog_button');
            dialog_button_cancel.classList.add('close');
            dialog_button_cancel.appendChild(document.createTextNode('cancel'));
            dialog_button_cancel.addEventListener('click',function(){background_show(false); document.body.removeChild(dialog_frame)},false);
            dialog_buttons.appendChild(dialog_button_cancel);

            dialog_frame.appendChild(dialog_buttons);
        };

        this.text_dialog = function(_title, _text, _callback)
        {
            background_show(true);
            var dialog_frame = document.createElement('div');
            dialog_frame.classList.add('dialog_frame');
            document.body.appendChild(dialog_frame);

            var dialog_label = document.createElement('div');
            dialog_label.classList.add('dialog_label');
            dialog_label.appendChild(document.createTextNode(_title));
            dialog_frame.appendChild(dialog_label);

            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");

            var text_content = document.createElement('div');
            text_content.classList.add('dialog_text');
            text_content.appendChild(document.createTextNode(_text));
            input_frame.appendChild(text_content);
            dialog_frame.appendChild(input_frame);

            var dialog_buttons = document.createElement('div');
            dialog_buttons.classList.add('dialog_buttons');

            var dialog_button_ok = document.createElement('button');
            dialog_button_ok.classList.add('dialog_button');
            dialog_button_ok.classList.add('confirm');
            dialog_button_ok.appendChild(document.createTextNode('ok'));
            dialog_button_ok.addEventListener('click',function(){if(_callback){_callback()} background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_ok);


            dialog_frame.appendChild(dialog_buttons);
        };

        this.confirm_dialog = function(_title, _text, _callback)
        {
            background_show(true);
            var dialog_frame = document.createElement('div');
            dialog_frame.classList.add('dialog_frame');
            document.body.appendChild(dialog_frame);

            var dialog_label = document.createElement('div');
            dialog_label.classList.add('dialog_label');
            dialog_label.appendChild(document.createTextNode(_title));
            dialog_frame.appendChild(dialog_label);

            var input_frame = document.createElement('div');
            input_frame.classList.add("dialog_content");

            var text_content = document.createElement('div');
            text_content.classList.add('dialog_text');
            text_content.appendChild(document.createTextNode(_text));
            input_frame.appendChild(text_content);
            dialog_frame.appendChild(input_frame);

            var dialog_buttons = document.createElement('div');
            dialog_buttons.classList.add('dialog_buttons');

            var dialog_button_yes = document.createElement('button');
            dialog_button_yes.classList.add('dialog_button');
            dialog_button_yes.classList.add('confirm');
            dialog_button_yes.appendChild(document.createTextNode('yes'));
            dialog_button_yes.addEventListener('click',function(){_callback(true); background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_yes);

            var dialog_button_no = document.createElement('button');
            dialog_button_no.classList.add('dialog_button');
            dialog_button_no.classList.add('close');
            dialog_button_no.appendChild(document.createTextNode('no'));
            dialog_button_no.addEventListener('click',function(){_callback(false); background_show(false); document.body.removeChild(dialog_frame);},false);
            dialog_buttons.appendChild(dialog_button_no);

            dialog_frame.appendChild(dialog_buttons);

        };

        dialog_controller = this;
    };

    var Hint_Controller = function()
    {
        var hints_frame = document.createElement('div');
        hints_frame.classList.add('hints_frame');
        hints_frame.classList.add('hints_frame');
        document.body.appendChild(hints_frame);

        this.display_hint = function(_type, _text, _link)
        {
            var hint_frame = document.createElement('div');
            hint_frame.classList.add('hint_frame');
            hint_frame.classList.add(_type);

            var hint_text = document.createElement('div');
            hint_text.classList.add('hint_text');
            hint_text.appendChild(document.createTextNode(_text));
            hint_text.addEventListener('click', function(){hint_follow(_link, hint_frame);}, false);

            var hint_close = document.createElement('div');
            hint_close.classList.add('hint_close');
            hint_close.classList.add('close');
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

	var Notification_Controller = function()
	{
		var notification_frame;
		var notification_list = [];

		var notification = function(_type,_inner_html)
		{
			this.node = document.createElement('div');
			this.node.classList.add('notification');
			this.node.classList.add(_type);

			var inner_core = document.createElement('div');
			inner_core.addEventListener('mouseover',function(){return function(evt){evt.target.parentNode.style.animationPlayState="paused"}}());
			inner_core.addEventListener('mouseout',function(){return function(evt){evt.target.parentNode.style.animationPlayState="running"}}());
			inner_core.classList.add('notification_message_core');
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

		notification_frame = document.createElement('div');
		notification_frame.classList.add('notification_frame');
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

			socket.addEventListener('message',function(){return function(evt){message_handler.handle_message(evt.data);}}());
			socket.addEventListener('open',function(){flush_queue(); notification_controller.notify("emphasis","Server connection established!");},false);
			socket.addEventListener('close',function(){socket = null; setTimeout(create_socket, 5000); notification_controller.notify("error","Server connection terminated!");},false);
		};

		this.send_message = function(_type,_message,_attach_features)
		{
            message_queue.push(construct_message(_type,_message,_attach_features));
            flush_queue();
		};

        var flush_queue = function()
        {
            while(message_queue.length != 0)
            {
                socket.send(message_queue.shift());
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
		var frame = document.createElement('iframe');
		frame.classList.add('wikiframe');
		frame.src = _start_page;
		_parent.appendChild(frame);
		wikiframe = frame;
	};

	var attach_css = function(_path)
	{
		var wikigame_css = document.createElement('link');
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
            frame = document.createElement('div');
            frame.classList.add('buttstrap');

			label = document.createElement('div');
			label.classList.add('buttstrap_label');
			label.appendChild(document.createTextNode("▼"));
			label.addEventListener('click',function(){buttstrap.toggle()},false);
            frame.appendChild(label);

            content = document.createElement('div');
            content.classList.add('buttstrap_content');
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
        var canvas = document.createElement('canvas');
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
//        start_domvas();
		attach_css("PAT_wikigame/wikigame.css");
		attach_wikiframe(document.body,'wiki-schools/');
        Helper();
		Buttstrap();
		Game_Controller();
        Analyzer();
        User();
		CSS_Controller();
		Notification_Controller();
        Hint_Controller();
        Dialog_Controller();
		Message_Handler();

		Server_Connector("ws://127.0.0.1:8888/wikigame");
//        Server_Connector("ws://129.27.12.44:8888/wikigame");
		Event_Controller();

        dialog_controller.text_dialog("Welcome", 'Can you navigate the network?', game_controller.start);
		//temporary start

        //temporary hint
        //setTimeout(function(){hint_controller.display_hint('hint', 'INSTANT SOLUTION', 'wiki-schools/wp/e/Eastern_Europe.htm')}, 5000);

	};

	this.handleEvent = function(_event)
	{
		var broadcast = false;

		switch(_event.type)
		{
            case "readystatechange":
            {
                alert("WHEEE");
                console.log("DOMContentLoaded");
                break;
            }

			case "load":
			{
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
			server_connector.send_message("event",_event.type,true);
		}
	};
	setup();
};

window.addEventListener("load", WikiGame,false);