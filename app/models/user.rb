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

  def geneate_token
    JWT.encode({ sub: id.to_s }, Rails.application.credentials.secret_key_base)
  end

  def self.authorize(token:)
    user_id = JWT.decode(token, Rails.application.credentials.secret_key_base).dig(0, 'sub')
    User.find(user_id) if user_id
  end
end
