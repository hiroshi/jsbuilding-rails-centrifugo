class RoomsController < ApplicationController
  before_action :authenticate_user!

  def create
    room_params = params.require(:room).permit(:name)
    room = Room.create!(room_params)
    current_user.rooms << room
    # Centrifugo.publish(channel: 'rooms', data: room.as_json(as_json_options.merge(root: true)))
    head :created
  end

  def index
    render json: current_user.rooms
  end

  def show
    room = current_user.rooms.find(params[:id])
    render json: room
  end
end
