HTML5 Drag and Drop Fileupload example with Rails 3 
===================================================

This is just a proove of concept app. It creates a rack endpoint:

    app/controllers/upload_endpoint.rb

which accepts the file uploads. The javascript makes use of the <code>FileReader</code> if available.
For Chrome and Safari a hidden <code><input type="file"></code> will be created.

PS
==

The code is very very hacky...

TODO
====

* Make it jQuery agnostic
* find out why sendAsBinary does not work with PUT method
* Improve Rails code and add authentication (help is needed here, any rackstars around?)

Credits
=======

http://www.thecssninja.com/ for pointing out how it works Chrome and great explainations of the FileReader API.

Copyright (c) 2010 9elements, released under the MIT license.