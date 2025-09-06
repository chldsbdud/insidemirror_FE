import { useEffect, useState } from "react";
import { PlayerDetails, PlayerState } from "./types.ts";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Options {
  origin: string;
  autoplay: boolean;
  host: string; // e.g. "https://www.youtube.com" | "https://www.youtube-nocookie.com"
  loop: boolean; // playlist 배열 사용 시 onStateChange에서 수동 루프 처리
  start?: number;
  end?: number;
}

interface Props {
  /** videoId 또는 playlistId. 배열 플리 사용 시엔 첫 트랙 id 정도로만 쓰임(컨테이너/초기화 용) */
  id: string;
  type: "playlist" | "video";
  /** 배열 플레이리스트. ['Mr0aqxOppu8', '2o1zdX72400'] 같은 형태 */
  playlist?: string[];
  options?: Partial<Options>;
  events?: Partial<{
    onReady: (event: YT.PlayerEvent) => void;
    onStateChange: (event: YT.OnStateChangeEvent) => void;
    onError: (event: YT.OnErrorEvent) => void;
  }>;
}

interface Actions {
  playVideo: () => void;
  stopVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVolume: () => number;
  /** 특정 인덱스로 점프 (배열 플리/내장 플리 모두 작동) */
  playVideoAt: (index: number) => void;
  /** 배열 플리를 큐잉(자동재생 X) */
  cuePlaylist: (ids: string[], index?: number) => void;
  /** 배열 플리를 즉시 재생(자동재생 O) */
  loadPlaylist: (ids: string[], index?: number) => void;
  /** 단일 영상 교체 시 */
  loadVideoById: (id: string) => void;
}

interface YoutubeHook {
  playerDetails: PlayerDetails;
  actions: Actions;
}

let player: YT.Player | undefined;

/** 뷰포트 안쪽에 작은 투명 컨테이너를 보장(오디오 정책 안전) */
const ensureContainer = (id: string) => {
  const containerId = `youtube-player-${id}`;
  let el = document.getElementById(containerId) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = containerId;
    el.style.position = "fixed";
    el.style.right = "0";
    el.style.bottom = "0";
    el.style.width = "2px";
    el.style.height = "2px";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
  }
  return containerId;
};

const loadApiAndCreate = (containerId: string, options: YT.PlayerOptions) => {
  const create = () => {
    player = new window.YT.Player(containerId, options);
  };

  if (window.YT?.Player) {
    create();
    return;
  }

  // 중복 삽입 방지
  if (!document.querySelector("script[data-youtube-iframe-api]")) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.setAttribute("data-youtube-iframe-api", "true");
    document.head.appendChild(tag);
  }
  window.onYouTubeIframeAPIReady = () => create();
};

