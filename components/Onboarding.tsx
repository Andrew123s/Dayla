import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../lib/api';
import { Layout, Compass, MessageCircle, User as UserIcon, Plus, Heart, MapPin, X, ChevronRight, CheckCircle } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Dayla!",
      subtitle: "Your adventure planning companion",
      description: "Plan, explore, and connect with fellow outdoor enthusiasts in one beautiful app.",
      icon: <Layout size={80} className="text-[#a3b18a]" />,
      color: "from-[#3a5a40] to-[#588157]"
    },
    {
      title: "Plan Your Adventures",
      subtitle: "Visual planning made easy",
      description: "Drag and drop notes, add photos, record voice memos, and create your perfect trip itinerary.",
      icon: <Plus size={80} className="text-[#a3b18a]" />,
      color: "from-[#588157] to-[#a3b18a]",
      features: [
        "Sticky notes for ideas",
        "Photo uploads from your trips",
        "Voice recordings",
        "Budget tracking"
      ]
    },
    {
      title: "Discover New Trails",
      subtitle: "Connect with the community",
      description: "See posts from fellow explorers, save locations, and get inspired for your next adventure.",
      icon: <Compass size={80} className="text-[#a3b18a]" />,
      color: "from-[#a3b18a] to-[#d4a373]",
      features: [
        "Community posts",
        "Location saving",
        "Trail inspiration",
        "Eco-friendly tips"
    ]
    },
    {
      title: "Chat & Collaborate",
      subtitle: "Plan together with friends",
      description: "Invite friends to chat, share trip details, and collaborate on adventure planning.",
      icon: <MessageCircle size={80} className="text-[#a3b18a]" />,
      color: "from-[#d4a373] to-[#faedcd]",
      features: [
        "Group chats",
        "Photo sharing",
        "Voice messages",
        "Location pins"
      ]
    },
    {
      title: "Your Profile",
      subtitle: "Track your outdoor journey",
      description: "Manage your trips, view your eco-impact, and showcase your favorite outdoor activities.",
      icon: <UserIcon size={80} className="text-[#a3b18a]" />,
      color: "from-[#faedcd] to-[#fefae0]",
      features: [
        "Trip history",
        "Eco-score tracking",
        "Achievement badges",
        "Personal preferences"
      ]
    }
  ];

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Call backend to mark onboarding as complete
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/complete-onboarding`, {
          method: 'POST',
          credentials: 'include', // Use cookie-based auth
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          // Also mark in localStorage for quick access
          localStorage.setItem('dayla_onboarding_complete', 'true');
          onComplete();
        } else {
          console.error('Failed to complete onboarding:', data.message);
          // Still complete locally if API fails
          localStorage.setItem('dayla_onboarding_complete', 'true');
          onComplete();
        }
      } catch (error) {
        console.error('Onboarding completion error:', error);
        // Complete locally if API fails
        localStorage.setItem('dayla_onboarding_complete', 'true');
        onComplete();
      }
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('dayla_onboarding_complete', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#f7f3ee] flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3a5a40] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#3a5a40]">Dayla</h1>
            <p className="text-xs text-stone-500">Welcome, {user.name.split(' ')[0]}!</p>
          </div>
        </div>
        {currentStep < steps.length - 1 && (
          <button
            onClick={skipOnboarding}
            className="text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div
            className="bg-[#3a5a40] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-[#3a5a40]' : 'bg-stone-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
        <div className={`w-full max-w-sm p-8 rounded-[3rem] bg-gradient-to-br ${currentStepData.color} shadow-2xl mb-8 transform transition-all duration-500`}>
          <div className="flex justify-center mb-6">
            {currentStepData.icon}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{currentStepData.title}</h2>
          <p className="text-lg font-medium text-white/90 mb-4">{currentStepData.subtitle}</p>
          <p className="text-white/80 leading-relaxed">{currentStepData.description}</p>
        </div>

        {/* Features List */}
        {currentStepData.features && (
          <div className="w-full max-w-sm space-y-3 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-stone-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6">
        <button
          onClick={nextStep}
          className="w-full bg-[#3a5a40] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#588157] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <CheckCircle size={24} />
              Get Started
            </>
          ) : (
            <>
              Continue
              <ChevronRight size={24} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;