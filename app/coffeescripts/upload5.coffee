jQuery.fn.upload5 = (settings) ->
  # define nop functions
  doNothing = ->
  error = (msg) ->
    alert(msg);
  
  # have some nice default settings
  settings = settings or {}
  defaultSettings =
    overClass      : 'drag-over'
    dragEnter      : doNothing
    dragLeave      : doNothing
    drop           : doNothing
    progress       : doNothing
    completed      : doNothing
    queueCompleted : doNothing
    attachHeaders  : doNothing
    error          : error
    uploadMethod   : 'post'
    uploadAction   : '/upload'
    maxFilesize    : 1048576 * 6
    typeFilter     : /image.*/
    debug          : true
  
  settings = jQuery.extend defaultSettings, settings
  
  # this element will be dropable
  dropBox  = jQuery this
  
  # upload processor
  class QueuedUploader 
    constructor: (@files) ->
      @queue = []
      @queuePosition = 0
      
      # build queue
      for file in @files
        if file.type.match(settings.typeFilter) and file.fileSize < settings.maxFilesize
          @queue.push(file)
        else
          settings.error('The file is too large or not an image')
      
      # trigger first processing
      @processQueueItem(0)
      return
    processQueueItem: (queuePosition) ->
      @queuePosition = queuePosition
      
      # stop recursion when all items in queue are processed
      if @queuePosition < @queue.length
        file = @queue[@queuePosition]
        
        # send the file
        @sendFile(file, =>
          @processQueueItem(@queuePosition + 1)
          return
        )
      else
        # call queue completed callback
        settings.queueCompleted
      return
    sendFile: (file, callback) ->
      queuePosition = @queuePosition
      
      xhr = new XMLHttpRequest
      xhr.open settings.uploadMethod, settings.uploadAction, true
      xhr.onprogress = (e) =>
        if e.lengthComputable
          # progress callback
          settings.progress({
            queuePosition: @queuePosition
            loaded: e.loaded
            total: e.total
          })
        return
      xhr.upload.onprogress = (e) =>
        if e.lengthComputable
          # progress callback
          settings.progress({
            queuePosition: @queuePosition
            loaded: e.loaded
            total: e.total
          })
        return
      xhr.onreadystatechange = (e) ->
        if @readyState != 4
          return
        
        # completed callback
        settings.completed({
          queuePosition: queuePosition
          response: this
        })
        
        # call success callback
        callback()
        return
      
      xhr.setRequestHeader 'Content-Type', 'application/octet-stream'
      xhr.setRequestHeader 'If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT'
      xhr.setRequestHeader 'Cache-Control', 'no-cache'
      xhr.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'
      xhr.setRequestHeader 'X-File-Name', file.fileName
      xhr.setRequestHeader 'X-File-Size', file.fileSize
      xhr.setRequestHeader 'X-File-Type', file.type
      settings.attachHeaders(xhr)
      
      xhr.send(file);
      return
  
  # define event handlers
  class EventHandlers
    @dragenter: (e) -> 
      e.stopPropagation()
      e.preventDefault()
      
      unless dropBox.hasClass settings.overClass
        dropBox.addClass settings.overClass
      
      settings.dragEnter(e)
      return false
    
    @dragleave: (e) ->
      e.stopPropagation()
      e.preventDefault()
      
      if dropBox.hasClass settings.overClass
        dropBox.removeClass settings.overClass
      
      settings.dragLeave(e)
      return false
    
    @drop: (e) ->
      e.stopPropagation()
      e.preventDefault()
      
      # get files from drag and drop datatransfer or files in case of field change
      if typeof e.originalEvent.dataTransfer == "undefined"
        files = e.originalEvent.target.files;
      else
        files = e.originalEvent.dataTransfer.files;
      
      settings.drop(files)
      queuedUploader = new QueuedUploader(files)
      
      return false
  
  # attach events
  # probe for the file api
  if typeof window.FileReader == "function"
    dropBox.bind 'dragenter', EventHandlers.dragenter
    dropBox.bind 'dragover',  EventHandlers.dragenter
    dropBox.bind 'dragleave', EventHandlers.dragleave
    dropBox.bind 'drop',      EventHandlers.drop
  else
    # we have to code a workaround
    dropBox.css 'position', 'relative'
    fileInput = jQuery '<input />'
    fileInput.attr(
      id:       'files-upload',
      type:     'file',
      multiple: 'true'
    )
    
    fileInput.css(
      position: 'absolute',
      top:      '0',
      left:     '0',
      width:    '100%',
      height:   '100%',
      opacity:  '0.0'
    )
    
    dropBox.append fileInput
    dropBox.bind      'dragenter', EventHandlers.dragenter
    dropBox.bind      'dragleave', EventHandlers.dragleave
    $(fileInput).bind 'change',    EventHandlers.drop
  
  return