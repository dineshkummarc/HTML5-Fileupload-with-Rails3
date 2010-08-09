jQuery.fn.upload5 = (settings) ->
  settings = settings or {}
  defaultSettings =
    overClass : 'drag-over'
    debug     : true
  
  settings = jQuery.extend defaultSettings, settings
  dropBox = jQuery this
  console.log dropBox
  
  # define event handlers
  handlers =
    dragenter: (e) -> 
      e.stopPropagation()
      e.preventDefault()
      
      unless dropBox.hasClass settings.overClass
        dropBox.addClass settings.overClass
      
      return false
    
    dragleave: (e) ->
      e.stopPropagation()
      e.preventDefault()
      
      if dropBox.hasClass settings.overClass
        dropBox.removeClass settings.overClass
      
      return false
    
    drop: (e) ->
      e.stopPropagation()
      e.preventDefault()
    
      return false
  
  # attach events
  # probe for the file api
  if typeof window.FileReader == "function"
    dropBox.bind 'dragenter', handlers.dragenter
    dropBox.bind 'dragover',  handlers.dragenter
    dropBox.bind 'dragleave', handlers.dragleave
    dropBox.bind 'drop',      handlers.drop
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
    dropBox.bind      'dragenter', handlers.dragenter
    dropBox.bind      'dragleave', handlers.dragleave
    $(fileInput).bind 'change',    handlers.drop
  
  this