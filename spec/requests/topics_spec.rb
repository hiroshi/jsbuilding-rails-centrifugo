require 'rails_helper'

RSpec.describe 'Topics', type: :request do
  describe 'GET /api/rooms/:room_id/topics?link=https://example.com/' do
    let(:room) { Room.create! }
    let(:user) { User.create!(rooms: [room]) }
    let(:link) { 'https://example.com/' }
    let!(:topic) { room.topics.create!(user:, message: 'hoge', feed: { link:, entry_id: '0' }) }
    let!(:other_topic) { room.topics.create!(user:, message: 'fuga') }

    before do
      get room_topics_path(room, link:), headers: auth_headers(user:)
    end

    describe 'response json' do
      subject { response.parsed_body }

      describe 'number of items' do
        it { expect(subject.count).to eq(1) }
      end

      describe 'the link of the item' do
        it { expect(subject.dig(0, 'feed', 'link')).to eq(link) }
      end
    end
  end
end
