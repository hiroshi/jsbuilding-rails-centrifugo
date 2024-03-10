class CommentsController < ApplicationController
  before_action do
    @topic = Topic.find(params[:topic_id])
  end

  def create
    comment = @topic.comments.create!(params.require(:comment).permit(:message))
    Centrifugo.publish(channel: "topics/#{@topic._id}", data: comment.as_json(root: true))
    head :created
  end

  def index
    comments = @topic.comments
    render json: comments.as_json
  end
end
