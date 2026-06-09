import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  useGetMe,
  getGetMeQueryKey,
  useLogout,
  useGetFriends,
  getGetFriendsQueryKey,
  useGetFriendRequests,
  getGetFriendRequestsQueryKey,
  useAddFriend,
  useAcceptFriend,
  useRejectFriend,
  useGetMessages,
  getGetMessagesQueryKey,
  useSendMessage,
  useGetAiMessages,
  getGetAiMessagesQueryKey,
  useSendAiMessage,
  useGetGroups,
  getGetGroupsQueryKey,
  useCreateGroup,
  useGetChannels,
  getGetChannelsQueryKey,
  useCreateChannel,
  useGetMyRewards,
  getGetMyRewardsQueryKey,
  useClaimDailyReward,
  useGetGroupMessages,
  useGetChannelPosts
} from "@workspace/api-client-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  User,
  Users,
  LayoutGrid,
  FileText,
  Gift,
  Bell,
  Lock,
  Settings,
  LogOut,
  Camera,
  Loader2,
  UserPlus,
  Check,
  X,
  ChevronRight,
  Send,
  Plus,
  Heart,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";


type Tab = "me" | "friends" | "community" | "posts" | "rewards";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("me");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const logoutMutation = useLogout();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/");
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F2F2F7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F2F2F7] pb-[80px]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <main className="flex-1 overflow-y-auto">
        {activeTab === "me" && <MeTab user={user} setLocation={setLocation} />}
        {activeTab === "friends" && <FriendsTab />}
        {activeTab === "community" && <CommunityTab />}
        {activeTab === "posts" && <PostsTab />}
        {activeTab === "rewards" && <RewardsTab />}
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-gray-200 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <TabButton active={activeTab === "me"} onClick={() => setActiveTab("me")} icon={User} label="أنا" />
        <TabButton active={activeTab === "friends"} onClick={() => setActiveTab("friends")} icon={Users} label="أصدقاء" />
        <TabButton active={activeTab === "community"} onClick={() => setActiveTab("community")} icon={LayoutGrid} label="مجتمع" />
        <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")} icon={FileText} label="منشورات" />
        <TabButton active={activeTab === "rewards"} onClick={() => setActiveTab("rewards")} icon={Gift} label="مكافآت" />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
        active ? "text-[#6366F1]" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

