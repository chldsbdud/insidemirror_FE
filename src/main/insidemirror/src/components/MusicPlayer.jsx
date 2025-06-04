import React, { useEffect, useState } from "react";
import { IoPause, IoPlay, IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { useYoutube } from "../useYoutube.ts";
import { PlayerState } from "../types.ts";
import "../styles/MusicPlayer.css";

const playlists = ["PLVI3CAcQB7GM7pBqn8WYVkSKn2QfUbS2E"];

function MusicPlayer() {
  const [randomId] = useState(() => {
    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
  });

  const { playerDetails, actions } = useYoutube({
    id: randomId,
    type: "playlist",
  });

  return (
    <div className="player-container">
      <div className="music-player-container">
        <div className="album-thumbnail">
          <img src={playerDetails.thumbnail} alt="Album Art" />
        </div>
        <div className="music-info">
          <div className="music-title">{playerDetails.title}</div>
          <div className="music-author">{playerDetails.author}</div>
        </div>
        <div className="music-controls">
          <button onClick={actions.previousVideo}>
            <IoPlaySkipBack />
          </button>
          {playerDetails.state === PlayerState.PLAYING ? (
            <button onClick={actions.pauseVideo}>
              <IoPause />
            </button>
          ) : (
            <button onClick={actions.playVideo}>
              <IoPlay />
            </button>
          )}
          <button onClick={actions.nextVideo}>
            <IoPlaySkipForward />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
