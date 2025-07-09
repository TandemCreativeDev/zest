import { useState, useEffect, useCallback } from "react";
import { checkRoomNameAvailability } from "@/lib/roomNameValidation";

interface RoomCreationFormProps {
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RoomCreationForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: RoomCreationFormProps) {
  const [roomTitle, setRoomTitle] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Debounced validation function
  const validateRoomName = useCallback(async (title: string) => {
    if (!title.trim()) {
      setValidationError(null);
      setIsAvailable(null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    
    try {
      const result = await checkRoomNameAvailability(title.trim());
      
      if (result.error) {
        setValidationError(result.error);
        setIsAvailable(false);
      } else {
        setValidationError(result.available ? null : "You already have a room with this name");
        setIsAvailable(result.available);
      }
    } catch {
      setValidationError("Failed to check room name availability");
      setIsAvailable(false);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Debounce validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateRoomName(roomTitle);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roomTitle, validateRoomName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || isAvailable === false) return;

    await onSubmit(roomTitle.trim());
    setRoomTitle("");
    setValidationError(null);
    setIsAvailable(null);
  };

  const handleCancel = () => {
    setRoomTitle("");
    setValidationError(null);
    setIsAvailable(null);
    onCancel();
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text">Create New Room</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="roomTitle"
              className="block text-sm font-medium text-text mb-2"
            >
              Room Title
            </label>
            <input
              type="text"
              id="roomTitle"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="Enter a title for your room..."
              className={`text-text bg-card w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                validationError
                  ? "border-red-500 focus:ring-red-500"
                  : isAvailable === true
                  ? "border-green-500 focus:ring-green-500"
                  : "border-border focus:ring-yellow-500"
              }`}
              required
              disabled={isLoading}
              aria-busy={isLoading}
            />
            {/* Validation feedback */}
            <div className="mt-2 min-h-[1.25rem]">
              {isValidating && (
                <p className="text-sm text-gray-500">Checking availability...</p>
              )}
              {validationError && (
                <p className="text-sm text-red-500">{validationError}</p>
              )}
              {isAvailable === true && !isValidating && (
                <p className="text-sm text-green-500">✓ Room name is available</p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading || !roomTitle.trim() || isAvailable === false || isValidating}
              className="px-4 py-2 bg-yapli-teal text-black rounded-md hover:bg-yapli-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-card border border-border text-text rounded-md hover:opacity-80 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

