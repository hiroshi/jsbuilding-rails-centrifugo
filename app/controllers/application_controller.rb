class ApplicationController < ActionController::Base
  include SessionHelper

  skip_before_action :verify_authenticity_token
  before_action :verify_authenticity_token, unless: -> { api_request? }

  rescue_from AppError do |exception|
    render plain: exception, status: exception.status
  end

  def index
  end
end
