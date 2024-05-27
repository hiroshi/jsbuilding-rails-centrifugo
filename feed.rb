require 'open-uri'
require 'nokogiri'
require 'rest-client'
require 'json'

room_id = '664f28906e375a00017b3f6c'

URI.open('https://status.cloud.google.com/feed.atom') do |f|
  doc = Nokogiri::XML(f).remove_namespaces!
  doc.xpath('//entry').each do |entry|
    link = entry.at_xpath('link')['href']
    title = entry.at_xpath('title').text
    p [link, entry.at_xpath('title').text]

    res = RestClient.get("http://app:3003/api/rooms/#{room_id}/topics?link=#{link}", { Authorization: "Bearer #{ENV['TOPICS_TOKEN']}" })
    topic = JSON.parse(res.body).first
    if topic
      comment = { message: title }
      p RestClient.post("http://app:3003/api/rooms/#{room_id}/topics/#{topic['_id']}/comments", { comment: }.to_json, { Authorization: "Bearer #{ENV['TOPICS_TOKEN']}", content_type: :json })
      puts "topic(#{topic['_id']}, #{topic['message']}) new comment(#{comment})"
    else
      topic = { message: title, link: }
      p RestClient.post("http://app:3003/api/rooms/#{room_id}/topics", { topic: }.to_json, { Authorization: "Bearer #{ENV['TOPICS_TOKEN']}", content_type: :json })
      puts "new topic(#{topic['message']})"
    end
  end
end
