// main.js
//

(function(w, $, undefined) {
  "use strict";

	var Local = {

    init: function() {
      Local.$page = $('#js-page');

      // Partials
      Local.partials = {
        masthead: '',
        footer: ''
      };
      Local.numPartials       = Object.keys(Local.partials).length;
      Local.numLoadedPartials = 0;

      // Start
      Local.bindEvts();
      Local.getPartials();
    },

    bindEvts: function() {
      $.subscribe('partials.loaded', function() {
        $.unsubscribe('partials.loaded');
        Local.renderPage();
      });
    },

    getPartials: function() {
      $.each(Local.partials, function(partName) {
        var partPath = 'partials/' + partName + '.mustache';

        $.get( partPath )
          .done(function(data) {
            Local.partials[ partName ] = data;

            // Increment first, otherwise we'll always be one behind
            Local.numLoadedPartials++;

            // If this is our last partial, emit an event
            if(Local.numLoadedPartials === Local.numPartials) {
              $.publish('partials.loaded');
            }
          });
      });
    },

    renderPage: function() {
      var tpl = Local.$page.text();
      var src = $.mustache(tpl, {}, Local.partials);
      Local.$page.html( src );
    }
  };

	$(Local.init);
})(window, jQuery);
