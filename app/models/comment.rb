class Comment
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  belongs_to :topic

  field :message, type: String
end
