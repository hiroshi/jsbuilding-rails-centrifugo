require 'rails_helper'

RSpec.describe "Users", type: :request do
  describe "POST /api/rooms/:room_id/users" do
    let!(:room) { Room.create! }

    context 'user is created by the email' do
      let(:user) { User.create!(email: 'alis@example.com', rooms: [room]) }

      before do
        post room_users_path(room), params: { email: 'bob@example.com' }, headers: { 'Authorization' => "Bearer #{user.generate_token}" }
      end

      it { expect(response).to have_http_status(:created) }

      describe 'invited user in the room' do
        subject { User.find_by(email: 'bob@example.com') }

        it { expect(User.where(id: subject, room_ids: room)).to exist }
      end
    end

    context 'current_user is not a user of the room'
    context 'the user of the email already exists'
  end
end
