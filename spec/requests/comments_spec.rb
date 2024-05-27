require 'rails_helper'

RSpec.describe 'Comments', type: :request do
  describe 'GET /api/rooms/:room_id/topics/:topic_id/comments' do
    let(:room) { Room.create! }
    let(:user) { User.create!(rooms: [room]) }
    let(:topic) { Topic.create!(user:, room:) }
    let!(:other_comment) { Comment.create!(user:, topic:, message: 'update 0', feed: { link: 'https://example.com/', entry_id: '0'}) }
    let!(:comment) { Comment.create!(user:, topic:, message: 'update 1', feed: { link: 'https://example.com/', entry_id: '1'}) }

    before do
      get room_topic_comments_path(room, topic, entry_id: '1'), headers: auth_headers(user:)
    end

    describe 'response json' do
      subject { response.parsed_body }

      describe 'number of items' do
        it { expect(subject.count).to eq(1) }
      end

      describe 'the link of the item' do
        it { expect(subject.dig(0, 'feed', 'entry_id')).to eq('1') }
      end
      # describe 'response comment[0].feed.entry_id' do
      #   it { expect(response.parsed_body.dig(0, 'feed', 'entry_id')).to eq('1') }
      # end
    end
  end
end
