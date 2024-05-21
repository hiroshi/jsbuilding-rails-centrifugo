class ApplicationController < ActionController::Base
  include SessionHelper

  rescue_from AppError do |exception|
    render plain: exception, status: exception.status
  end

  def index
  end
end
