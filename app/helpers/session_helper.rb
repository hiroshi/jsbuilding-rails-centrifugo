module SessionHelper
  def user_signed_in?
    !!current_user
  end

  def current_user
    session[:user_id] && (@current_user ||= User.find(session[:user_id]))
  end

  def authenticate_user!
    raise AppError.new('Not authenticated', status: :forbidden) unless current_user
  end
end
