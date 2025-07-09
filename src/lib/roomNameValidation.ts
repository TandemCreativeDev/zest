export interface RoomNameCheckResponse {
  available: boolean;
  title: string;
  error?: string;
}

export const checkRoomNameAvailability = async (
  title: string
): Promise<RoomNameCheckResponse> => {
  try {
    const response = await fetch("/api/rooms/check-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        available: false,
        title,
        error: data.error || "Failed to check room name availability",
      };
    }

    return data;
  } catch {
    return {
      available: false,
      title,
      error: "Network error while checking room name availability",
    };
  }
};