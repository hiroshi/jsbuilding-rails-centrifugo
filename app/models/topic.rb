class Topic
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  has_many :comments

  field :message, type: String

  def as_json(options={})
    super.merge(comments_count: comments.count)
  end
end
