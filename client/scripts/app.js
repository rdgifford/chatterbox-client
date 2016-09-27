$(document).ready(function() {
  var app = {
    server: 'https://api.parse.com/1/classes/messages?order=-createdAt&skip=100&limit=125',
    init: function() {
      this.renderRoom('test');
      this.fetch().done(function(data) {
        var rooms = _.filter(_.uniq(_.pluck(data.results, 'roomname')), x => typeof x === 'string');
        _.each(rooms, app.renderRoom);
        _.each(data.results, app.renderMessage);
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

    handleUsernameClick: function() {

    },

    handleSubmit: function() {
      console.log('invoked');
    }
  };

  app.init();
});