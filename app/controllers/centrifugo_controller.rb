class CentrifugoController < ApplicationController
  skip_forgery_protection only: [:subscribe]

  def token
    render json: { token: Centrifugo.generate_token(sub: current_user._id) }
  end

  # https://centrifugal.dev/docs/server/proxy#subscribe-proxy
  # app-1         |   Parameters: {"client"=>"739f8478-68ba-4658-a375-b153991ff17a", "transport"=>"websocket", "protocol"=>"json", "encoding"=>"json", "user"=>"660d2566aed31d0001ff12b4", "channel"=>"rooms", "centrifugo"=>{"client"=>"739f8478-68ba-4658-a375-b153991ff17a", "transport"=>"websocket", "protocol"=>"json", "encoding"=>"json", "user"=>"660d2566aed31d0001ff12b4", "channel"=>"rooms"}}
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
