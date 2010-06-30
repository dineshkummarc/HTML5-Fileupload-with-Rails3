Html5fileupload::Application.routes.draw do |map|
#  match "/upload/:id" => proc {|env| [200, {}, ["Hello world"]] }
  match "/upload/:id" => UploadEndpoint  
  root :to => 'frontend#index'
end
