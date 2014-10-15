// main.js
//

(function(w, $, undefined) {
  "use strict";

	var Local = {

    init: function() {
      Local.$page = $('#js-page');

      // Partials
      Local.partials = {
        masthead: '#js-masthead',
        footer: '#js-footer'
      };
      Local.numPartials         = Object.keys(Local.partials).length - 1;
      Local.numIncludedPartials = 0;

      // Start
      Local.bindEvts();
      Local.includePartials();
    },

    bindEvts: function() {
      $.subscribe('partials.included', function() {
        $.unsubscribe('partials.included');
        Local.$page.addClass('page--rendered');
      });

      // Tappy.js
      $('a', Local.$page).each(function() {
        var href = $(this).attr('href');

        // Bind 'tap' event to anchors which go somewhere,
        // and preventDefault on all '#'-only anchors.
        if(href.indexOf('#') !== 0) {
          $(this).on('tap', function() {
            window.location.href = this.href;
          });
        } else {
          $(this).on('tap', function(e) {
            e.preventDefault();
          });
        }
      });

      // Show More button
      $('#js-smu', Local.$page).on('tap', function(e) {
        e.preventDefault();
        $('#js-sm-wrap', Local.$page).addClass('sm-wrap--show-more');
      });

      // Play/Pause
      $('#js-ldn-07-play', Local.$page).on('tap', function(e) {
        e.preventDefault();

        var video = $('#js-ldn-07 video', Local.$page)[0];
        if(video.paused) {
          video.play();
          console.log('play()');
        } else {
          video.pause();
          console.log('pause()');
        }
      });
    },

    includePartials: function() {
      $.each(Local.partials, function(partName) {
        var partPath = 'partials/' + partName + '.html';

        $.get( partPath )
          .done(function( data ) {
            $(Local.partials[ partName ], Local.$page).html( data );

            // If this is our last partial, emit an event
            if(Local.numIncludedPartials === Local.numPartials) {
              $.publish('partials.included');
            }
            Local.numIncludedPartials++;
          });
      });
    }
  };

	$(Local.init);
})(window, jQuery);
