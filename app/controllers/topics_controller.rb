class TopicsController < ApplicationController
  def create
    p params
    head :created
  end
end
