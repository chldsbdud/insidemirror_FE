import React, { useEffect, useRef, useState } from "react";
import { IoPause, IoPlay, IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";
import { useYoutube } from "../useYoutube.ts";
import { PlayerState } from "../types.ts";
import "../styles/MusicPlayer.css";
import SoundWave from "../img/sound-wave.png";

// 재생목록 여러 개를 상수로 보관 (원하는 만큼 추가)
const TRACKS = ["Yqscc_48tPY", "msGuqelopMA", "2o1zdX72400"];

export default function MusicPlayer() {
  // 여러 재생목록 중 하나 선택 (원하면 버튼으로 바꿔도 됨)
  const [plIdx] = useState(0);

  const { playerDetails, actions } = useYoutube({
    id: TRACKS[0],
    type: "playlist",
    playlist: TRACKS,
    options: { autoplay: false, mute: false, loop: true },

    events: {
      onError: (e) => console.warn("YT onError:", e?.data),
      onStateChange: (e) => console.log("YT state:", e?.data),
      onReady: () => console.log("YT ready"),
    },
  });

  // YouTube가 body에 만드는 컨테이너를 화면 밖으로 숨김(오디오만)
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-hide-yt", "true");
    style.textContent = `
      div[id^="youtube-player-"] {
        position: absolute !important;
        left: -9999px !important;
        top: 0 !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // 버튼 refs (네가 찍던 로그 유지)
  const prevBtnRef = useRef(null);
  const playPauseBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const log = (label, ref) => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect();
          console.log(`${label} 버튼 좌표:`, { x: r.left, y: r.top, width: r.width, height: r.height });
        }
      };
      log("이전", prevBtnRef);
      log("재생/일시정지", playPauseBtnRef);
      log("다음", nextBtnRef);
    }, 300);
    return () => clearTimeout(t);
  }, [playerDetails.state]);

  // ▶ 재생/일시정지
  const handlePlayPause = () => {
    // 초기엔 playerDetails.id가 비어 있을 수 있으니 가드
    if (!playerDetails?.id && playerDetails.state === PlayerState.UNSTARTED) return;
    actions.unMute?.();
    actions.setVolume?.(100);

    if (playerDetails.state === PlayerState.PLAYING) actions.pauseVideo();
    else actions.playVideo();
  };

  // ▶ 이전/다음 (플레이리스트 트랙 이동)
  const handlePrev = () => actions.previousVideo();
  const handleNext = () => actions.nextVideo();

  // 버튼 비활성 조건(최초 로드 전에는 동작 안 하도록)
  const disabled = !playerDetails?.id && playerDetails.state === PlayerState.UNSTARTED;

  return (
    <div className="player-container">
      <div className="music-player-container">
        <div className="nowPlayBox">
          <img src={SoundWave} alt="soundwave" />
          <div>Now Playing</div>
        </div>

        <div className="music-info">
          <div className="music-title">{playerDetails.title || "—"}</div>
          {/* types.ts에는 author가 없으니 표시는 생략 */}
          {/* <div className="music-author">{playerDetails.author || ""}</div> */}
        </div>

        <div className="music-controls">
          <button ref={prevBtnRef} onClick={handlePrev} disabled={disabled}>
            <IoPlaySkipBack />
          </button>

          <button ref={playPauseBtnRef} onClick={handlePlayPause} disabled={disabled}>
            {playerDetails.state === PlayerState.PLAYING ? <IoPause /> : <IoPlay />}
          </button>

          <button ref={nextBtnRef} onClick={handleNext} disabled={disabled}>
            <IoPlaySkipForward />
          </button>
        </div>
      </div>
    </div>
  );
}
