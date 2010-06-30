set :application, "html5fileupload"
set :domain,      "html5fileupload.9elements.com"
set :user,        "html5fileupload"
set :repository,  "git://github.com/9elements/HTML5-Fileupload-with-Rails3.git"
set :rails_env,   "development" unless exists?(:rails_env)
set :branch,      "master" unless exists?(:branch)
set :deploy_to,   "/home/#{user}/#{rails_env}"

set :use_sudo,    false

ssh_options[:forward_agent] = true
set :scm, :git
set :deploy_via, :remote_cache
set :git_enable_submodules, 1

role :app, domain
role :web, domain
role :db,  domain, :primary => true

namespace :deploy do
  task(:start,   :roles => :app) {}
  task(:stop,    :roles => :app) {}
  task(:restart, :roles => :app, :except => { :no_release => true }) {
    run "touch #{File.join(current_path,'tmp','restart.txt')}"
  }
end

namespace :bundler do
  task :create_symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(current_release, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end
  
  task :bundle_new_release, :roles => :app do
    bundler.create_symlink
    run "cd #{release_path} && bundle install --without test"
  end
  
  task :lock, :roles => :app do
    run "cd #{current_release} && bundle lock;"
  end
  
  task :unlock, :roles => :app do
    run "cd #{current_release} && bundle unlock;"
  end
end

after "deploy:update_code" do
  bundler.bundle_new_release
end
