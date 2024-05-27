class Comment
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  belongs_to :topic

  field :message, type: String
  embeds_one :feed

  def as_json(options={})
    super(options.merge(include: [:user]))
  end
end
