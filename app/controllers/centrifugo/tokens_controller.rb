class Centrifugo::TokensController < ApplicationController
  def show
    render json: { token: Centrifugo.generate_token(sub: '0') }
  end
end
