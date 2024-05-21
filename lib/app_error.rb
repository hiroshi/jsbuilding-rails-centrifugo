class AppError < Exception
  attr_reader :status

  def initialize(msg, status:)
    super(msg)
    @status = status
  end
end

