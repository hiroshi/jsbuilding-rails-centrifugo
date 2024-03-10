class Topic
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  field :message, type: String
  has_many :comments
end
