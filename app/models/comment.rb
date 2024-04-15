class Comment
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  belongs_to :topic

  field :message, type: String

  def as_json(options={})
    super(options.merge(include: [:user]))
  end
end
