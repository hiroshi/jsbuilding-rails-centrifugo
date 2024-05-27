class TopicsController < ApplicationController
  before_action :authenticate_user!
  before_action do
    @room = Room.find(params[:room_id])
  end

  def create
    topic_params = params.require(:topic).permit(:message, feed: [:link, :entry_id]).merge(user: current_user)
    topic = @room.topics.create!(topic_params)
    Centrifugo.publish(channel: "/rooms/#{@room._id}/topics", data: topic.as_json(root: true))
    head :created
  end

  def index
    index_params = params.permit(:limit, :link)
    criteria = @room.topics
    criteria = criteria.where('feed.link': index_params[:link]) if index_params[:link].present?
    render json: criteria.limit(index_params[:limit].presence || 5).order(_id: :desc)
  end

  def show
    render json: @room.topics.find(params[:id]).as_json(include: :room)
  end

  # private

  # def as_json_options
  #   { include: { user: User.as_json_options } }
  # end
end
