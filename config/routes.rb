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
    get 'topics/:id' => 'application#index'

    scope 'api' do
      resources :topics, only: [:create, :index, :show] do
        resources :comments, only: [:create, :index]
      end

      namespace :centrifugo do
        resource :token, only: [:show]
      end
    end
  end
end
