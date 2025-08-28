import React, { useState } from 'react';

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Implement actual email subscription in later stories
      setIsSubscribed(true);
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce-slow"></div>
      </div>

      <div className="relative z-10 text-center text-white p-8 max-w-4xl mx-auto">
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-bounce-slow">
            <span className="text-4xl">🍜</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
            FoodDrop
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-2">Coming Soon</p>
          <div className="w-24 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>

        {/* Description */}
        <div className="mb-12 space-y-4">
          <p className="text-xl md:text-2xl font-medium mb-6 max-w-2xl mx-auto leading-relaxed">
            Discover amazing foods from around the world through our collection game
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🎲</div>
              <h3 className="font-semibold mb-2">Collect</h3>
              <p className="text-sm opacity-90">Discover unique foods through exciting gachapon mechanics</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold mb-2">Learn</h3>
              <p className="text-sm opacity-90">Explore rich cultural backgrounds and authentic recipes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold mb-2">Explore</h3>
              <p className="text-sm opacity-90">Journey through global food culture and traditions</p>
            </div>
          </div>
        </div>

        {/* Email Signup */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">🔔 Get notified when we launch!</h2>
          
          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
              />
              <button
                type="submit"
                className="w-full bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Notify Me When Ready! 🚀
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✨</div>
              <p className="font-semibold">Thank you!</p>
              <p className="text-sm opacity-90">We'll let you know when FoodDrop is ready!</p>
            </div>
          )}
        </div>

        {/* Coming Features Preview */}
        <div className="mt-12">
          <p className="text-sm opacity-75 mb-4">Coming Features:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '🥟 Weird & Cursed Foods',
              '🌮 Global Street Foods', 
              '🍰 Historical Desserts',
              '🐲 Mythical Foods'
            ].map((feature, index) => (
              <span
                key={index}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;