export const useYoutube = ({ id, type, playlist, options, events }: Props): YoutubeHook => {
  const defaults: Options = {
    origin: window.location.origin,
    autoplay: false,
    host: "https://www.youtube.com",
    loop: false,
    start: undefined,
    end: undefined,
  };
  const o: Options = { ...defaults, ...(options || {}) };

  /** 초기 생성 시 넣을 videoId (배열 플리면 첫 곡) */
  const initialVideoId = Array.isArray(playlist) && playlist.length > 0 ? playlist[0] : type === "video" ? id : undefined;

  const getPlayerOptions = (): YT.PlayerOptions => ({
    ...(initialVideoId ? { videoId: initialVideoId } : {}),
    host: o.host,
    playerVars: {
      origin: o.origin,
      autoplay: o.autoplay ? 1 : 0,
      loop: o.loop ? 1 : 0,
      start: o.start,
      end: o.end,
      playsinline: 1,
      // 내장 플레이리스트 ID로 재생하고 싶을 때(type=playlist & playlist 배열 미제공)
      ...(type === "playlist" && (!playlist || playlist.length === 0) ? { listType: "playlist", list: id } : {}),
      // 단일 비디오 루프 시 필요(문서 요건): playlist=videoId
      ...(type === "video" && o.loop && initialVideoId ? { playlist: initialVideoId } : {}),
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: (event: YT.PlayerEvent) => {
        try {
          const iframe = event.target.getIframe?.();
          iframe?.setAttribute("allow", "autoplay; encrypted-media");
        } catch {}
        event.target.unMute?.();
        event.target.setVolume?.(100);

        // 배열 플레이리스트가 있으면 onReady에서 로드/큐
        const hasList = Array.isArray(playlist) && playlist.length > 0;
        if (hasList) {
          if (o.autoplay) event.target.loadPlaylist(playlist!, 0);
          else event.target.cuePlaylist(playlist!, 0);
        }

        syncState(event.target);
        events?.onReady?.(event);
      },
      onStateChange: (event: YT.OnStateChangeEvent) => {
        syncState(event.target);

        // 배열 플레이리스트 + loop=true → 마지막 트랙 끝나면 처음으로
        if (o.loop && Array.isArray(playlist) && playlist.length > 0 && event.data === YT.PlayerState.ENDED) {
          const list = event.target.getPlaylist?.() || [];
          const idx = event.target.getPlaylistIndex?.() ?? 0;
          if (list.length && idx === list.length - 1) {
            event.target.playVideoAt(0);
          }
        }

        events?.onStateChange?.(event);
      },
      onError: (event: YT.OnErrorEvent) => {
        events?.onError?.(event);
      },
    },
  });

  const [playerDetails, setPlayerDetails] = useState<PlayerDetails>({
    id: "",
    state: PlayerState.UNSTARTED,
    title: "",
    duration: 0,
    currentTime: 0,
    volume: 0,
  });

  useEffect(() => {
    const containerId = ensureContainer(id);
    loadApiAndCreate(containerId, getPlayerOptions());

    return () => {
      try {
        player?.destroy();
      } catch {}
      const el = document.getElementById(containerId);
      el?.remove();
      player = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const syncState = (p: YT.Player) => {
    const vd = p.getVideoData?.() || ({} as any);
    const videoId = vd.video_id || "";
    setPlayerDetails({
      id: videoId,
      title: vd.title || "",
      state: p.getPlayerState?.() ?? PlayerState.UNSTARTED,
      duration: p.getDuration?.() ?? 0,
      currentTime: p.getCurrentTime?.() ?? 0,
      volume: p.getVolume?.() ?? 0,
      thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "",
    });
  };

  const proxy = (fn: string, args: unknown[] = []) => {
    const f = (player as any)?.[fn];
    if (typeof f === "function") return f.apply(player, args);
    console.error("Player not initialized.");
  };

  return {
    playerDetails,
    actions: {
      playVideo: () => proxy("playVideo"),
      stopVideo: () => proxy("stopVideo"),
      pauseVideo: () => proxy("pauseVideo"),
      nextVideo: () => proxy("nextVideo"),
      previousVideo: () => proxy("previousVideo"),
      setVolume: (volume: number) => {
        setPlayerDetails((s) => ({ ...s, volume }));
        proxy("setVolume", [volume]);
      },
      seekTo: (seconds: number, allowSeekAhead: boolean) => {
        setPlayerDetails((s) => ({ ...s, currentTime: seconds }));
        proxy("seekTo", [seconds, allowSeekAhead]);
      },
      mute: () => proxy("mute"),
      unMute: () => proxy("unMute"),
      isMuted: () => !!proxy("isMuted"),
      getVolume: () => (proxy("getVolume") as number) ?? 0,
      playVideoAt: (i: number) => proxy("playVideoAt", [i]),
      cuePlaylist: (ids: string[], i = 0) => proxy("cuePlaylist", [ids, i]),
      loadPlaylist: (ids: string[], i = 0) => proxy("loadPlaylist", [ids, i]),
      loadVideoById: (vid: string) => proxy("loadVideoById", [vid]),
    },
  };
};
