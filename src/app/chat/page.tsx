'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { sendMessage, createConversation as createConversationAction, updateTypingStatus } from '../actions';
import { collection, onSnapshot, query, where, orderBy, doc } from "firebase/firestore";
import { db, rtdb } from '@/lib/firebase';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface Conversation {
  id: number;
  name: string;
  createdAt: string;
  creatorId: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
  authorClerkId: string;
}

interface TypingUser {
  name: string;
}

interface Presence {
    [key: string]: {
        online: boolean;
        lastActive: any;
    };
}

const ChatPage = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [createConversationError, setCreateConversationError] = useState<string | null>(null);

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [presence, setPresence] = useState<Presence>({});
  const [tipping, setTipping] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userStatusRef = ref(rtdb, `status/${user.id}`);

    const connect = () => {
        const isOnlineForDatabase = {
            online: true,
            lastActive: serverTimestamp(),
        };

        set(userStatusRef, isOnlineForDatabase);

        onDisconnect(userStatusRef).set({ online: false, lastActive: serverTimestamp() });
    };

    connect();
  }, [user]);

  useEffect(() => {
    if (selectedConversation === null) return;

    setMessagesLoading(true);
    const messagesQuery = query(
      collection(db, "messages"),
      where("conversationId", "==", selectedConversation),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const newMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(newMessages);
      setMessagesLoading(false);
    }, (err) => {
      console.error(err);
      setMessagesError('Failed to subscribe to messages');
      setMessagesLoading(false);
    });

    const typingDocRef = doc(db, 'typing', selectedConversation.toString());
    const unsubscribeTyping = onSnapshot(typingDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const typing = Object.values(data).map((user: any) => ({ name: user.name }));
        setTypingUsers(typing);
      } else {
        setTypingUsers([]);
      }
    });
    
    const presenceRef = ref(rtdb, 'status');
    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
        const data = snapshot.val();
        setPresence(data || {});
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribePresence();
    };
  }, [selectedConversation]);

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || !user) return;

    startTransition(async () => {
      try {
        await sendMessage(selectedConversation, newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    });
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversationName.trim()) return;

    startTransition(async () => {
      try {
        await createConversationAction(newConversationName);
        setNewConversationName('');
        setShowCreateConversation(false);
        fetchConversations();
      } catch (error) {
        setCreateConversationError('Failed to create conversation');
      }
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!selectedConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(selectedConversation, true);

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(selectedConversation, false);
    }, 3000);
  }

  const handleTip = async (recipientId: string) => {
    setTipping(true);
    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error tipping user:', error);
    } finally {
      setTipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex flex-1">
        <aside className="w-1/4 bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          <button 
            onClick={() => setShowCreateConversation(!showCreateConversation)}
            className="w-full p-2 mb-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Conversation
          </button>
          {showCreateConversation && (
            <form onSubmit={handleCreateConversation} className="mb-4">
              <input
                type="text"
                placeholder="Conversation name"
                value={newConversationName}
                onChange={(e) => setNewConversationName(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {createConversationError && <p className="text-red-500 text-sm mt-1">{createConversationError}</p>}
            </form>
          )}
          {loading && <p>Loading conversations...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="space-y-2">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`p-2 rounded-lg cursor-pointer ${selectedConversation === convo.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                onClick={() => handleConversationSelect(convo.id)}
              >
                <div className="flex items-center">
                    <p className="font-semibold">{convo.name}</p>
                    <span className={`ml-2 w-3 h-3 rounded-full ${presence[convo.creatorId] && presence[convo.creatorId].online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </div>
                <p className="text-sm text-gray-400">{new Date(convo.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 flex flex-col">
          <div className="flex-1 mb-4 space-y-4 overflow-y-auto">
            {messagesLoading && <p>Loading messages...</p>}
            {messagesError && <p className="text-red-500">{messagesError}</p>}
            {messages.map((message) => (
                <div key={message.id} className={`flex items-start ${message.authorEmail === user?.primaryEmailAddress?.emailAddress ? 'justify-end' : ''}`}>
                    <div className={`${message.authorEmail === user?.primaryEmailAddress?.emailAddress ? 'bg-blue-600' : 'bg-gray-700'} p-3 rounded-lg flex items-center`}>
                        <div>
                            <div className="flex items-center">
                                <p className="font-semibold mr-2">{message.authorName}</p>
                                <span className={`w-2 h-2 rounded-full ${presence[message.authorClerkId] && presence[message.authorClerkId].online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </div>
                            <p>{message.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}</p>
                        </div>
                        {message.authorEmail !== user?.primaryEmailAddress?.emailAddress && (
                            <button onClick={() => handleTip(message.authorClerkId)} className="ml-4 p-1 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors" disabled={tipping}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 3.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM10 6.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM10 9.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" />
                                    <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm10 14H5V4h10v12z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            </div>

          <div className="h-6">
            {tipping && <p className="text-yellow-500">Processing tip...</p>}
            {typingUsers.length > 0 && (
              <p className="text-gray-400 text-sm italic">
                {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </p>
            )}
          </div>
          <div className="mt-auto">
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                className="w-full p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={isPending || selectedConversation === null}
              />
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
