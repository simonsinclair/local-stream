// main.js
//

(function(window, $, undefined) {
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

    config: {
      newArticlesInMs: 10000,
      popInHangTimeMs: 4000
    },

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
      Local.updatesInserted      = false;

      // Start
      Local.bindEvts();
      Local.includePartials();

      // Only trigger alerts on
      // the London page.
      if(Local.$page.data('page') === 'london') {
        setTimeout(Local.fireNewUpdatesNotification, Local.config.newArticlesInMs);
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
      $('#js-stream-snu,#js-pop-in', Local.$page).on('tap', Local.loadNewUpdates);
      // $('#js-pop-in', Local.$page).on('tap', Local.loadNewUpdates);
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

      if( ! $('#js-stream-snu', Local.$page).isOnScreen() ) {

        // Make pop-in visible for Local.config.popInHangTimeMs
        $('#js-pop-in').addClass('pop-in--visible');
        setTimeout(function() {
          $('#js-pop-in').removeClass('pop-in--visible');
        }, Local.config.popInHangTimeMs);
      }
    },

    loadNewUpdates: function(e) {
      e.preventDefault();

      // Disable clicking DOM elements when a notification isn't waiting
      if( ! Local.awaitingNotification ) {
        return;
      }

      $('#js-stream-snu', Local.$page).removeClass('stream__snu--visible');
      $('#js-pop-in', Local.$page).removeClass('pop-in--visible');

      // Scroll before inserting if inserting from pop-in CTA,
      // otherwise straight call insertNewUpdates().
      if(e.target.id === 'js-pop-in') {

        $('html,body').animate({

          scrollTop: $('#js-stream-header', Local.$page).offset().top

        }, 250, 'swing', function() {

          Local.insertNewUpdates();
          Local.updatesInserted = true;

        });

      } else {
        Local.insertNewUpdates();
      }
    },

    insertNewUpdates: function() {
      if(Local.updatesInserted) {
        return;
      }

      $('#js-new-updates', Local.$page).addClass('new-updates--visible');
      $('#js-sm-wrap', Local.$page).addClass('sm-wrap--after-snu');

      Local.awaitingNotification = false;

      Local.coolHotUpdates();
    },

    coolHotUpdates: function() {
      $('#js-new-updates .stream__unit--fresh', Local.$page)
        .each(function(i, elm) {

          var timeout = (i + 1) * 3000;

          setTimeout(function() {
            $(elm).removeClass('stream__unit--fresh');
          }, timeout);

        });
    }

  };

	$(Local.init);
})(window, jQuery);
