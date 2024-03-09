module Centrifugo
  API_ENDPOINT = 'http://centrifugo:8000'
  CONFIG = JSON.load_file('centrifugo/config.json')
  API_KEY = CONFIG['api_key']
  JWT_SECRET = CONFIG['token_hmac_secret_key']

  def self.publish(channel:, data:)
    RestClient.post(
      API_ENDPOINT + '/api/publish',
      JSON.unparse({ channel:, data: }),
      { 'X-API-Key': API_KEY }
    )
  end

  def self.generate_token(sub:)
    JWT.encode({ sub: sub.to_s }, JWT_SECRET)
  end
end
