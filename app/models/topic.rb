class Topic
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  has_many :comments

  field :message, type: String
end
