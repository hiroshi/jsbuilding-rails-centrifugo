class CentrifugoController < ApplicationController
  skip_forgery_protection only: [:subscribe]

  def token
    if current_user
      render json: { token: Centrifugo.generate_token(sub: current_user&._id) }
    else
      head :forbidden
    end
  end

  # https://centrifugal.dev/docs/server/proxy#subscribe-proxy
  def subscribe
    case params[:channel]
    when %r{^/rooms/(?<room>[^/]+)}
      if User.where(_id: params[:user], room_ids: $~[:room]).exists?
        render json: {}
        return
      end
    when %r{#(?<user>.+)$}
      if params[:user] == $~[:user]
        render json: {}
        return
      end
    end
    head :forbidden
  end
end
