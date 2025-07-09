"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmationModal from "@/components/ConfirmationModal";
import RoomCreationForm from "@/components/RoomCreationForm";
import ChatroomsList from "@/components/ChatroomsList";
import { copyRoomUrl, copyRoomId } from "@/lib/roomUtils";
import {
  fetchChatrooms,
  createRoom as createRoomApi,
  deleteRoom,
} from "@/lib/roomApi";

interface Chatroom {
  id: string;
  roomUrl?: string;
  title: string;
  createdAt: string;
  _count: {
    messages: number;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Chatroom | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await fetchChatrooms();
      setChatrooms(data);
    } catch (error) {
      console.error("Error fetching chatrooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleDeleteClick = (room: Chatroom) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoom(roomToDelete);
      // Remove from local state
      setChatrooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      alert("Failed to delete chatroom. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const handleCreateRoom = async (title: string) => {
    setCreatingRoom(true);
    try {
      await createRoomApi(title);
      // Refresh the chatrooms list
      await fetchRooms();
      // Hide the form
      setShowRoomForm(false);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleCancelCreateRoom = () => {
    setShowRoomForm(false);
  };

  // Load chatrooms on component mount
  useEffect(() => {
    if (session) {
      fetchRooms();
    }
  }, [session]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden space-y-4">
            {/* Brand Row */}
            <div className="flex items-center justify-between">
              <Brand />
              <ThemeToggle />
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {session?.user && (
                  <>
                    <button
                      onClick={() => setShowRoomForm(!showRoomForm)}
                      className="px-3 py-2 bg-yapli-teal hover:bg-yapli-hover text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
                      aria-label={
                        showRoomForm
                          ? "Cancel room creation"
                          : "Create new chat room"
                      }
                    >
                      + Create Room
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white text-sm rounded-md cursor-pointer transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original */}
          <div className="hidden sm:flex items-center justify-between">
            <Brand />
            <div className="flex items-center gap-3">
              {session?.user && (
                <>
                  <span>
                    Welcome, {session.user.name || session.user.email}
                  </span>
                  <button
                    onClick={() => setShowRoomForm(true)}
                    className="relative overflow-hidden px-4 py-2 bg-yapli-teal text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yapli-teal focus:ring-offset-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-yapli-hover"
                    aria-label="Create new chat room"
                  >
                    <span className="relative z-10">+ Create New Room</span>
                  </button>
                  <div className="flex items-center gap-3 text-sm text-text">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="font-medium px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-sm rounded-md cursor-pointer transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {showRoomForm && (
          <RoomCreationForm
            onSubmit={handleCreateRoom}
            onCancel={handleCancelCreateRoom}
            isLoading={creatingRoom}
          />
        )}

        <ChatroomsList
          chatrooms={chatrooms}
          isLoading={loadingRooms}
          handleCopyRoomUrl={copyRoomUrl}
          handleCopyRoomId={copyRoomId}
          handleDeleteRoom={handleDeleteClick}
        />
      </main>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Chatroom"
        message={`Are you sure you want to delete "${roomToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
