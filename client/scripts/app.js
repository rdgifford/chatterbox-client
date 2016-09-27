$(document).ready(function() {
  var app = {
    server: 'https://api.parse.com/1/classes/messages?order=-createdAt&skip=400&limit=22',
    init: function() {
      this.fetch().done(function(data) {
        var rooms = _.filter(_.uniq(_.pluck(data.results, 'roomname')), x => typeof x === 'string');
        _.each(rooms, app.renderRoom);
        // app.changeRoom(rooms[0], data.results);
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
      return $.get(this.server);
    },

    renderMessage: function(message) {
      var domMes = 
        '<div>' + 
          '<a href="" onclick="app.handleUsernameClick()" class="username">' + 
            message.username +
          '</a>' +
          '<p>' + message.text + '</p>' +
        '</div>';
      $('#chats').append(domMes);
    },

    clearMessages: function() {
      $('#chats').children().remove();
    },

    renderRoom: function(room) {
      var domRoom = '<option value="' + room + '">' + room + '</option>';
      $('#roomSelect').append(domRoom);
    },

    changeRoom: function(room) {
      // console.log('selected: ', room);
      app.clearMessages();
      this.fetch().done(function(data) {
        var filteredMessages = _.filter(data.results, x => x.roomname === room);
        _.each(filteredMessages, app.renderMessage);
      });
    },

    handleUsernameClick: function() {

    },

    handleSubmit: function() {
      console.log('invoked');
    }
  };

  app.init();

  $('#roomSelect').change(function(event) {
    app.changeRoom(event.currentTarget.value);
  });

  $('#send .submit').submit(function(event) {
    app.handleSubmit();
    event.preventDefault();
  });
});