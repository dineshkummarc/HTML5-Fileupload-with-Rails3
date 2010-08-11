(function() {
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  jQuery.fn.upload5 = function(settings) {
    var EventHandlers, QueuedUploader, defaultSettings, doNothing, dropBox, error, fileInput;
    doNothing = function() {};
    error = function(msg) {
      return alert(msg);
    };
    settings = settings || {};
    defaultSettings = {
      overClass: 'drag-over',
      dragEnter: doNothing,
      dragLeave: doNothing,
      drop: doNothing,
      progress: doNothing,
      completed: doNothing,
      queueCompleted: doNothing,
      attachHeaders: doNothing,
      error: error,
      uploadMethod: 'post',
      uploadAction: '/upload',
      maxFilesize: 1048576 * 6,
      typeFilter: /image.*/,
      debug: true
    };
    settings = jQuery.extend(defaultSettings, settings);
    dropBox = jQuery(this);
    QueuedUploader = function(_a) {
      var _b, _c, _d, file;
      this.files = _a;
      this.queue = [];
      this.queuePosition = 0;
      _c = this.files;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        file = _c[_b];
        file.type.match(settings.typeFilter) && file.fileSize < settings.maxFilesize ? this.queue.push(file) : settings.error('The file is too large or not an image');
      }
      this.processQueueItem(0);
      return null;
      return this;
    };
    QueuedUploader.prototype.processQueueItem = function(queuePosition) {
      var file;
      this.queuePosition = queuePosition;
      if (this.queuePosition < this.queue.length) {
        file = this.queue[this.queuePosition];
        this.sendFile(file, __bind(function() {
          this.processQueueItem(this.queuePosition + 1);
          return null;
        }, this));
      } else {
        settings.queueCompleted;
      }
      return null;
    };
    QueuedUploader.prototype.sendFile = function(file, callback) {
      var queuePosition, xhr;
      queuePosition = this.queuePosition;
      xhr = new XMLHttpRequest();
      xhr.open(settings.uploadMethod, settings.uploadAction, true);
      xhr.onprogress = __bind(function(e) {
        e.lengthComputable ? settings.progress({
          queuePosition: this.queuePosition,
          loaded: e.loaded,
          total: e.total
        }) : null;
        return null;
      }, this);
      xhr.upload.onprogress = __bind(function(e) {
        e.lengthComputable ? settings.progress({
          queuePosition: this.queuePosition,
          loaded: e.loaded,
          total: e.total
        }) : null;
        return null;
      }, this);
      xhr.onreadystatechange = function(e) {
        if (this.readyState !== 4) {
          return null;
        }
        settings.completed({
          queuePosition: queuePosition,
          response: this
        });
        callback();
        return null;
      };
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('X-File-Name', file.fileName);
      xhr.setRequestHeader('X-File-Size', file.fileSize);
      xhr.setRequestHeader('X-File-Type', file.type);
      settings.attachHeaders(xhr);
      xhr.send(file);
      return null;
    };
    EventHandlers = function() {};
    EventHandlers.dragenter = function(e) {
      e.stopPropagation();
      e.preventDefault();
      !(dropBox.hasClass(settings.overClass)) ? dropBox.addClass(settings.overClass) : null;
      settings.dragEnter(e);
      return false;
    };
    EventHandlers.dragleave = function(e) {
      e.stopPropagation();
      e.preventDefault();
      dropBox.hasClass(settings.overClass) ? dropBox.removeClass(settings.overClass) : null;
      settings.dragLeave(e);
      return false;
    };
    EventHandlers.drop = function(e) {
      var files, queuedUploader;
      e.stopPropagation();
      e.preventDefault();
      typeof e.originalEvent.dataTransfer === "undefined" ? (files = e.originalEvent.target.files) : (files = e.originalEvent.dataTransfer.files);
      settings.drop(files);
      queuedUploader = new QueuedUploader(files);
      return false;
    };
    if (typeof window.FileReader === "function") {
      dropBox.bind('dragenter', EventHandlers.dragenter);
      dropBox.bind('dragover', EventHandlers.dragenter);
      dropBox.bind('dragleave', EventHandlers.dragleave);
      dropBox.bind('drop', EventHandlers.drop);
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
      dropBox.bind('dragenter', EventHandlers.dragenter);
      dropBox.bind('dragleave', EventHandlers.dragleave);
      $(fileInput).bind('change', EventHandlers.drop);
    }
    return null;
  };
})();
