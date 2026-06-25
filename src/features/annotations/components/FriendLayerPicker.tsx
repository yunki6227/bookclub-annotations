"use client";

import type { MockFriendPageLayer } from "../mock/mockFriendAnnotations";

type FriendLayerPickerProps = {
  friendLayers: MockFriendPageLayer[];
  onHideFriendLayer: () => void;
  onSelectFriendLayer: (friendId: string) => void;
  selectedFriendId: string | null;
};

export function FriendLayerPicker({
  friendLayers,
  onHideFriendLayer,
  onSelectFriendLayer,
  selectedFriendId,
}: FriendLayerPickerProps) {
  if (friendLayers.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No friend annotations on this page.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">Friend layers:</span>
      {friendLayers.map((friendLayer) => {
        const isSelected = selectedFriendId === friendLayer.friendId;

        return (
          <button
            type="button"
            key={friendLayer.friendId}
            className={
              isSelected
                ? "rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            }
            onClick={() => onSelectFriendLayer(friendLayer.friendId)}
          >
            {friendLayer.friendName}
          </button>
        );
      })}
      <button
        type="button"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!selectedFriendId}
        onClick={onHideFriendLayer}
      >
        Hide friend layer
      </button>
    </div>
  );
}
