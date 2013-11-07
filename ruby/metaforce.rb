#!/usr/bin/ruby
require "metaforce"

module Metaforce
  class Configuration
    def host
      @host ||= 'test.salesforce.com'
    end
  end
end

client = Metaforce.new :username => 'scoll@v4s1.fr',
  :password => 'Creditor13!$',
  :host => true

=begin
manifest = Metaforce::Manifest.new(:custom_label => ['*'],:translations => ['*'],:email_template => ['*'])
client.retrieve_unpackaged(manifest)
  .extract_to('./tmp')
  .perform
=end

manifest = Metaforce::Manifest.new(:Email_Template => ['*'])
client.retrieve_unpackaged(manifest)
  .extract_to('./tmp')
  .perform