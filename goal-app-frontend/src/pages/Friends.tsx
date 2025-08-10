import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Users, Search, UserPlus, Bell } from 'lucide-react';
import { Header } from '../components/common/Header';
import { FriendsList } from '../components/friends/FriendsList';
import { FriendRequests } from '../components/friends/FriendRequests';
import { SearchFriends } from '../components/friends/SearchFriends';
import { MotionCard } from '../components/common/MotionCard';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import { friendService } from '../services/friendService';
import { useNavigate } from 'react-router-dom';

export const Friends: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user]);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      // Load friends and requests data here
      const friendsData = await friendService.getFriends(user!.id);
      const requestsData = await friendService.getPendingRequests(user!.id);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

   // ✅ Add handler functions
  const handleChallengeFriend = (friendId: number, friendUsername: string) => {
    console.log('Challenging friend:', friendId, friendUsername);
    toast.info(`Challenge sent to ${friendUsername}! 🎯`);
    // You could open a modal to select goals to challenge with
    // Or navigate to create a shared goal
  };

  const handleViewFriendProfile = (friendId: number) => {
    console.log('Viewing friend profile:', friendId);
    toast.info('Opening friend profile...');
    // Navigate to friend's profile or open profile modal
    navigate(`/profile/${friendId}`);
  };

  const tabs = [
    { id: 'friends', label: 'My Friends', icon: Users, count: friends.length },
    { id: 'requests', label: 'Requests', icon: Bell, count: pendingRequests.length },
    { id: 'search', label: 'Find Friends', icon: Search },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Users className="mr-3" />
            Friends & Community
          </h1>
          <p className="text-white/70 text-lg">
            Connect with friends and achieve goals together
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <MotionCard className="p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </MotionCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'friends' && <FriendsList friends={friends} />}
          {activeTab === 'requests' && <FriendRequests requests={pendingRequests} onUpdate={loadFriendsData} />}
          {activeTab === 'search' && <SearchFriends />}
        </motion.div>
      </div>
    </div>
  );
};
