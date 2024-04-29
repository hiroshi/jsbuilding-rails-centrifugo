class Room::UsersController < ApplicationController
  before_action :authenticate_user!

  def create
    user = User.find_or_create_by!(email: params[:email])
    user.rooms.where(id: params[:room_id]).exists? || user.rooms << Room.find(params[:room_id])

    head :created
  end
end