// --- TAB 1: ME ---
function MeTab({ user, setLocation }: { user: any; setLocation: any }) {
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const { data: rewards } = useGetMyRewards();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/auth/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload");

      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "نجاح", description: "تم تحديث الصورة الشخصية" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث الصورة" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <div
          className="relative w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center ring-4 ring-indigo-50 cursor-pointer overflow-hidden group"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#6366F1]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-gray-400" />
          )}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
          <p className="text-sm text-gray-500 font-mono mt-1">#{user.id}</p>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 w-full pt-6 border-t border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-gray-900">{user.points || 0}</span>
            <span className="text-xs text-gray-500 mt-1">نقطة</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-[#6366F1]">{user.gems || 0}</span>
            <span className="text-xs text-gray-500 mt-1">جوهرة</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-amber-500">{rewards?.birds || 0}</span>
            <span className="text-xs text-gray-500 mt-1">طائر</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          <button className="w-full flex items-center px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ml-4 shrink-0">
              <Bell className="w-5 h-5 text-[#6366F1]" />
            </div>
            <span className="flex-1 text-right text-gray-900 font-medium">الإشعارات</span>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ml-4 shrink-0">
              <Lock className="w-5 h-5 text-[#6366F1]" />
            </div>
            <span className="flex-1 text-right text-gray-900 font-medium">الخصوصية</span>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ml-4 shrink-0">
              <Settings className="w-5 h-5 text-[#6366F1]" />
            </div>
            <span className="flex-1 text-right text-gray-900 font-medium">الإعدادات</span>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>

          <button onClick={handleLogout} className="w-full flex items-center px-5 py-4 hover:bg-red-50 transition-colors active:bg-red-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center ml-4 shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="flex-1 text-right text-red-500 font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- TAB 2: FRIENDS ---
function FriendsTab() {
  const { data: friends, isLoading: friendsLoading } = useGetFriends();
  const { data: requests } = useGetFriendRequests();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [showAiChat, setShowAiChat] = useState(false);

  if (showAiChat) {
    return <AiChatPanel onBack={() => setShowAiChat(false)} />;
  }

  if (selectedFriend) {
    return <DirectChatPanel friend={selectedFriend} onBack={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">أصدقاء</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-50 text-[#6366F1] px-4 py-2 rounded-full font-medium active:bg-indigo-100 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          إضافة صديق
        </button>
      </div>

      {showAddModal && <AddFriendModal onClose={() => setShowAddModal(false)} />}

      {requests && requests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 px-2">طلبات الصداقة</h2>
          {requests.map((req) => (
            <FriendRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}

      <div className="space-y-3 mt-6">
        <h2 className="text-sm font-semibold text-gray-500 px-2">قائمة الأصدقاء</h2>

        <div
          onClick={() => setShowAiChat(true)}
          className="bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-2xl p-4 flex items-center gap-4 cursor-pointer shadow-sm text-white active:opacity-90 transition-opacity"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl font-bold">🤖</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">محادثة مع فارس</h3>
            <p className="text-white/80 text-sm">الذكاء الاصطناعي الخاص بك</p>
          </div>
        </div>

        {friendsLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : friends?.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
            لا يوجد لديك أصدقاء بعد. قم بإضافة أصدقاء للبدء بالدردشة!
          </div>
        ) : (
          friends?.map((friend) => (
            <div
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className="bg-white rounded-2xl p-3 flex items-center gap-4 cursor-pointer shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden shrink-0">
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{friend.username}</h3>
                <p className="text-xs text-gray-400 font-mono">#{friend.id}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddFriendModal({ onClose }: { onClose: () => void }) {
  const [id, setId] = useState("");
  const addFriendMutation = useAddFriend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    addFriendMutation.mutate(
      { data: { friendId: id } },
      {
        onSuccess: () => {
          toast({ title: "نجاح", description: "تم إرسال طلب الصداقة" });
          queryClient.invalidateQueries({ queryKey: getGetFriendRequestsQueryKey() });
          onClose();
        },
        onError: () => {
          toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على المستخدم أو يوجد طلب مسبق" });
        },
      }
    );
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
      <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
      <h3 className="font-bold text-lg mb-4 text-gray-900">إضافة صديق جديد</h3>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="معرّف المستخدم (ID)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-left font-mono focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          dir="ltr"
        />
        <button
          type="submit"
          disabled={addFriendMutation.isPending}
          className="bg-[#6366F1] text-white px-6 py-3 rounded-xl font-bold active:bg-indigo-600 disabled:opacity-50"
        >
          {addFriendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال"}
        </button>
      </form>
    </div>
  );
}

function FriendRequestCard({ request }: { request: any }) {
  const acceptMutation = useAcceptFriend();
  const rejectMutation = useRejectFriend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAction = (action: "accept" | "reject") => {
    const mutation = action === "accept" ? acceptMutation : rejectMutation;
    mutation.mutate(
      { data: { requestId: request.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFriendRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetFriendsQueryKey() });
          toast({ title: "نجاح", description: action === "accept" ? "تم قبول الطلب" : "تم رفض الطلب" });
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
        {request.from.avatar ? (
          <img src={request.from.avatar} alt={request.from.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900">{request.from.username}</h3>
        <p className="text-xs text-gray-400 font-mono">#{request.from.id}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("accept")}
          disabled={acceptMutation.isPending || rejectMutation.isPending}
          className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center active:bg-green-100"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={acceptMutation.isPending || rejectMutation.isPending}
          className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center active:bg-red-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function DirectChatPanel({ friend, onBack }: { friend: any; onBack: () => void }) {
  const [text, setText] = useState("");
  const { data: user } = useGetMe();
  const { data: messages, refetch } = useGetMessages(friend.id);
  const sendMutation = useSendMessage();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgText = text;
    setText("");
    sendMutation.mutate(
      { friendId: friend.id, data: { text: msgText } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(friend.id) }),
      }
    );
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#F2F2F7] z-40 pb-[80px]">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
        <h2 className="font-bold text-lg text-gray-900">{friend.username}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">لا توجد رسائل بعد. ابدأ المحادثة!</div>
        ) : (
          messages.map((m: any) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isMe ? "bg-[#6366F1] text-white rounded-tl-sm" : "bg-white text-gray-900 rounded-tr-sm border border-gray-100"
                  }`}
                >
                  <p className="text-[15px]">{m.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            className="w-12 h-12 bg-[#6366F1] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

function AiChatPanel({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const { data: messages, refetch } = useGetAiMessages();
  const sendMutation = useSendAiMessage();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgText = text;
    setText("");
    sendMutation.mutate(
      { data: { text: msgText } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAiMessagesQueryKey() });
          refetch();
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#F2F2F7] z-40 pb-[80px]">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl shrink-0">🤖</div>
        <div>
          <h2 className="font-bold text-gray-900">فارس — مساعد Varecvsce</h2>
          <p className="text-xs text-[#6366F1]">مدعوم بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">كيف يمكنني مساعدتك اليوم؟</div>
        ) : (
          messages.map((m: any) => {
            const isMe = m.role === "user";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    isMe ? "bg-[#6366F1] text-white rounded-tl-sm" : "bg-indigo-50 text-indigo-900 rounded-tr-sm border border-indigo-100"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
        {sendMutation.isPending && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] px-4 py-4 rounded-2xl bg-indigo-50 text-indigo-900 rounded-tr-sm border border-indigo-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اسأل فارس..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            className="w-12 h-12 bg-[#6366F1] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- TAB 3: COMMUNITY (GROUPS) ---
function CommunityTab() {
  const { data: groups, isLoading } = useGetGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  if (selectedGroup) {
    return <GroupChatPanel group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المجموعات</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-[#6366F1] rounded-full active:bg-indigo-100 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" /></div>
        ) : groups?.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100">
            لا توجد مجموعات حالياً. كن أول من ينشئ مجموعة!
          </div>
        ) : (
          groups?.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="bg-white rounded-3xl p-5 cursor-pointer shadow-sm border border-gray-100 active:bg-gray-50 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{group.memberCount} عضو</span>
              </div>
              {group.description && <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const createMutation = useCreateGroup();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { data: { name, description: desc } },
      {
        onSuccess: () => {
          toast({ title: "نجاح", description: "تم إنشاء المجموعة" });
          queryClient.invalidateQueries({ queryKey: getGetGroupsQueryKey() });
          onClose();
        },
      }
    );
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
      <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
      <h3 className="font-bold text-lg mb-4 text-gray-900">إنشاء مجموعة جديدة</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="اسم المجموعة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
        />
        <textarea
          placeholder="الوصف (اختياري)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
        />
        <button
          type="submit"
          disabled={!name.trim() || createMutation.isPending}
          className="bg-[#6366F1] text-white w-full py-3 rounded-xl font-bold active:bg-indigo-600 mt-2 disabled:opacity-50"
        >
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "إنشاء"}
        </button>
      </form>
    </div>
  );
}

function GroupChatPanel({ group, onBack }: { group: any; onBack: () => void }) {
  const [text, setText] = useState("");
  const { data: user } = useGetMe();
  const { data: messages, refetch } = useGetGroupMessages(group.id);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMutation = useMutation({
    mutationFn: async ({ groupId, text: msgText }: { groupId: string; text: string }) => {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText }),
      });
      if (!res.ok) throw new Error("فشل إرسال الرسالة");
      return res.json();
    },
  });

  useEffect(() => {
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgText = text;
    setText("");
    sendMutation.mutate(
      { groupId: group.id, text: msgText },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetGroupMessagesQueryKey(group.id) }),
      }
    );
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#F2F2F7] z-40 pb-[80px]">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-bold text-lg text-gray-900">{group.name}</h2>
          <p className="text-xs text-gray-500">{group.memberCount} عضو</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">لا توجد رسائل. كن أول من يكتب!</div>
        ) : (
          messages.map((m: any) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-xs text-gray-500 mb-1 px-1 font-medium">{m.senderName}</span>}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isMe ? "bg-[#6366F1] text-white rounded-tl-sm" : "bg-white text-gray-900 rounded-tr-sm border border-gray-100"
                  }`}
                >
                  <p className="text-[15px]">{m.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة للمجموعة..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            className="w-12 h-12 bg-[#6366F1] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- TAB 4: POSTS (CHANNELS) ---
function PostsTab() {
  const { data: channels, isLoading } = useGetChannels();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  if (selectedChannel) {
    return <ChannelPostsPanel channel={selectedChannel} onBack={() => setSelectedChannel(null)} />;
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">القنوات</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-[#6366F1] rounded-full active:bg-indigo-100 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showCreate && <CreateChannelModal onClose={() => setShowCreate(false)} />}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" /></div>
        ) : channels?.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100">
            لا توجد قنوات حالياً.
          </div>
        ) : (
          channels?.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className="bg-white rounded-3xl p-5 cursor-pointer shadow-sm border border-gray-100 active:bg-gray-50 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6366F1]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{channel.name}</h3>
                    <p className="text-xs text-gray-500">{channel.subscriberCount} مشترك</p>
                  </div>
                </div>
              </div>
              {channel.description && <p className="text-sm text-gray-600 mt-2">{channel.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateChannelModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const createMutation = useCreateChannel();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { data: { name, description: desc } },
      {
        onSuccess: () => {
          toast({ title: "نجاح", description: "تم إنشاء القناة" });
          queryClient.invalidateQueries({ queryKey: getGetChannelsQueryKey() });
          onClose();
        },
      }
    );
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative">
      <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
        <X className="w-5 h-5" />
      </button>
      <h3 className="font-bold text-lg mb-4 text-gray-900">إنشاء قناة جديدة</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="اسم القناة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
        />
        <textarea
          placeholder="الوصف (اختياري)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
        />
        <button
          type="submit"
          disabled={!name.trim() || createMutation.isPending}
          className="bg-[#6366F1] text-white w-full py-3 rounded-xl font-bold active:bg-indigo-600 mt-2 disabled:opacity-50"
        >
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "إنشاء"}
        </button>
      </form>
    </div>
  );
}

function ChannelPostsPanel({ channel, onBack }: { channel: any; onBack: () => void }) {
  const [text, setText] = useState("");
  const { data: posts, refetch } = useGetChannelPosts(channel.id);
  const queryClient = useQueryClient();
  const sendMutation = useMutation({
    mutationFn: async ({ channelId, text: msgText }: { channelId: string; text: string }) => {
      const res = await fetch(`/api/channels/${channelId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText }),
      });
      if (!res.ok) throw new Error("فشل نشر المنشور");
      return res.json();
    },
  });

  useEffect(() => {
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msgText = text;
    setText("");
    sendMutation.mutate(
      { channelId: channel.id, text: msgText },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetChannelPostsQueryKey(channel.id) }),
      }
    );
  };

  const reversedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].reverse();
  }, [posts]);

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#F2F2F7] z-40 pb-[80px]">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-bold text-lg text-gray-900">{channel.name}</h2>
          <p className="text-xs text-gray-500">قناة عامة</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {reversedPosts.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">لا توجد منشورات. كن أول من ينشر!</div>
        ) : (
          reversedPosts.map((post: any) => (
            <div key={post.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">{post.authorName}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: arSA })}
                </span>
              </div>
              <p className="text-gray-800 text-[15px] leading-relaxed">{post.text}</p>
              <div className="flex items-center gap-1 text-gray-400 mt-2">
                <Heart className="w-4 h-4" />
                <span className="text-xs">{post.likes || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب منشوراً..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            className="w-12 h-12 bg-[#6366F1] text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- TAB 5: REWARDS ---
function RewardsTab() {
  const { data: rewards, isLoading } = useGetMyRewards();
  const claimMutation = useClaimDailyReward();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClaim = () => {
    claimMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast({
          title: "تم استلام المكافأة!",
          description: `حصلت على ${data.pointsEarned} نقطة و ${data.gemsEarned} جوهرة و ${data.birdsEarned} طائر.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetMyRewardsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "خطأ", description: error.message || "حدث خطأ أثناء الاستلام" });
      },
    });
  };

  if (isLoading || !rewards) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" /></div>;
  }

  const today = new Date().toISOString().split("T")[0];
  const lastClaimDate = rewards.lastDailyClaim ? rewards.lastDailyClaim.split("T")[0] : null;
  const isClaimedToday = lastClaimDate === today;

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="bg-gradient-to-br from-[#6366F1] to-purple-600 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-6">مكافآتك</h1>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{rewards.points}</span>
              <span className="text-sm text-indigo-100 mt-1">نقطة</span>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-amber-300">{rewards.gems}</span>
              <span className="text-sm text-indigo-100 mt-1">جوهرة</span>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-emerald-300">{rewards.birds}</span>
              <span className="text-sm text-indigo-100 mt-1">طائر</span>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
            <span className="font-medium">سلسلة الدخول اليومي</span>
            <span className="font-bold bg-white text-[#6366F1] px-3 py-1 rounded-full text-sm">{rewards.streakDays} يوم</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={isClaimedToday || claimMutation.isPending}
        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 transition-all ${
          isClaimedToday
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#6366F1] text-white active:scale-[0.98] active:bg-indigo-600"
        }`}
      >
        {claimMutation.isPending ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isClaimedToday ? (
          <>تم الاستلام اليوم <Check className="w-5 h-5" /></>
        ) : (
          "استلم مكافأة اليوم"
        )}
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">كيف تكسب المكافآت؟</h2>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span className="text-sm text-gray-700">تسجيل الدخول اليومي — <strong className="text-[#6366F1]">50 نقطة</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span className="text-sm text-gray-700">3 أيام متتالية — <strong className="text-[#6366F1]">+30 نقطة + جوهرة</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span className="text-sm text-gray-700">7 أيام متتالية — <strong className="text-[#6366F1]">+100 نقطة + 3 جواهر</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#6366F1]" />
            </div>
            <span className="text-sm text-gray-700">كل 5 أيام — <strong className="text-[#6366F1]">طائر نادر</strong></span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">أنواع العملات</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-700 font-bold">ن</div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">نقطة</h4>
              <p className="text-xs text-gray-500 mt-1">العملة الأساسية للعبة. تستخدم في المشتريات اليومية.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-[#6366F1] font-bold">ج</div>
            <div>
              <h4 className="font-bold text-[#6366F1] text-sm">جوهرة</h4>
              <p className="text-xs text-indigo-400 mt-1">عملة نادرة للمشتريات الخاصة والمميزة.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 font-bold">ط</div>
            <div>
              <h4 className="font-bold text-amber-600 text-sm">طائر</h4>
              <p className="text-xs text-amber-500 mt-1">مخلوق نادر ينضم لمجموعتك ليعطيك ميزات حصرية.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
