// main.js
//

(function(w, $, undefined) {
  "use strict";

  $.fn.isOnScreen = function(){

    var viewport    = {};
    viewport.top    = $(window).scrollTop();
    viewport.bottom = viewport.top + $(window).height();

    var bounds    = {};
    bounds.top    = this.offset().top;
    bounds.bottom = bounds.top + this.outerHeight();

    return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
  };

  // LOCAL STREAM
  // Prototype functionality

	var Local = {

    init: function() {
      Local.$page = $('#js-page');

      // Partials
      Local.partials = {
        masthead: '#js-masthead',
        footer: '#js-footer'
      };
      Local.numPartials          = Object.keys(Local.partials).length - 1;
      Local.numIncludedPartials  = 0;
      Local.awaitingNotification = false;

      $.ajaxSetup({
        // ...
      });

      // Start
      Local.bindEvts();
      Local.includePartials();

      // Only trigger alerts on
      // the London page.
      if(Local.$page.data('page') === 'london') {
        setTimeout(Local.fireNewUpdatesNotification, 2000);
      }
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
        $('#js-sm-wrap', Local.$page).addClass('sm-wrap--show-all');
      });

      // Load New updates
      $('#js-stream-snu', Local.$page).on('tap', Local.loadNewUpdates);
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
    },

    fireNewUpdatesNotification: function() {
      $('#js-stream-snu', Local.$page).addClass('stream__snu--visible');
      Local.awaitingNotification = true;

      if( !$('#js-stream-snu', Local.$page).isOnScreen() ) {
        // Then also show the drop-in CTA
        console.log('Show drop-in');
      }
    },

    loadNewUpdates: function(e) {
      e.preventDefault();

      if(!Local.awaitingNotification) {
        return;
      }

      Local.insertNewUpdates( afterInsertNewUpdates );

      function afterInsertNewUpdates() {
        $('#js-sm-wrap', Local.$page).addClass('sm-wrap--after-snu');
        $('#js-stream-snu', Local.$page).removeClass('stream__snu--visible');
        Local.awaitingNotification = false;
      }
    },

    insertNewUpdates: function(callback) {
      $('#js-new-updates .stream__unit').insertAfter('#js-stream-day-sep');
      callback();
    }

  };

	$(Local.init);
})(window, jQuery);
