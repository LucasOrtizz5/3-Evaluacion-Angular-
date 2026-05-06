const testUser = require('../../fixtures/test-user.json');
const charactersFixture = require('../../fixtures/characters.json');

const clone = (value) => JSON.parse(JSON.stringify(value));

const apiSuccess = (data) => ({
  header: {
    resultCode: 0,
  },
  data,
});

const apiUnauthorized = () => ({
  header: {
    resultCode: 1,
    error: 'Unauthorized',
  },
});

const profileUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  nickname: 'Old Nick',
  birthDate: '1990-01-01',
  city: 'Cordoba',
  country: 'Argentina',
  address: 'Av. Siempre Viva 123',
  profileImageUrl: '',
};

const adminUser = {
  id: '99',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  nickname: 'Boss',
  birthDate: '1985-08-20',
  city: 'Buenos Aires',
  country: 'Argentina',
  address: 'Admin Street 1',
  profileImageUrl: '',
};

const makeEpisode = (id, overrides = {}) => ({
  id,
  name: `Episode ${id}`,
  air_date: `2021-01-${String(id).padStart(2, '0')}`,
  episode: `S01E${String(id).padStart(2, '0')}`,
  characters: [
    'https://rickandmortyapi.com/api/character/1',
    'https://rickandmortyapi.com/api/character/2',
  ],
  url: `https://rickandmortyapi.com/api/episode/${id}`,
  created: '2021-01-01T00:00:00.000Z',
  ...overrides,
});

const makeLocation = (id, overrides = {}) => ({
  id,
  name: `Location ${id}`,
  type: 'Planet',
  dimension: `Dimension ${id}`,
  residents: [],
  url: `https://rickandmortyapi.com/api/location/${id}`,
  created: '2021-01-01T00:00:00.000Z',
  ...overrides,
});

const makeFavoriteEpisode = (id, overrides = {}) => ({
  id,
  name: `Episode ${id}`,
  episode: `S01E${String(id).padStart(2, '0')}`,
  air_date: `2021-01-${String(id).padStart(2, '0')}`,
  ...overrides,
});

const makeComment = (overrides = {}) => ({
  id: 'c-1',
  episodeId: 1,
  authorId: testUser.id,
  authorName: testUser.name,
  authorEmail: testUser.email,
  authorRole: 'user',
  authorAvatarUrl: '',
  content: 'Great episode!',
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: '2024-01-01T10:00:00.000Z',
  ...overrides,
});

const makePageInfo = (count) => ({
  count,
  pages: Math.max(Math.ceil(count / 10), 1),
  next: null,
  prev: null,
});

const charactersListResponse = clone(charactersFixture);

const charactersSearchResponse = {
  ...clone(charactersFixture),
  info: {
    ...clone(charactersFixture.info),
    count: 1,
  },
  results: [clone(charactersFixture.results[0])],
};

const characterDetailResponse = {
  ...clone(charactersFixture.results[0]),
  episode: [
    'https://rickandmortyapi.com/api/episode/1',
    'https://rickandmortyapi.com/api/episode/2',
  ],
};

const characterEpisodesResponse = [
  makeEpisode(1, {
    name: 'Pilot',
    air_date: 'December 2, 2013',
    episode: 'S01E01',
  }),
  makeEpisode(2, {
    name: 'Lawnmower Dog',
    air_date: 'December 9, 2013',
    episode: 'S01E02',
  }),
];

const charactersCountResponse = {
  info: makePageInfo(2),
  results: [],
};

const episodeCountResponse = {
  info: makePageInfo(12),
  results: [],
};

const episodesListResponse = {
  info: makePageInfo(12),
  results: Array.from({ length: 12 }, (_, index) => {
    const id = index + 1;
    return makeEpisode(id, index === 0
      ? {
          name: 'Pilot',
          air_date: 'December 2, 2013',
          episode: 'S01E01',
        }
      : {});
  }),
};

const episodesSearchResponse = {
  info: makePageInfo(1),
  results: [
    makeEpisode(1, {
      name: 'Pilot',
      air_date: 'December 2, 2013',
      episode: 'S01E01',
    }),
  ],
};

const episodeDetailResponse = makeEpisode(1, {
  name: 'Pilot',
  air_date: 'December 2, 2013',
  episode: 'S01E01',
});

