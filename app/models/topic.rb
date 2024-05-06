class Topic
  include Mongoid::Document
  include Mongoid::Timestamps
  include AsFlattenOidJson

  belongs_to :user
  belongs_to :room
  has_many :comments

  field :message, type: String

  def as_json(options={})
    super(options.merge(include: ([options[:include]].flatten.compact) + ['user'])).tap do |result|
      (options[:root] ? result['topic'] : result)['comments_count'] = comments.count
    end
  end
end
