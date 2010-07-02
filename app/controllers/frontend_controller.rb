class FrontendController < ApplicationController
#  skip_before_filter :verify_authenticity_token, :only => [:upload]
  
  def index
  end
  
  def upload
#    verify_authenticity_token unless request.xhr?
    token = env['REQUEST_URI'].to_s.scan(/\/upload\/([^\/]+)\//).first.first

    raw_filename = env['HTTP_X_FILE_NAME']
    extension = File.extname(raw_filename)
    raw_filename_wo_extension = File.basename(env['HTTP_X_FILE_NAME'], extension)

    url      = "/system/#{token}-#{raw_filename_wo_extension.parameterize}#{extension}"
    filename = "#{Rails.root}/public#{url}"

    if token == "1337"
      File.open(filename, 'w') {|f| f.write( env['rack.input'].read ) }
      render :json => { :ok => '1', :url => url }
    else
      render :json => { :ok => '0', :message => 'could not authenticate you' }
    end    
  end
end