const favoriteEpisodesResponse = [
  makeFavoriteEpisode(1, {
    name: 'Pilot',
  }),
  makeFavoriteEpisode(2, {
    name: 'Lawnmower Dog',
  }),
  makeFavoriteEpisode(3, {
    name: 'Anatomy Park',
  }),
];

const locationCountResponse = {
  info: makePageInfo(12),
  results: [],
};

const locationsListResponse = {
  info: makePageInfo(12),
  results: Array.from({ length: 12 }, (_, index) => {
    const id = index + 1;
    return makeLocation(id, index === 0
      ? {
          name: 'Citadel of Ricks',
          type: 'Space station',
          dimension: 'Dimension C-137',
          residents: [
            'https://rickandmortyapi.com/api/character/1',
            'https://rickandmortyapi.com/api/character/2',
          ],
        }
      : {
          name: `Location ${id}`,
          type: id % 2 === 0 ? 'Planet' : 'Cluster',
          dimension: `Dimension ${id}`,
          residents: id % 2 === 0
            ? ['https://rickandmortyapi.com/api/character/1']
            : [],
        });
  }),
};

const locationDetailResponse = makeLocation(1, {
  name: 'Earth (C-137)',
  type: 'Planet',
  dimension: 'Dimension C-137',
  residents: [
    'https://rickandmortyapi.com/api/character/1',
    'https://rickandmortyapi.com/api/character/2',
  ],
});

const locationResidentsResponse = clone(charactersFixture.results);

const adminDashboardUsersResponse = [
  {
    ...adminUser,
    favorites: [
      makeFavoriteEpisode(1, { name: 'Pilot' }),
      makeFavoriteEpisode(2, { name: 'Lawnmower Dog' }),
      makeFavoriteEpisode(3, { name: 'Anatomy Park' }),
    ],
  },
  {
    id: '2',
    name: 'Morty Smith',
    email: 'morty@example.com',
    role: 'user',
    nickname: 'Morty',
    birthDate: '2000-01-01',
    profileImageUrl: '',
    favorites: [
      makeFavoriteEpisode(4, { name: 'M. Night Shaym-Aliens!' }),
      makeFavoriteEpisode(5, { name: 'Meeseeks and Destroy' }),
    ],
  },
  {
    id: '3',
    name: 'Summer Smith',
    email: 'summer@example.com',
    role: 'user',
    nickname: 'Summer',
    birthDate: '2002-05-18',
    profileImageUrl: '',
    favorites: [
      makeFavoriteEpisode(6, { name: 'Rick Potion #9' }),
    ],
  },
  {
    id: '4',
    name: 'Beth Smith',
    email: 'beth@example.com',
    role: 'user',
    nickname: 'Beth',
    birthDate: '1979-03-03',
    profileImageUrl: '',
    favorites: [
      makeFavoriteEpisode(7, { name: 'Rixty Minutes' }),
    ],
  },
  {
    id: '5',
    name: 'Jerry Smith',
    email: 'jerry@example.com',
    role: 'user',
    nickname: 'Jerry',
    birthDate: '1978-01-01',
    profileImageUrl: '',
    favorites: [
      makeFavoriteEpisode(8, { name: 'Something Ricked This Way Comes' }),
      makeFavoriteEpisode(9, { name: 'Close Rick-counters of the Rick Kind' }),
    ],
  },
];

const episodeCommentsResponse = (comments = [makeComment()], commentsLocked = false, episodeId = 1) => apiSuccess({
  comments,
  thread: {
    episodeId,
    commentsLocked,
  },
});

module.exports = {
  adminDashboardUsersResponse,
  adminUser,
  apiSuccess,
  apiUnauthorized,
  characterDetailResponse,
  characterEpisodesResponse,
  charactersCountResponse,
  charactersListResponse,
  charactersSearchResponse,
  clone,
  episodeCommentsResponse,
  episodeCountResponse,
  episodeDetailResponse,
  episodesListResponse,
  episodesSearchResponse,
  favoriteEpisodesResponse,
  locationCountResponse,
  locationDetailResponse,
  locationResidentsResponse,
  locationsListResponse,
  makeComment,
  makeFavoriteEpisode,
  makeEpisode,
  makeLocation,
  profileUser,
  testUser,
};
