class User
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  has_and_belongs_to_many :rooms, inverse_of: nil

  field :provider, type: String
  field :uid, type: String
  field :email, type: String
  field :name, type: String
  field :image_url, type: String

  def self.from_omniauth(auth)
    find_or_create_by(provider: auth.provider, uid: auth.uid) do |user|
      user.email = auth.info.email
      user.name = auth.info.name
      user.image_url = auth.info.image
    end
  end

  # def self.as_json_options
  #   { only: [:email, :name, :image_url] }
  # end

  def as_json(options={})
    super(options.merge(only: [:_id, :email, :name, :image_url]))
  end
end
