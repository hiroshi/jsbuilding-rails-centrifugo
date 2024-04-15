Rails.application.routes.draw do
  # https://github.com/heartcombo/devise/wiki/OmniAuth:-Overview
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  scope format: false do
    # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
    # Can be used by load balancers and uptime monitors to verify that the app is live.
    get 'up' => 'rails/health#show', as: :rails_health_check

    # Defines the root path route ("/")
    root 'application#index'
    get '/rooms/:id' => 'application#index'
    get '/rooms/:room_id/topics/:id' => 'application#index'

    scope 'api' do
      resources :rooms, only: [:create, :index, :show] do
        resources :topics, only: [:create, :index, :show] do
          resources :comments, only: [:create, :index]
        end
      end
      scope 'centrifugo' do
        #   resource :token, only: [:show]
        get 'token' => 'centrifugo#token'
        post 'subscribe' => 'centrifugo#subscribe'
      end
    end
  end
end
