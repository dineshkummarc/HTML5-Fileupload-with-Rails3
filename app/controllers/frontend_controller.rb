class FrontendController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:upload]
  
  def index
  end
  
  def upload
#    verify_authenticity_token unless request.xhr?
    debugger
    
    render :json => { :ok => '1' }
  end
end