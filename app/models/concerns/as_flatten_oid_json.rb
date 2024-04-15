module AsFlattenOidJson
  # NOTE: don't use concern and included because as_json must be overridden not overwritten.
  # extend ActiveSupport::Concern

  def flatten_oid(json)
    case json
    when Hash
      json.map{|k, v| [k, v.is_a?(Hash) && v&.[]('$oid') || flatten_oid(v)]}.to_h
    when Array
      json.map{|e| flatten_oid(e) }
    else
      json
    end
  end

  def as_json(options={})
   flatten_oid(super)
  end
end
