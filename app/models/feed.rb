class Feed
  include Mongoid::Document

  embedded_in :topic
  embedded_in :comment

  field :link, type: String
  field :entry_id, type: String
end
