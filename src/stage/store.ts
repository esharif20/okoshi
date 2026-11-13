import { createStore, useStore } from "zustand";
import type { RoomId } from "~/content";

export type Edition = "desktop" | "phone" | "still";

export type StageState = {
  progress: number;
  hoveredRoom: RoomId | null;
  openRoom: RoomId | null;
  night: boolean;
  edition: Edition;
  quality: "high" | "low";
};

export const initialStage: StageState = {
  progress: 0,
  hoveredRoom: null,
  openRoom: null,
  night: false,
  edition: "desktop",
  quality: "high",
};

// One store for the whole site. The page writes; the Diorama reads with stage.getState() in its render loop.
export const stage = createStore<StageState>()(() => ({ ...initialStage }));

export function useStage<T>(pick: (s: StageState) => T): T {
  return useStore(stage, pick);
}
