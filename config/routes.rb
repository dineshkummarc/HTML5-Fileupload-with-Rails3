Html5fileupload::Application.routes.draw do |map|
#  match "/upload/:id" => proc {|env| [200, {}, ["Hello world"]] }
  match "/upload/:id" => UploadEndpoint  
#  match "/upload/:id" => 'frontend#upload'
  root :to => 'frontend#index'
end
