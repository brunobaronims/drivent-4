import { ApplicationError } from "@/protocols";

export function cannotGetRoomError(): ApplicationError {
  return {
    name: "CannotGetRoomError",
    message: "Cannot get room!",
  };
}
