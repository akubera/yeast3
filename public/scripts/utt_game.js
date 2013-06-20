
$(utt_game_init);

var socket = null;

function utt_game_init() {
  console.log("utt_game_init");
  
  // connect to server
  socket = io.connect('http://localhost');
  
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
  
  socket.on('move', on_move);
  
  $(".sub_board td").click(on_box_click);
  
}

function on_box_click(ev) {
  var id = ev.currentTarget.id;
  console.log(ev.currentTarget, id, ev);
  var re = /square_(\d\d)(\d\d)/;
  console.log(id,re,id.match(re));
  var dat = id.match(re);
  socket.emit('move_made', { box : dat[1], sub_box : dat[2] });
}

function on_move(data) {
  var id = "#square_" + data.box + data.sub_box;
  $(id).html("×");
}