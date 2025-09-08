'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, onSnapshot, orderBy, serverTimestamp, set, ref, onDisconnect } from 'firebase/firestore';
import { db, rtdb } from '@/lib/firebase';
import { sendMessage, createConversation as createConversationAction, updateTypingStatus, addReaction, updateMessage, deleteMessage } from '@/app/actions';
import { format } from 'date-fns';
import { MdSend, MdAdd, MdMoreVert, MdCheck, MdDelete } from 'react-icons/md';
import { FaSmile } from 'react-icons/fa';

interface Message {
  id: string;
  content: string;
  createdAt: any;
  authorName: string;
  authorEmail: string;
  authorClerkId: string;
}

interface Conversation {
  id: number;
  name: string;
  createdAt: string;
}

interface TypingStatus {
  [clerkId: string]: {
    name: string;
    timestamp: any;
  };
}

interface Reactions {
  [emoji: string]: {
    count: number;
    users: { [clerkId: string]: string };
  };
}

const ChatPage = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [createConversationError, setCreateConversationError] = useState<string | null>(null);
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({});
  const [reactions, setReactions] = useState<{ [messageId: string]: Reactions }>({});
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [presence, setPresence] = useState<any>({});

  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    } catch (err: any) {
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
    if (!selectedConversation) return;

    const q = query(collection(db, "messages"), where("conversationId", "==", selectedConversation), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    const typingRef = ref(rtdb, `typing/${selectedConversation}`);
    const unsubscribeTyping = onSnapshot(query(collection(db, 'typing'), where('conversationId', '==', selectedConversation)), (snapshot) => {
        const statuses: TypingStatus = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // Filter out the current user
            if (data.clerkId !== user?.id) {
                statuses[data.clerkId] = { name: data.name, timestamp: data.timestamp };
            }
        });
        setTypingStatus(statuses);
    });

    const reactionsRef = collection(db, "reactions");
    const unsubscribeReactions = onSnapshot(reactionsRef, (snapshot) => {
      const newReactions: { [messageId: string]: Reactions } = {};
      snapshot.forEach((doc) => {
        newReactions[doc.id] = doc.data() as Reactions;
      });
      setReactions(newReactions);
    });

    const presenceRef = ref(rtdb, 'status');
    const unsubscribePresence = onSnapshot(query(collection(db, 'status')), (snapshot) => {
        const presenceData: any = {};
        snapshot.forEach(doc => {
            presenceData[doc.id] = doc.data();
        });
        setPresence(presenceData);
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
      unsubscribeReactions();
      unsubscribePresence();
    };
  }, [selectedConversation, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConversationSelect = (id: number) => {
    setSelectedConversation(id);
    setError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

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
  };

  const handleReaction = (messageId: string, emoji: string) => {
    startTransition(async () => {
      await addReaction(messageId, emoji);
    });
  };

  const handleUpdateMessage = (messageId: string) => {
    startTransition(async () => {
      await updateMessage(messageId, editedContent);
      setEditingMessage(null);
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    startTransition(async () => {
      await deleteMessage(messageId);
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Conversations</h2>
          <button onClick={() => setShowCreateConversation(!showCreateConversation)} className="p-2 rounded-full hover:bg-gray-700">
            <MdAdd />
          </button>
        </div>
        {showCreateConversation && (
          <form onSubmit={handleCreateConversation} className="mb-4">
            <input
              type="text"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
              placeholder="New conversation name"
              className="w-full p-2 rounded-lg bg-gray-700 focus:outline-none"
            />
            <button type="submit" className="w-full mt-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </button>
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
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <header className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-xl font-bold">{conversations.find(c => c.id === selectedConversation)?.name}</h2>
              <div className="flex items-center space-x-2">
                {Object.entries(typingStatus).map(([id, status]) => (
                  <p key={id} className="text-sm text-gray-400">{status.name} is typing...</p>
                ))}
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.authorClerkId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg p-3 rounded-lg ${message.authorClerkId === user.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
                      <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold">{message.authorName}</p>
                          <p className="text-xs text-gray-400 ml-2">{message.createdAt && format(message.createdAt.toDate(), 'p')}</p>
                      </div>
                      {editingMessage === message.id ? (
                        <>
                          <input 
                            type="text" 
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="bg-gray-600 p-1 rounded"
                          />
                          <button onClick={() => handleUpdateMessage(message.id)}><MdCheck /></button>
                        </>
                      ) : (
                        <p>{message.content}</p>
                      )}
                       <div className="flex items-center mt-1">
                        {Object.entries(reactions[message.id] || {}).map(([emoji, data]) => (
                            <div key={emoji} className="flex items-center mr-2 bg-gray-600 rounded-full px-2 py-1">
                                <span>{emoji}</span>
                                <span className="text-xs ml-1">{data.count}</span>
                            </div>
                        ))}
                      </div>
                      {message.authorClerkId === user.id && (
                        <div className="relative group">
                          <button className="absolute -top-4 right-0 p-1 rounded-full bg-gray-600 opacity-0 group-hover:opacity-100"><MdMoreVert /></button>
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                              <a href="#" onClick={() => { setEditingMessage(message.id); setEditedContent(message.content);}} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Edit</a>
                              <a href="#" onClick={() => handleDeleteMessage(message.id)} className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Delete</a>
                          </div>
                        </div>
                      )}
                      <button onClick={() => handleReaction(message.id, '👍')}><FaSmile /></button>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <footer className="bg-gray-800 p-4 border-t border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-lg bg-gray-700 focus:outline-none"
                />
                <button type="submit" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 ml-2" disabled={isPending}>
                  <MdSend />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
