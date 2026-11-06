export type Category = "recent" | "finished" | "wish";

export type Profile = {
  /** 프로필 토큰 교환에 사용하는 프로필 ID */
  id: number;
  /** 최근 본/목록 조회 경로에 사용하는 user_id */
  userId: number;
  name: string;
  image: string | null;
  isMain: boolean;
};

export type AnimeItem = {
  id: number;
  title: string;
  image: string | null;
  averageRating: number | null;
  genres: string[];
};

export type ItemPool = {
  items: AnimeItem[];
  count: number;
};

export type ProfilesResponse = {
  profiles: Profile[];
};

export type ApiErrorBody = {
  message: string;
};
