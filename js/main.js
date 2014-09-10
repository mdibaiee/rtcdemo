navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.oGetUserMedia ||
                         navigator.msGetUserMedia;

$(function() {
  var peer;
  $('a[href="#call"]').click(function(e) {
    e.preventDefault();

    $('.modal.call').removeClass('hidden');
  });

  $('.modal.wait button').prop('disabled', false);

  $('#call').submit(function(e) {
    e.preventDefault();
    var dest = $(this).find('input').val();
    navigator.getUserMedia({audio: true, video: true}, function(stream) {
      $('.self video').prop('src', window.URL.createObjectURL(stream));
      $('.self video')[0].play();

      if(!stream.getVideoTracks().length) {
        $('.self p').removeClass('hidden');
      }

      var name = $('#name input').val();
      var con = peer.connect(dest, {metadata: {name: name, id: peer.id}});
      var call = peer.call(dest, stream);
      $('.call').addClass('hidden');
      $('.connecting').removeClass('hidden');

      $('#chat').keyup(function(e) {
        if(e.keyCode == 13) {
          con.send({message: $(this).val(), name: name});
          $(this).val('');
        }
      });

      peer.on('call', function(c) {
        console.log('Got Called - peer:call');
        c.on('stream', function(str) {
          console.log('Got stream - peer.c:stream');
          window.stream = str;
          if(!str.getVideoTracks().length) {
            $('.remote p').removeClass('hidden');
          }
          $('.remote video').prop('src', window.URL.createObjectURL(str));
          $('.remote video')[0].play();
        });
      });

      call.on('stream', function(str) {
        console.log('Got stream - call:stream');
        window.stream = str;
        if(!str.getVideoTracks().length) {
          $('.remote p').removeClass('hidden');
        }
        $('.remote video').prop('src', window.URL.createObjectURL(str));
        $('.remote video')[0].play();
      });

      con.on('open', function() {
        $('.connecting').addClass('hidden');
        con.on('data', function(d) {
          if(d.decline) {
            $('.declined').removeClass('hidden');
            return con.close();
          } else if(d.accept) {
            $('.accepted').removeClass('hidden');
            return;
          }
          $('.chat div').append('<p>' + d.name + ': ' + d.message + '</p>');
        });

      });

    }, function(error) {
      $('.modal.err p').text('An error occured: ' + error);
    });
  });

  $('.close').click(function(e) {
    e.preventDefault();

    $(this).parent().addClass('hidden');
  });

  $('#name').submit(function(e) {
    e.preventDefault();
    var name = $(this).find('input').val();
    $('.modal.wait button').prop('disabled', true);
    $('.modal.wait p').removeClass('hidden');
    peer = new Peer({key: 'mj5sqj5jz53zncdi'});

    // PeerJS

    peer.on('open', function() {
      $('#id').html('Your ID is: ' + peer.id);
      $('.modal.wait p').html('Connected');
      $('.modal.wait').addClass('hidden');
      $('.chat').removeClass('hidden');
    });

    peer.on('connection', function(con) {
      $('.connected').removeClass('hidden').find('span').html(con.metadata.name);

      $('#decline').click(function(e) {
        e.preventDefault();
        con.send({decline: true});
        con.close();
      });

      $('#accept').click(function(e) {
        e.preventDefault();
        con.send({accept: true});
        $(this).parent().addClass('hidden');
      });

      var name = $('#name input').val();

      $('#chat').keyup(function(e) {
        if(e.keyCode == 13) {
          con.send({message: $(this).val(), name: name});
          $(this).val('');
        }
      });

      con.on('data', function(d) {

        $('.chat div').append('<p>' + d.name + ': ' + d.message + '</p>');
      });

    });

    peer.on('call', function(call) {
      navigator.getUserMedia({audio: true, video: true}, function(stream) {
        console.log(stream.getVideoTracks());
        window.stream = stream;
        call.answer(stream);
        if(!stream.getVideoTracks().length) {
          $('.self p').removeClass('hidden');
        }

        $('.self video').prop('src', window.URL.createObjectURL(stream));
        $('.self video')[0].play();

        call.on('stream', function(str) {
          $('.remote video').prop('src', window.URL.createObjectURL(str));
          $('.remote video')[0].play();

          if(!str.getVideoTracks().length) {
            $('.remote p').removeClass('hidden');
          }
        });
      }, function(err) {
        $('.error').removeClass('hidden').find('p').text('An error occured: ' + err);
      });
    });
  });

});
