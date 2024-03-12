class CommentsController < ApplicationController
  before_action :authenticate_user!

  before_action do
    @topic = Topic.find(params[:topic_id])
  end

  def create
    comment_params = params.require(:comment).permit(:message).merge(user: current_user)
    comment = @topic.comments.create!(comment_params)
    Centrifugo.publish(channel: "topics/#{@topic._id}", data: comment.as_json(root: true))
    head :created
  end

  def index
    comments = @topic.comments
    render json: comments.as_json
  end
end
