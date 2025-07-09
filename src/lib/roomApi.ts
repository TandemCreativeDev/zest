interface Chatroom {
  id: string;
  roomUrl?: string;
  title: string;
  createdAt: string;
  _count: {
    messages: number;
  };
}

export const fetchChatrooms = async (): Promise<Chatroom[]> => {
  const response = await fetch("/api/rooms");
  if (!response.ok) {
    throw new Error("Failed to fetch chatrooms");
  }
  return response.json();
};

export const createRoom = async (title: string): Promise<void> => {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title.trim() }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || "Failed to create room";
    throw new Error(errorMessage);
  }
};

export const deleteRoom = async (room: Chatroom): Promise<void> => {
  // Use roomUrl if available, otherwise fall back to id
  const identifier = room.roomUrl || room.id;
  const response = await fetch(`/api/rooms/${identifier}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete chatroom");
  }
};