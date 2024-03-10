class TopicsController < ApplicationController
  def create
    topic = Topic.create!(params.require(:topic).permit(:message))
    Centrifugo.publish(channel: 'topics', data: topic.as_json(root: true))
    head :created
  end

  def index
    render json: Topic.limit(params[:limit].presence || 5).order(_id: :desc).as_json
  end

  def show
    render json: Topic.find(params[:id]).as_json
  end
end
