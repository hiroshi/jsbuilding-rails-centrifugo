require 'open-uri'
require 'nokogiri'
require 'rest-client'
require 'json'

room_id = '664f28906e375a00017b3f6c'

def api_get(path)
  res = RestClient.get(
    "http://app:3003#{path}",
    { Authorization: "Bearer #{ENV['TOPICS_TOKEN']}" }
  )
  JSON.parse(res.body)
end

def api_post(path, payload)
  res = RestClient.post(
    "http://app:3003#{path}",
    payload.to_json,
    { Authorization: "Bearer #{ENV['TOPICS_TOKEN']}", content_type: :json }
  )
  # p res
  # JSON.parse(res.body)
  res.body
end

URI.open('https://status.cloud.google.com/feed.atom') do |f|
  doc = Nokogiri::XML(f).remove_namespaces!
  doc.xpath('//entry').each do |entry|
    link = entry.at_xpath('link')['href']
    title = entry.at_xpath('title').text
    entry_id = entry.at_xpath('id').text
    p [link, entry.at_xpath('title').text]

    topic = api_get("/api/rooms/#{room_id}/topics?link=#{link}").first
    if topic
      if topic.dig('feed', 'entry_id') != entry_id
        comment = api_get("/api/rooms/#{room_id}/topics/#{topic['_id']}/comments?entry_id=#{entry_id}").first
        unless comment
          comment = { message: title, feed: { link:, entry_id: } }
          p api_post("/api/rooms/#{room_id}/topics/#{topic['_id']}/comments", { comment: })
          puts "topic(#{topic}) new comment(#{comment})"
        end
      end
    else
      topic = { message: title, feed: { link:, entry_id: } }
      p api_post("/api/rooms/#{room_id}/topics", { topic: })
      puts "new topic(#{topic})"
    end
  end
end
