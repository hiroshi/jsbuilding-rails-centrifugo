class TopicsController < ApplicationController
  before_action :authenticate_user!

  def create
    topic_params = params.require(:topic).permit(:message).merge(user: current_user)
    topic = Topic.create!(topic_params)
    Centrifugo.publish(channel: 'topics', data: topic.as_json(as_json_options.merge(root: true)))
    head :created
  end

  def index
    render json: Topic.limit(params[:limit].presence || 5).order(_id: :desc).as_json(as_json_options)
  end

  def show
    render json: Topic.find(params[:id]).as_json(as_json_options)
  end

  private

  def as_json_options
    { include: { user: User.as_json_options } }
  end
end
