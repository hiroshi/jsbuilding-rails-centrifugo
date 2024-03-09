class TopicsController < ApplicationController
  def create
    topic = Topic.create!(params.require(:topic).permit(:message))
    Centrifugo.publish(channel: 'topics', data: topic.as_json(root: true))
    head :created
  end
end
