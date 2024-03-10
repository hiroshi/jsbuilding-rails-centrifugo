module AsFlattenOidJson
  extend ActiveSupport::Concern

  included do
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

  # class_methods do
  #   ...
  # end
end
