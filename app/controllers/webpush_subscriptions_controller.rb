class WebpushSubscriptionsController < ApplicationController
  before_action :authenticate_user!

  def create
    subscription_params = params.require(:subscription).permit(:endpoint)

    current_user.webpush_subscriptions.create!(subscription_params)

    head :created
  end
end
