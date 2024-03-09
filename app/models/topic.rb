class Topic
  include Mongoid::Document
  include Mongoid::Timestamps
  field :message, type: String

  def flatten_oid(json)
    if json.is_a?(Hash)
      json.map{|k, v| [k, v&.[]('$oid') || flatten_oid(v)]}.to_h
    else
      json
    end
  end

  def as_json(options={})
   flatten_oid(super)
  end
end
