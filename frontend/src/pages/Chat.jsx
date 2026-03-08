import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { chatApi, authApi, normalizeApiError } from '../services/api';
import GlassCard from '../components/UI/GlassCard';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { Send, Search, MoreVertical, Phone, Video, User, Plus, ArrowLeft, Languages, Sparkles, Bot, Users, X, Check } from 'lucide-react';

const AI_CHAT_ID = 'ai-assistant';
const AI_CONTACT = {
  id: AI_CHAT_ID,
  roomId: null,
  targetUserId: AI_CHAT_ID,
  name: 'AI Assistant',
  status: 'Online',
  lastMsg: 'How can I help you?',
  time: 'Now',
  isAi: true,
};

const GROUP_CONTACT_PREFIX = 'group-';
const DIRECT_CONTACT_PREFIX = 'direct-';

const formatContactTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);
  const previousScrollHeightRef = useRef(null);
  const roomMapRef = useRef({});
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomMap, setRoomMap] = useState({});
  const [languages, setLanguages] = useState([]);
  const [chatLanguageMap, setChatLanguageMap] = useState(() => {
    try {
      const saved = window.localStorage.getItem('polychat_chat_languages');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState(AI_CHAT_ID);
  const [showSidebar, setShowSidebar] = useState(true);
  const [contacts, setContacts] = useState([AI_CONTACT]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);

  useEffect(() => {
    roomMapRef.current = roomMap;
  }, [roomMap]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.getCurrentUser();
        setCurrentUser(res.data);
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await authApi.getLanguages();
        setLanguages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch languages', err);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        const [usersRes, roomsRes] = await Promise.all([chatApi.getContacts(), chatApi.getRooms()]);
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
        const currentUserId = String(currentUser?.id ?? '');
        const currentUsername = String(currentUser?.username ?? '').toLowerCase();

        const roomContacts = rooms.map((room) => {
          if (room.room_type === 'group') {
            return {
              id: `${GROUP_CONTACT_PREFIX}${room.id}`,
              roomId: room.id,
              targetUserId: null,
              name: room.title || 'Untitled group',
              username: '',
              profilePic: '',
              status: `${room.participants?.length || 0} members`,
              lastMsg: room.last_message || 'Group chat',
              time: formatContactTime(room.last_message_at),
              isAi: false,
              isGroup: true,
              participants: room.participants || [],
            };
          }

          const participant = room.participants?.[0];
          if (!participant) return null;

          return {
            id: `${DIRECT_CONTACT_PREFIX}${participant.id}`,
            roomId: room.id,
            targetUserId: room.target_user_id || participant.id,
            name: participant.name || participant.username,
            username: participant.username || '',
            profilePic: participant.profile_pic || '',
            status: 'Available',
            lastMsg: room.last_message || 'Tap to chat',
            time: formatContactTime(room.last_message_at),
            isAi: false,
            isGroup: false,
          };
        }).filter(Boolean);

        const existingDirectIds = new Set(
          roomContacts
            .filter((contact) => !contact.isGroup)
            .map((contact) => String(contact.targetUserId))
        );

        const availableUsers = users
          .filter((user) => {
            const userId = String(user?.id ?? '');
            const username = String(user?.username ?? '').toLowerCase();
            return userId !== currentUserId && username !== currentUsername;
          })
          .map((user) => {
            const targetUserId = user?.id ?? user?.username;
            if (!targetUserId || existingDirectIds.has(String(targetUserId))) return null;
            const normalizedId = String(targetUserId);
            return {
              id: `${DIRECT_CONTACT_PREFIX}${normalizedId}`,
              targetUserId,
              name: user?.name || user?.username || `User ${normalizedId}`,
              username: user?.username || `user${normalizedId}`,
              profilePic: user?.profile_pic || '',
              status: 'Available',
              lastMsg: 'Start a new chat',
              time: '',
              isAi: false,
              isGroup: false,
            };
          })
          .filter(Boolean);

        const nextContacts = [AI_CONTACT, ...roomContacts, ...availableUsers];
        setContacts(nextContacts);
        setRoomMap((prev) => {
          const next = { ...prev };
          roomContacts.forEach((contact) => {
            if (contact.roomId) next[contact.id] = contact.roomId;
          });
          return next;
        });
      } catch (err) {
        console.error('Failed to fetch contacts', err);
      }
    };

    fetchContacts();
  }, [currentUser, workspaceVersion]);

  useEffect(() => {
    if (!currentUser) return undefined;
    const intervalId = window.setInterval(() => {
      setWorkspaceVersion((prev) => prev + 1);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [currentUser]);

  const activeContact = contacts.find((contact) => contact.id === activeChat) || AI_CONTACT;
  const isAiChat = activeChat === AI_CHAT_ID;
  const isGroupChat = Boolean(activeContact?.isGroup);
  const activeOutputLanguage = chatLanguageMap[activeChat] || currentUser?.language || 'en';
  const activeLanguageLabel =
    languages.find((lang) => lang.code === activeOutputLanguage)?.name || activeOutputLanguage.toUpperCase();

  useEffect(() => {
    window.localStorage.setItem('polychat_chat_languages', JSON.stringify(chatLanguageMap));
  }, [chatLanguageMap]);

  const handleChatSelect = (id) => {
    setActiveChat(id);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleGroupUserToggle = (userId) => {
    setSelectedGroupUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName || selectedGroupUsers.length < 2) {
      setError('Group name and at least 2 users are required.');
      return;
    }

    try {
      setIsCreatingGroup(true);
      const res = await chatApi.createGroup(trimmedName, selectedGroupUsers);
      const room = res.data;
      const newContact = {
        id: `${GROUP_CONTACT_PREFIX}${room.id}`,
        roomId: room.id,
        targetUserId: null,
        name: room.title || trimmedName,
        username: '',
        profilePic: '',
        status: `${room.participants?.length || 0} members`,
        lastMsg: 'Group chat',
        time: '',
        isAi: false,
        isGroup: true,
        participants: room.participants || [],
      };
      setContacts((prev) => {
        const withoutDuplicate = prev.filter((contact) => contact.id !== newContact.id);
        return [AI_CONTACT, newContact, ...withoutDuplicate.filter((contact) => contact.id !== AI_CHAT_ID)];
      });
      setRoomMap((prev) => ({ ...prev, [newContact.id]: room.id }));
      setChatLanguageMap((prev) => ({ ...prev, [newContact.id]: currentUser?.language || 'en' }));
      setIsCreateGroupOpen(false);
      setGroupName('');
      setSelectedGroupUsers([]);
      setActiveChat(newContact.id);
      setWorkspaceVersion((prev) => prev + 1);
      setError('');
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    if (!shouldScrollToBottomRef.current && previousScrollHeightRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const diff = newScrollHeight - previousScrollHeightRef.current;
      container.scrollTop = diff;
      previousScrollHeightRef.current = null;
      setIsLoadingOlder(false);
    }
  }, [messages]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      scrollToBottom();
    } else {
      shouldScrollToBottomRef.current = true;
    }
  }, [messages]);

  useEffect(() => {
    const fetchRoomAndHistory = async () => {
      setLoading(true);
      try {
        const selectedContact = contacts.find((contact) => contact.id === activeChat);
        if (!selectedContact?.targetUserId && !selectedContact?.roomId) {
          throw new Error('Selected contact is unavailable for chat.');
        }

        let roomId = selectedContact.roomId || roomMapRef.current[activeChat];
        if (!roomId) {
          const res = await chatApi.createRoom(selectedContact.targetUserId);
          roomId = res.data.id;
          setRoomMap((prev) => ({ ...prev, [activeChat]: roomId }));
        }

        const historyRes = await chatApi.getChatHistory(roomId, activeOutputLanguage);
        const historyMessages = historyRes.data.map((msg) => {
          const isCurrentUserMessage =
            !msg?.is_bot && String(msg?.sender?.id ?? msg?.sender) === String(currentUser?.id);
          const senderName = msg?.sender?.name || msg?.sender?.username || activeContact.name;

          return {
            ...msg,
            sender: isCurrentUserMessage ? 'user' : 'bot',
            senderName,
            text: isCurrentUserMessage
              ? (msg.original_message || msg.display_text || msg.translated_message || '')
              : (msg.display_text || msg.translated_message || msg.original_message || ''),
            originalText: msg.original_message || '',
            translatedText: msg.display_text || msg.translated_message || msg.original_message || '',
          };
        });

        setMessages(
          historyMessages.length
            ? historyMessages
            : [{ sender: 'bot', text: 'Hello! How can I assist you today?' }]
        );
      } catch (err) {
        console.error('Failed to fetch room or history', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeChat && currentUser) {
      fetchRoomAndHistory();
    }
  }, [activeChat, contacts, currentUser, isAiChat, activeOutputLanguage, workspaceVersion]);

  const handleScroll = async () => {
    if (isLoadingOlder) {
      setIsLoadingOlder(false);
    }
  };

  const handleTranslationLanguageChange = async (e) => {
    const nextLanguage = e.target.value;
    setError('');
    setChatLanguageMap((prev) => ({ ...prev, [activeChat]: nextLanguage }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = input.trim();
    if (!messageText) return;

    const optimisticId = `tmp-${Date.now()}`;
    const userMessage = {
      id: optimisticId,
      sender: 'user',
      text: messageText,
      originalText: messageText,
      translatedText: messageText,
      pending: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    shouldScrollToBottomRef.current = true;

    try {
      const selectedContact = contacts.find((contact) => contact.id === activeChat);
      if (!selectedContact?.targetUserId && !selectedContact?.roomId) {
        throw new Error('Could not find selected contact.');
      }

      let roomId = selectedContact.roomId || roomMapRef.current[activeChat];
      if (!roomId) {
        const roomRes = await chatApi.createRoom(selectedContact.targetUserId);
        roomId = roomRes.data.id;
        setRoomMap((prev) => ({ ...prev, [activeChat]: roomId }));
      }

      const res = await chatApi.sendMessage(messageText, roomId, activeOutputLanguage);
      const userMessageData = res.data?.user_message || res.data || {};
      const messageData = res.data?.message || null;

      const translatedUserText =
        userMessageData.display_text ||
        userMessageData.translated_message ||
        userMessageData.original_message ||
        messageText;

      const normalizedUserMessage = {
        ...userMessageData,
        sender: 'user',
        senderName: 'You',
        text: userMessageData.original_message || messageText,
        originalText: userMessageData.original_message || messageText,
        translatedText: translatedUserText,
        pending: false,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticId
            ? { ...msg, ...normalizedUserMessage }
            : msg
        )
      );

      const responseText =
        messageData?.display_text ||
        messageData?.translated_message ||
        messageData?.original_message ||
        messageData?.response ||
        messageData?.text ||
        '';

      const shouldAppendBotMessage = Boolean(messageData) && (isAiChat || messageData?.is_bot);
      const botMessage = {
        ...messageData,
        sender: 'bot',
        senderName: messageData?.sender?.name || messageData?.sender?.username || activeContact.name,
        text: responseText,
        originalText: messageData?.original_message || responseText,
        translatedText: responseText,
      };

      if (shouldAppendBotMessage && (responseText || messageData?.id)) {
        setMessages((prev) => [...prev, botMessage]);
      }
      setWorkspaceVersion((prev) => prev + 1);
    } catch (err) {
      setError(`${normalizeApiError(err)} Showing local response.`);
      setMessages((prev) => [
        ...prev.map((msg) =>
          msg.id === optimisticId ? { ...msg, pending: false } : msg
        ),
        ...(isAiChat
          ? [
              {
                sender: 'bot',
                text: `Received: ${messageText}`,
                localFallback: true,
              },
            ]
          : []),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] min-h-0 px-3 py-4 sm:px-4 lg:px-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.08);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.35);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.55);
        }
      `}</style>

      <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <GlassCard
          className={`${showSidebar ? 'flex' : 'hidden'} h-full min-h-0 flex-col overflow-hidden border border-slate-800/80 bg-slate-950/90 p-0 shadow-2xl shadow-cyan-950/20 lg:col-span-4 lg:flex xl:col-span-3`}
          contentClassName="flex h-full min-h-0 flex-col"
        >
          <div className="border-b border-slate-800 bg-slate-950/90 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-cyan-400/20">
                  <img
                    src={currentUser?.profile_pic || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username || 'User'}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{currentUser?.username || 'Chats'}</h2>
                  <p className="text-xs text-slate-400">Workspace chat</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or @username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-3 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto">
            {contacts
              .filter((contact) => {
                const query = searchTerm.toLowerCase();
                return (
                  contact.name.toLowerCase().includes(query) ||
                  String(contact.username || '').toLowerCase().includes(query)
                );
              })
              .map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleChatSelect(contact.id)}
                  className={`mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                    activeChat === contact.id
                      ? 'border-cyan-400/30 bg-slate-900 text-white shadow-lg shadow-cyan-950/20'
                      : 'border-transparent text-slate-300 hover:bg-slate-900/70'
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl ${contact.isAi ? 'bg-cyan-500/15 text-cyan-300' : contact.isGroup ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                    {contact.profilePic ? (
                      <img src={contact.profilePic} alt={contact.name} className="h-full w-full object-cover" />
                    ) : contact.isAi ? (
                      <Bot className="h-6 w-6" />
                    ) : contact.isGroup ? (
                      <Users className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between">
                      <h3 className={`truncate font-semibold ${activeChat === contact.id ? 'text-white' : 'text-slate-200'}`}>{contact.name}</h3>
                      <span className="text-xs text-slate-500">{contact.time}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {contact.isAi ? contact.lastMsg : contact.isGroup ? contact.status : `@${contact.username}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>

        <GlassCard
          className={`${!showSidebar ? 'flex' : 'hidden'} relative h-full min-h-0 flex-col overflow-hidden border border-slate-800/80 bg-slate-950/95 p-0 shadow-2xl shadow-cyan-950/20 lg:col-span-8 lg:flex xl:col-span-9`}
          contentClassName="flex h-full min-h-0 flex-col"
        >
          <div className="z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSidebar(true)} className="mr-1 text-slate-300 lg:hidden">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isAiChat ? 'bg-cyan-500/15 text-cyan-300' : isGroupChat ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-200'}`}>
                {isAiChat ? <Sparkles className="h-5 w-5" /> : isGroupChat ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-100">{activeContact.name}</h3>
                <p className="flex items-center gap-1 text-xs text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  {isAiChat ? `Live AI | Output ${activeLanguageLabel}` : isGroupChat ? `Group chat | Output ${activeLanguageLabel}` : `Direct chat | Output ${activeLanguageLabel}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <div className="hidden items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 md:flex">
                <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Source Auto
                </span>
                <Languages className="h-4 w-4 text-cyan-300" />
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Output
                </label>
                <select
                  value={activeOutputLanguage}
                  onChange={handleTranslationLanguageChange}
                  className="bg-transparent text-sm text-slate-100 focus:outline-none"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="rounded-full p-2 transition-colors hover:bg-slate-900"><Search className="h-5 w-5" /></button>
              <button className="rounded-full p-2 transition-colors hover:bg-slate-900" disabled={isAiChat}><Phone className="h-5 w-5" /></button>
              <button className="rounded-full p-2 transition-colors hover:bg-slate-900" disabled={isAiChat}><Video className="h-5 w-5" /></button>
              <button className="rounded-full p-2 transition-colors hover:bg-slate-900"><MoreVertical className="h-5 w-5" /></button>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="custom-scrollbar flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#111827_100%)] p-4 sm:p-6 space-y-4"
          >
            <div className="sticky top-0 z-10 -mt-2 mb-4">
              <div className="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/80 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Live translate active
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">Source: Auto-detect</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">Output: {activeLanguageLabel}</span>
              </div>
            </div>
            {messages.length === 0 && !loading && (
              <div className="mx-auto mt-8 flex max-w-lg flex-col items-center rounded-[2rem] border border-slate-800 bg-slate-950/60 px-6 py-8 text-center shadow-2xl shadow-cyan-950/10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                  {isAiChat ? <Sparkles className="h-7 w-7" /> : <User className="h-7 w-7" />}
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  {isAiChat ? 'Start an AI-assisted conversation' : `Start chatting with ${activeContact.name}`}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {isAiChat
                    ? `Ask for replies, translation, or quick rewrites in ${activeLanguageLabel}.`
                    : `Messages are stored in chat history and rendered in ${activeLanguageLabel} when translation is enabled.`}
                </p>
              </div>
            )}

            {isLoadingOlder && (
              <div className="flex justify-center py-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] break-words whitespace-pre-wrap rounded-3xl px-5 py-3.5 shadow-sm lg:max-w-xl ${
                    msg.sender === 'user'
                      ? 'rounded-tr-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
                      : 'rounded-tl-md border border-slate-800 bg-slate-900/90 text-slate-100'
                  }`}
                >
                  <div className={`mb-2 text-[10px] uppercase tracking-[0.18em] ${
                    msg.sender === 'user' ? 'text-cyan-100/70' : 'text-cyan-300/70'
                  }`}>
                    {msg.sender === 'user' ? 'You' : isAiChat ? 'AI Assistant' : msg.senderName || activeContact.name}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className={`mb-1 text-[10px] uppercase tracking-[0.18em] ${
                        msg.sender === 'user' ? 'text-cyan-100/70' : 'text-slate-500'
                      }`}>
                        Original
                      </div>
                      <div>{msg.originalText || msg.text}</div>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-xs leading-5 ${
                      msg.sender === 'user'
                        ? 'bg-white/10 text-cyan-50/90'
                        : 'border border-slate-800 bg-slate-950/80 text-cyan-100'
                    }`}>
                      <div className={`mb-1 uppercase tracking-[0.18em] text-[10px] ${
                        msg.sender === 'user' ? 'text-white/60' : 'text-cyan-300/70'
                      }`}>
                        Translated to {activeLanguageLabel}
                      </div>
                      <div>{msg.translatedText || msg.text}</div>
                    </div>
                  </div>
                  {msg.pending && (
                    <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
                      Sending
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-3xl rounded-tl-md border border-slate-800 bg-slate-900 px-5 py-3 text-slate-100">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="absolute bottom-24 left-4 right-4 mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200 shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 md:hidden">
              <Languages className="h-4 w-4 text-cyan-300" />
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Output
              </label>
              <select
                value={activeOutputLanguage}
                onChange={handleTranslationLanguageChange}
                className="w-full bg-transparent text-sm text-slate-100 focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <button type="button" className="rounded-2xl p-3 text-slate-500 transition-colors hover:bg-slate-900 hover:text-cyan-300">
                <Plus className="h-6 w-6" />
              </button>
              <div className="relative flex-grow">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message in ${activeLanguageLabel}...`}
                  className="w-full border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-cyan-500/20 shadow-none"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-none bg-gradient-to-br from-cyan-500 to-blue-600 p-0 shadow-lg shadow-cyan-900/30 hover:from-cyan-400 hover:to-blue-500"
              >
                <Send className="ml-0.5 h-5 w-5" />
              </Button>
            </form>
          </div>
        </GlassCard>
      </div>
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Create Group</h3>
                <p className="text-sm text-slate-400">Choose a group name and at least 2 users.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateGroupOpen(false);
                  setGroupName('');
                  setSelectedGroupUsers([]);
                }}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              />

              <div className="max-h-72 space-y-2 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/70 p-3">
                {contacts
                  .filter((contact) => !contact.isAi && !contact.isGroup)
                  .map((contact) => {
                    const isSelected = selectedGroupUsers.includes(contact.targetUserId);
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleGroupUserToggle(contact.targetUserId)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-400/40 bg-emerald-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-950'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-xs text-slate-500">@{contact.username}</div>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-emerald-300" />}
                      </button>
                    );
                  })}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                <span>{selectedGroupUsers.length} users selected</span>
                <Button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={isCreatingGroup}
                  className="rounded-2xl border-none bg-gradient-to-br from-emerald-500 to-cyan-500 px-5 py-2 text-sm text-white hover:from-emerald-400 hover:to-cyan-400"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create group'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
