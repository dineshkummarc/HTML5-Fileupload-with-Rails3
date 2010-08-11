sys = require 'sys'
fs = require 'fs'
exec = require('child_process').exec
spawn = require('child_process').spawn

option '-l', '--level [LEVEL]', 'Specifies closure compiler’s compliation level (whitespace, simple, advanced)'

LEVELS =
  whitespace: 'WHITESPACE_ONLY'
  simple: 'SIMPLE_OPTIMIZATIONS'
  advanced: 'ADVANCED_OPTIMIZATIONS'

task 'js:compile', 'compile javascript using google’s closure compiler', (options) ->
  level = LEVELS[options.level || 'simple']
  
  inputFile = 'public/javascripts/upload5.js'
  outputFile = 'public/javascripts/upload5.min.js'
  
  clojure = exec "java -jar dist/compiler.jar --compilation_level #{level} --js #{inputFile} --js_output_file #{outputFile}", (error, stdout, stderr) ->
    puts stderr, stdout

task 'watch', 'watches and compiles coffee', ->
  coffee = spawn 'coffee', ['-cwl', 'app/coffeescripts/upload5.coffee']
  
  [coffee].forEach (child) ->
    child.stdout.on 'data', (data) -> sys.print data
    child.stderr.on 'data', (data) -> sys.print data