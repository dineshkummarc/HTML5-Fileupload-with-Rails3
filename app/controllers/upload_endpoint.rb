class UploadEndpoint
  def self.call(env)
    result = [500, {}, ["internal server error"]] 
    url = ""
    
    token = env['REQUEST_URI'].to_s.scan(/\/upload\/([^\/]+)\//).first.first
    
    raw_filename = env['HTTP_X_FILE_NAME']
    extension = File.extname(raw_filename)
    raw_filename_wo_extension = File.basename(env['HTTP_X_FILE_NAME'], extension)
    
    url      = "/system/#{token}-#{raw_filename_wo_extension.parameterize}#{extension}"
    filename = "#{Rails.root}/public#{url}"
    
    if token == "1337"
      File.open(filename, 'w') {|f| f.write( env['rack.input'].read ) }
      result = [200, {}, ["{ \"url\" : \"#{url}\" }"]] 
    else
      result = [401, {}, ["could not authenticate you"]] 
    end
    result 
  end
end