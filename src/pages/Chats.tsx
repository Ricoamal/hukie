
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HukieHeader from '@/components/HukieHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, MoreVertical } from 'lucide-react';

// Mock chat data
const chatData = [
  {
    id: 1,
    name: 'Jessica',
    lastMessage: 'Are we still meeting tomorrow?',
    timestamp: '10:32 AM',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Michael',
    lastMessage: 'I just saw your profile!',
    timestamp: 'Yesterday',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 3,
    name: 'Sarah',
    lastMessage: 'That sounds great! I love that place.',
    timestamp: 'Yesterday',
    unread: 1,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 4,
    name: 'David',
    lastMessage: 'Hey, how are you doing?',
    timestamp: 'Monday',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 5,
    name: 'Emily',
    lastMessage: "I'm looking forward to meeting you!",
    timestamp: 'Sunday',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
  },
];

const ChatItem: React.FC<{
  chat: typeof chatData[0];
  onClick: () => void;
}> = ({ chat, onClick }) => {
  return (
    <div 
      className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={chat.avatar} 
          alt={chat.name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        {chat.unread > 0 && (
          <div className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {chat.unread}
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">{chat.name}</h3>
          <span className="text-xs text-gray-500">{chat.timestamp}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
      </div>
    </div>
  );
};

const Chats = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <HukieHeader />
      
      <main className="flex-1 pb-16">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text" 
                placeholder="Search messages..." 
                className="pl-10 bg-gray-100 border-none" 
              />
            </div>
            <Button size="icon" variant="ghost" className="text-gray-500">
              <MoreVertical size={20} />
            </Button>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Messages</h2>
          
          <div className="bg-white rounded-lg shadow-sm">
            {chatData.map(chat => (
              <ChatItem 
                key={chat.id} 
                chat={chat} 
                onClick={() => console.log(`Chat with ${chat.name}`)} 
              />
            ))}
          </div>
          
          {chatData.length === 0 && (
            <div className="text-center py-12">
              <Heart className="mx-auto mb-4 text-teal-500" size={48} />
              <h3 className="font-bold text-lg mb-2">No messages yet</h3>
              <p className="text-gray-500 mb-4">
                Start matching with people to begin conversations
              </p>
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => navigate('/')}
              >
                Find Matches
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Chats;
