class Room
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  field :name, type: String

  has_many :topics

  def as_json(options={})
    super.merge('users' => User.where(room_ids: self).to_a.as_json)
  end
end
