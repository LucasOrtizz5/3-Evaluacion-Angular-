/// <reference types="cypress" />

// Este archivo valida el detalle de un episodio, sus comentarios y favoritos.

const {
  apiSuccess,
  characterDetailResponse,
  characterEpisodesResponse,
  episodeCommentsResponse,
  episodeCountResponse,
  episodeDetailResponse,
  makeFavoriteEpisode,
  locationCountResponse,
  profileUser,
} = require('../support/mocks');

describe('Episode detail', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode/1', episodeDetailResponse).as('getEpisodeDetail');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character/1,2', characterDetailResponse).as('getEpisodeCharacters');
    cy.intercept('GET', '**/episodes/1/comments', {
      statusCode: 200,
      body: episodeCommentsResponse([], false, 1),
    }).as('getComments');
    cy.intercept('GET', '**/episodes/favorites', {
      statusCode: 200,
      body: apiSuccess([
        makeFavoriteEpisode(1, {
          name: 'Pilot',
          air_date: 'December 2, 2013',
        }),
      ]),
    }).as('getFavorites');
  });

  it('muestra la informacion del episodio y permite publicar un comentario', () => {
    cy.intercept('POST', '**/episodes/1/comments', (req) => {
      expect(req.body).to.deep.equal({ content: 'Great episode from Cypress' });

      req.reply({
        statusCode: 200,
        body: apiSuccess({
          id: 'c-2',
          episodeId: 1,
          authorId: profileUser.id,
          authorName: profileUser.name,
          authorEmail: profileUser.email,
          authorRole: 'user',
          authorAvatarUrl: '',
          content: 'Great episode from Cypress',
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
        }),
      });
    }).as('postComment');

    cy.visit('/episodes/1');

    cy.wait('@getMe');
    cy.wait('@getComments');

    cy.contains('Info of the episode').should('be.visible');
    cy.contains('Pilot').should('be.visible');
    cy.contains('Characters in this episode').should('be.visible');
    cy.contains('Comments').should('be.visible');
    cy.contains('No characters available for this episode.').should('not.exist');

    cy.get('#comment-content').type('Great episode from Cypress');
    cy.contains('Publicar').click();

    cy.wait('@postComment');
    cy.contains('Great episode from Cypress').should('be.visible');
  });

  it('permite alternar el estado de favorito del episodio', () => {
    cy.intercept('DELETE', '**/episodes/favorites/1', {
      statusCode: 200,
      body: apiSuccess({}),
    }).as('deleteFavorite');

    cy.visit('/episodes/1');

    cy.wait('@getMe');
    cy.wait('@getComments');

    cy.contains('♥ Favorite').should('be.visible');
    cy.contains('♥ Favorite').click();

    cy.wait('@deleteFavorite');
    cy.contains('♡ Favorite').should('be.visible');
  });
});
