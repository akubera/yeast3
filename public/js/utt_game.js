
$(utt_game_init);

var socket = null;

function utt_game_init() {
  console.log("utt_game_init");
  
  // connect to server
  socket = io.connect();
  
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  
  socket.on('connection_count', update_connection_count);
  
  socket.on('move', on_move);
  
  $(".sub_board td").click(on_box_click);
  $("#play_button").click(on_play_button);
  
}

function on_box_click(ev) {
  var id = ev.currentTarget.id;
  console.log(ev.currentTarget, id, ev);
  var re = /square_(\d\d)(\d\d)/;
  console.log(id,re,id.match(re));
  var dat = id.match(re);
  socket.emit('move_made', { box : dat[1], sub_box : dat[2] });
}

function update_connection_count (data) {
  $("#cnx_num").text(data.count);
}

var toggle = 0;

function on_move(data) {
  var id = "#square_" + data.box + data.sub_box;
  
  // Unicode : https://en.wikipedia.org/wiki/Geometric_Shapes
  //   circle: &#9675; double-circle: &#9678; lozenge: &#9674;
  //
  $(id).html( toggle++ % 2 ? "&#x00D7;" : "&#9678;");

  $(id).unbind("click");
}


function on_play_button(ev) {
//   $(ev.target).hide({"speed":"slow"});
//  $(ev.target).fadeOut('slow');
//  $(ev.target).replaceWith('<div id="play_button" class="btn btn-primary">PLAY!</div>');
//   $(ev.target).appendTo("#wrap");

  // Create the username prompt
  var prompt_wrap_string = "<div id='prompt_wrap'><span>Please Input Username:</span><br/><input id='username_input' type='text' /></div>";
  var prompt_wrap = $(prompt_wrap_string).hide();
  // keyup waiting for "enter"
//   $("#username_input").on("keyup", _username_keyup);

  function _prompt_username() {
    _update_playbutton(prompt_wrap, function(){ $("#username_input").on("keyup", _username_keyup);});
    return;
    
    // ignore rest for now
    $('#play_button_content').fadeOut("slow", _fadeout_cb);

    function _fadeout_cb() {
      $("#play_button_content").replaceWith(prompt_wrap);
      $('#prompt_wrap').fadeIn("slow");
    }

  }
  
  function _update_playbutton(content, cb) {
    $("#play_button_content").fadeOut('slow', _fadeout_cb);
    
    function _fadeout_cb() {
      if (typeof content === "string") {
        $("#play_button_content").html(content);
      } else {
        $('#play_button_content').html('');
        $(content).show().appendTo("#play_button_content");
      }
      $('#play_button_content').fadeIn("slow");
      
      if (typeof cb === "function") {
        setTimeout(cb, 0);
      }
    }
  }

    
  // when username presses enter - handle something
  function _username_keyup(ev) {
    if (ev.which === 13) {
      console.log("submit!", ev.target.value); 
      socket.emit('set_user', { username : ev.target.value });
      _update_playbutton("<div id='play_button_content'><span>Verifying Username</span></div>");
    }
  }
  
  
  socket.on('set_user', function (data) { 
    // There was an error
    if (data.status !== 0) {
      if (typeof data.debug === "undefined") {
        data.debug = "";
      }
      console.error(data.status, data.debug);
      _update_playbutton("ERROR!");
    } else {
      _update_playbutton("Success!");
      setTimeout(function _remove_button() { 
        console.log("removing button!");
        $("#play_button").fadeOut("slow");
      }, 2500);
      
         
      update_username(data.username);
    }
  });
   
   $(this).off('click');
   // Call _prompt_username
   setTimeout(_prompt_username, 0); 
    
}

function update_username(name) {
  $("#userbox").html(name);
}

