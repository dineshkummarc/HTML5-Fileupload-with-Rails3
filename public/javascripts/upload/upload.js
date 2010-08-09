jQuery(function($) {
  var validBrowsers = {
    firefox: '3.5.3',
    chrome: '5.0.375.99',
    safari: '5.0'
  };
  
  var browser = {
    agent   : navigator.userAgent.toLowerCase(),
    id      : navigator.userAgent.toLowerCase().match(/(firefox|chrome|safari|opera|msie)/)[1],
    version : (navigator.userAgent.toLowerCase().match(new RegExp('.+(?:version)[\/: ]([\\d.]+)')) || navigator.userAgent.toLowerCase().match(new RegExp('.+(?:' + navigator.userAgent.toLowerCase().match(/(firefox|chrome|safari|opera|msie)/)[1] + ')[\/: ]([\\d.]+)')) || [0,'0'])[1]
  };
  
  function checkForValidBrowser() {
    function browser_check(id) {
      return new RegExp(id).test(browser.agent);
    }
    
    for(id in validBrowsers) {
      if (browser_check(id) && version_compare(browser.version, validBrowsers[id], '>=')) {
        return true;
      }
    }
  }
    
  if(!checkForValidBrowser()) {
    $('#regular-upload').show();
    $('#drag-and-drop-upload').hide();
  } else {
    $('#regular-upload').hide();
  }
  
  var imageList = $("ul#images");
  var updateSortableAction = imageList.attr('data-update-sortable-action');
  var deleteItemAction = imageList.attr('data-delete-item-action');
  var updateItemAction = imageList.attr('data-update-item-action');
  
  // show hide remove buttons
  $('li.image', imageList)
    .live('mouseenter', function() {
      $('a.remove-button', this).show();
    })
    .live('mouseleave', function() {
      $('a.remove-button', this).hide();
    });

  // trigger action for remove
  $('a.remove-button', imageList).live('click', function() {
    var csrf_token = $('meta[name=csrf-token]').attr('content'),
        csrf_param = $('meta[name=csrf-param]').attr('content'),
        id = $(this).closest('li').attr('id').match(/image-(.*)/)[1];
  
    $(this).hide();
  
    $.ajax({
      type: "DELETE",
      url: deleteItemAction,
      processData: false,
      data: 'item_id=' + id + '&' + csrf_param + '=' + encodeURIComponent(csrf_token),
      success: function(msg) {
      }
    });
  
    var li = $(this).closest('li.image');
    li.fadeOut(100, function() {
      li.remove();
    })
  
    return false;
  });

  // sortable stuff
  function updateSortable(event, ui) {
    var csrf_token = $('meta[name=csrf-token]').attr('content'),
        csrf_param = $('meta[name=csrf-param]').attr('content'),
        data = $(imageList).sortable('serialize');
  
    $.ajax({
      type: "POST",
      url: updateSortableAction,
      processData: false,
      data: data + '&' + csrf_param + '=' + encodeURIComponent(csrf_token),
      success: function(msg) {
      }
    });
  }

  imageList.sortable({
      update: updateSortable
  });

  var currentInput = null;
  function saveCurrentInput() {
    if(currentInput != null) {
      var csrf_token = $('meta[name=csrf-token]').attr('content'),
          csrf_param = $('meta[name=csrf-param]').attr('content'),
          id = currentInput.closest('li').attr('id').match(/image-(.*)/)[1];
        
      $.ajax({
        type: "POST",
        url: updateItemAction,
        processData: false,
        data: 'item_id=' + id + '&title=' + encodeURIComponent(currentInput.val()) + '&' + csrf_param + '=' + encodeURIComponent(csrf_token),
        success: function(msg) {
        }
      });
    
      var div = currentInput.closest('div.title');
      div.attr('data-title', currentInput.val());
      div.text(currentInput.val());

      currentInput.remove();
      currentInput = null;
    }      
  }

  $('li > div.title', imageList).live('click', function() {
    saveCurrentInput();
  
    currentInput = $('<input class="inplace-editor" value="' + $(this).attr('data-title') + '" />');
    $(this).html(currentInput);
    currentInput.focus();
  });

  $('li > div.title input.inplace-editor', imageList).live('focusout', function() {
    saveCurrentInput();
  }).live('keydown', function(e) {
    if(e.keyCode == 13) {
      saveCurrentInput();
    }
  });

  // drag and drop stuff
  var dropbox = $('#dropbox');
  var uploadAction = dropbox.attr('data-upload-action');

  function dragenter(e) {
      e.stopPropagation();
      e.preventDefault();

      dropbox.css('background', '#a7ffa7');

      return false;
  }

  function dragover(e) {
      e.stopPropagation();
      e.preventDefault();

      dropbox.css('background', '#a7ffa7');

      return false;
  }

  function dragleave(e) {
      e.stopPropagation();
      e.preventDefault();

      dropbox.css('background', '#e7ffe7');

      return false;
  }

  function drop(e) {
      e.stopPropagation();
      e.preventDefault();

      $('#loading-indicator').stop().fadeIn('fast');
      dropbox.css('background', '#e7ffe7');

      // get files from drag and drop datatransfer or files in case of field change
      if(typeof e.originalEvent.dataTransfer == "undefined") {
          var files = e.originalEvent.target.files;
      } else {
          var files = e.originalEvent.dataTransfer.files;
      }

      handleFiles(files);

      return false;
  }

  function handleFiles(files) {
      var output  = $('#images');
      var queue = [];
    
      // send item in Queue via XHR
      function sendItemInQueue(queuePosition) {
          if(queuePosition < queue.length) {
              var file = queue[queuePosition].file;
            
              // post
              var xhr = new XMLHttpRequest;
              xhr.open('post', uploadAction, true);
              xhr.onprogress = function(e) {
                  if (e.lengthComputable) {
                      var k = 1024;
                      queue[queuePosition].li.html('<div class="title">Uploading (' + Number(e.loaded/k).toFixed() + '/' + Number(e.total/k).toFixed() + ')...</div>');
                  }
              };
              xhr.upload.onprogress = function(e) {
                  if (e.lengthComputable) {
                      var k = 1024;
                      queue[queuePosition].li.html('<div class="title">Uploading (' + Number(e.loaded/k).toFixed() + '/' + Number(e.total/k).toFixed() + ')...</div>');
                  }
              };
              xhr.onreadystatechange = function () {
                  if (this.readyState != 4)
                    return;
                
                  var response = JSON.parse(this.responseText);
                  var li = queue[queuePosition].li;
                
                  li.attr('id', 'image-' + response.image.id);
                  li.attr('class', 'image');
                  li.html('<img src="' + response.image.url + '" /><div class="title" data-title="' + response.image.title + '">' + response.image.title + '</div><a class="remove-button" href="#">x</a>');
                
                  // process next item
                  sendItemInQueue(queuePosition + 1);
              }
                    
              xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // multipart/form-data
              xhr.setRequestHeader('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT');
              xhr.setRequestHeader('Cache-Control', 'no-cache');
              xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              xhr.setRequestHeader('X-File-Name', file.fileName);
              xhr.setRequestHeader('X-File-Size', file.fileSize);
              xhr.setRequestHeader('X-File-Type', file.type);
            
              xhr.send(file);                
          } else {
            $('#loading-indicator').stop().fadeOut('fast');
          }
      }

      // process file list
      for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var imageType = /image.*/;

          if(file.type.match(imageType) && files[i].fileSize < 1048576 * 6) {
              var li = $('<li class="preview-image"><div class="title">Uploading...</div></li>');
              output.append(li);
            
              queue.push({
                file : file,
                li   : li
              });
          } else {
            alert("File is too large or not an image!");
          }
      }
    
      // trigger first item
      sendItemInQueue(0);
  }

//    var dropbox = dropbox.get(0);

  if(typeof window.FileReader === "function") {
      /* yes we have a file api */
      dropbox.bind('dragenter', dragenter);
      dropbox.bind('dragover', dragover);
      dropbox.bind('dragleave', dragleave);
      dropbox.bind('drop', drop);
  } else {
      /* we have to code a workaround */
      dropbox.css('position', 'relative');
    
      var fileInput = $('<input />');
      fileInput.attr({
          'id'       : 'files-upload',
          'type'     : 'file',
          'multiple' : 'true'
      });
      fileInput.css({
          'position' : 'absolute',
          'top'      : '0',
          'left'     : '0',
          'width'    : '100%',
          'height'   : '100%',
          'opacity'  : '0.0'
      });
    
      dropbox.append(fileInput);
    
      dropbox.bind('dragenter', dragenter);
      dropbox.bind('dragleave', dragleave);
      $(fileInput).bind('change', drop);
  }
});