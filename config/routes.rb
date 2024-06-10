Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  scope format: false do
    # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
    # Can be used by load balancers and uptime monitors to verify that the app is live.
    get 'up' => 'rails/health#show', as: :rails_health_check

    get 'auth/:provider/callback', to: 'sessions#create'

    # Defines the root path route ("/")
    root 'application#index'
    get '/rooms/:id' => 'application#index'
    get '/rooms/:room_id/topics/:id' => 'application#index'

    scope 'api' do
      resources :rooms, only: [:create, :index, :show] do
        resources :topics, only: [:create, :index, :show] do
          resources :comments, only: [:create, :index]
        end
        scope module: 'room' do
          resources :users, only: [:create]
        end
      end

      resources :webpush_subscriptions, only: [:create]

      scope 'centrifugo' do
        #   resource :token, only: [:show]
        get 'token' => 'centrifugo#token'
        post 'subscribe' => 'centrifugo#subscribe'
      end
    end
  end
end
