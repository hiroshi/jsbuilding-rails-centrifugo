module SessionHelper
  def user_signed_in?
    !!current_user
  end

  def current_user
    @current_user ||= session[:user_id] && User.find(session[:user_id])
    @current_user ||= User.authorize(token: request.authorization&.sub(/bearer\s+/i, '')).tap do |user|
      @api_request = user.present?
    end
  end

  def authenticate_user!
    raise AppError.new('Not authenticated', status: :forbidden) unless current_user
  end

  def api_request?
   current_user &&  @api_request
  end
end
