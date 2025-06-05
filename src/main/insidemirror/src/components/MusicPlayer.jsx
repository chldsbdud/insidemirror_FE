import React, { useRef, useEffect, useState } from "react";
import { IoPause, IoPlay, IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { useYoutube } from "../useYoutube.ts";
import { PlayerState } from "../types.ts";
import "../styles/MusicPlayer.css";
import SoundWave from "../img/sound-wave.png";

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

  // 버튼 refs
  const prevBtnRef = useRef(null);
  const playPauseBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  // 좌표 출력
  useEffect(() => {
    const timer = setTimeout(() => {
      const logRect = (label, ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          console.log(`${label} 버튼 좌표:`, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
        }
      };

      logRect("이전", prevBtnRef);
      logRect("재생/일시정지", playPauseBtnRef);
      logRect("다음", nextBtnRef);
    }, 300); // 렌더 이후 300ms 지연

    return () => clearTimeout(timer);
  }, [playerDetails.state]);

  return (
    <div className="player-container">
      <div className="music-player-container">
        <div className="nowPlayBox">
          <img src={SoundWave} alt="soundwave" />
          <div>Now Playing</div>
        </div>

        <div className="music-info">
          <div className="music-title">{playerDetails.title}</div>
          <div className="music-author">{playerDetails.author}</div>
        </div>

        <div className="music-controls">
          <button ref={prevBtnRef} onClick={actions.previousVideo}>
            <IoPlaySkipBack />
          </button>

          <button ref={playPauseBtnRef} onClick={playerDetails.state === PlayerState.PLAYING ? actions.pauseVideo : actions.playVideo}>
            {playerDetails.state === PlayerState.PLAYING ? <IoPause /> : <IoPlay />}
          </button>

          <button ref={nextBtnRef} onClick={actions.nextVideo}>
            <IoPlaySkipForward />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
