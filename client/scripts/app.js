$(document).ready(function() {
  var app = {
    server: 'https://api.parse.com/1/classes/messages',
    getURL: '?order=-createdAt&skip=0&limit=1000',
    friends: [],
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
      message.text = app.removeTags(message.text);
      var usernameClass = _.contains(app.friends, message.username) ? 'username friend' : 'username';
      if (message.text.length !== 0) {
        var domMes = 
          '<div>' + 
            '<a href="" class="' + usernameClass + '">' + 
              message.username +
            '</a>' +
            '<p>' + message.text + '</p>' +
          '</div>';
        $('#chats').append(domMes);
      }
    },

    clearMessages: function() {
      $('#chats').children().remove();
    },

    renderRoom: function(room) {
      room = app.removeTags(room);
      if (room.length !== 0) {
        var domRoom = '<option value="' + room + '">' + room + '</option>';
        $('#roomSelect').append(domRoom);
      }
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
      event.preventDefault();
      var username = event.currentTarget.text;
      if (!_.contains(app.friends, username)) {
        app.friends.push(event.currentTarget.text);
      }
      app.changeRoom($('#roomSelect').val());
    },

    handleSubmit: function(event) {
      event.preventDefault();
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
    },
    
    removeTags: function(html) {
      var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

      var tagOrComment = new RegExp(
        '<(?:'
        // Comment body.
        + '!--(?:(?:-*[^->])*--+|-?)'
        // Special "raw text" elements whose content should be elided.
        + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
        + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
        // Regular name
        + '|/?[a-z]'
        + tagBody
        + ')>',
        'gi'
      );

      var oldHtml;
      do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
      } while (html !== oldHtml);
      return html.replace(/</g, '&lt;');
    }
  };

  app.init();

  $('#roomSelect').change(function(event) {
    app.changeRoom(event.currentTarget.value);
  });

  $('#send .submit').submit(app.handleSubmit);

  $(document).on('click', '.username', app.handleUsernameClick); 
});