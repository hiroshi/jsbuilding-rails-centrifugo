require 'rails_helper'

describe Topic do
  describe '#as_json' do
    let(:topic) { Topic.create!(message: 'Topic B', room: Room.create!(name: 'Room A'), user: User.create!(email: 'a@b.com')) }

    it { expect(topic.as_json).to include('user' => hash_including('email' => 'a@b.com')) }

    describe 'include: :room' do
      it { expect(topic.as_json(include: :room)).to include('room' => hash_including('name' => 'Room A')) }
    end
  end
end
