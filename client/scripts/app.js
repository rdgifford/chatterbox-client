$(document).ready(function() {
  var app = {
    server: 'https://api.parse.com/1/classes/messages',
    getURL: '?order=-createdAt&skip=0&limit=1000',
    friends: {},
    init: function() {
      this.fetch().done(function(data) {
        var rooms = _.filter(_.uniq(_.pluck(data.results, 'roomname')), x => typeof x === 'string');
        _.each(rooms, app.renderRoom);
        app.changeRoom(rooms[0], data.results);
      });
    },  

    send: function(message) { 
      $.ajax({
        url: this.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json'
      });
    },

    fetch: function() {
      return $.get(this.server + this.getURL);
    },

    renderMessage: function(message) {
      var usernameClass = app.friends[message.username] ? 'username friend' : 'username';

      var $message = $('<div>')
        .append($('<a>').addClass(usernameClass).text(message.username))
        .append($('<p>').text(message.text))
        .append($('<br>'));

      $('#chats').append($message);
    },

    clearMessages: function() {
      $('#chats').children().remove();
    },

    renderRoom: function(room) {
      var $room = $('<option>').val(room).text(room);
      $('#roomSelect').append($room);
    },

    changeRoom: function(room) {
      $('.spinner').toggle();
      app.clearMessages();
      this.fetch().done(function(data) {
        var filteredMessages = _.filter(data.results, x => x.roomname === room);
        _.each(filteredMessages, app.renderMessage);
        $('.spinner').toggle();
      });
    },

    handleUsernameClick: function(event) {
      var friend = event.currentTarget.text;
      if (app.friends[friend]) {
        delete app.friends[friend];
      } else {
        app.friends[friend] = true;
      }
      app.changeRoom($('#roomSelect').val());
      event.preventDefault();
    },

    handleSubmit: function(event) {
      var username = location.search.replace('?username=', '');
      var roomname = $('#roomSelect').val();
      var text = $('#message').val();
      var message = {
        username: username,
        text: text,
        roomname: roomname
      };
      app.send(message);
      $('#message').val('');
      app.changeRoom(roomname);
      event.preventDefault();
    },

    newRoom: function(event) {
      var roomname = window.prompt('Please enter a roomname:');
      var username = location.search.replace('?username=', '');
      var message = {
        username: username,
        text: 'New room created!',
        roomname: roomname
      };
      app.renderRoom(roomname);
      $('#roomSelect').val(roomname);
      app.send(message);
      app.changeRoom(roomname);
    }
  };

  app.init();

  $('#roomSelect').change(function(event) {
    app.changeRoom(event.currentTarget.value);
  });

  $('#send .submit').submit(app.handleSubmit);

  $(document).on('click', '.username', app.handleUsernameClick);
  $('#refresh').click(function(event) {
    app.changeRoom($('#roomSelect').val());
  });

  $('#newRoom').on('click', app.newRoom);
});