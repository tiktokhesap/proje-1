import React from 'react';
import { Check } from 'lucide-react';

const ProfileCard = ({ userData }) => {
  if (!userData) return null;

  return (
    <div className="bg-[#1a1a1c] border border-gray-700 rounded-2xl p-8 mb-8">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img
            src={userData.avatar || 'https://i.pravatar.cc/150?img=12'}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-cyan-400"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white text-2xl font-bold">{userData.nickname || userData.username}</h2>
            {userData.verified && (
              <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                <Check className="w-4 h-4 text-black" strokeWidth={3} />
              </div>
            )}
          </div>
          <p className="text-cyan-400 text-lg">@{userData.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-white text-2xl font-bold">{userData.followers}</div>
          <div className="text-gray-400 text-sm">Followers</div>
        </div>
        <div>
          <div className="text-white text-2xl font-bold">{userData.following}</div>
          <div className="text-gray-400 text-sm">Following</div>
        </div>
        <div>
          <div className="text-white text-2xl font-bold">{userData.likes}</div>
          <div className="text-gray-400 text-sm">Likes</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;