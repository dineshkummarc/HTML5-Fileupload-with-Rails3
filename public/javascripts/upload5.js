(function() {
  jQuery.fn.upload5 = function(settings) {
    var defaultSettings, dropBox, fileInput, handlers;
    settings = settings || {};
    defaultSettings = {
      overClass: 'drag-over',
      debug: true
    };
    settings = jQuery.extend(defaultSettings, settings);
    dropBox = jQuery(this);
    console.log(dropBox);
    handlers = {
      dragenter: function(e) {
        e.stopPropagation();
        e.preventDefault();
        !(dropBox.hasClass(settings.overClass)) ? dropBox.addClass(settings.overClass) : null;
        return false;
      },
      dragleave: function(e) {
        e.stopPropagation();
        e.preventDefault();
        dropBox.hasClass(settings.overClass) ? dropBox.removeClass(settings.overClass) : null;
        return false;
      },
      drop: function(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };
    if (typeof window.FileReader === "function") {
      dropBox.bind('dragenter', handlers.dragenter);
      dropBox.bind('dragover', handlers.dragenter);
      dropBox.bind('dragleave', handlers.dragleave);
      dropBox.bind('drop', handlers.drop);
    } else {
      dropBox.css('position', 'relative');
      fileInput = jQuery('<input />');
      fileInput.attr({
        id: 'files-upload',
        type: 'file',
        multiple: 'true'
      });
      fileInput.css({
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        opacity: '0.0'
      });
      dropBox.append(fileInput);
      dropBox.bind('dragenter', handlers.dragenter);
      dropBox.bind('dragleave', handlers.dragleave);
      $(fileInput).bind('change', handlers.drop);
    }
    return this;
  };
})();