export interface EpisodeComment {
  id: string;
  episodeId: number;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorRole: 'user' | 'admin';
  authorAvatarUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeCommentThreadState {
  episodeId: number;
  commentsLocked: boolean;
  lockedByUserId?: string;
  lockedByUserName?: string;
  lockedByUserRole?: 'user' | 'admin';
  lockedAt?: string;
}
