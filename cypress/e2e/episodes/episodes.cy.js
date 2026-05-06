/// <reference types="cypress" />

// Este archivo valida la lista de episodios, su busqueda y el toggle de favoritos.

const {
  apiSuccess,
  episodeCountResponse,
  episodesListResponse,
  episodesSearchResponse,
  locationCountResponse,
  profileUser,
} = require('../support/mocks');

describe('Episodes list', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodesListResponse).as('getEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*&name=Pilot*', episodesSearchResponse).as('searchEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', '**/episodes/favorites', {
      statusCode: 200,
      body: apiSuccess([]),
    }).as('getFavorites');
  });

  it('muestra tarjetas y permite paginar la lista', () => {
    cy.visit('/episodes');

    cy.wait('@getMe');
    cy.wait('@getFavorites');

    cy.get('.episode-card').should('have.length', 10);
    cy.contains('Episode 1').should('be.visible');

    cy.contains('Next').click();
    cy.get('.episode-card').should('have.length', 2);
    cy.contains('Episode 11').should('be.visible');
  });

  it('filtra por texto y alterna favoritos', () => {
    cy.intercept('POST', '**/episodes/favorites', (req) => {
      expect(req.body).to.deep.include({
        id: 1,
        name: 'Pilot',
        episode: 'S01E01',
        air_date: 'December 2, 2013',
      });

      req.reply({
        statusCode: 200,
        body: apiSuccess(req.body),
      });
    }).as('postFavorite');

    cy.visit('/episodes');

    cy.wait('@getMe');
    cy.wait('@getFavorites');

    cy.get('input.search-input-custom').type('Pilot{enter}');
    cy.wait('@searchEpisodes');
    cy.get('.episode-card').should('have.length', 1);
    cy.contains('Pilot').should('be.visible');

    cy.get('.episode-favorite-btn').first().click();
    cy.wait('@postFavorite');
    cy.get('.episode-favorite-btn').first().should('have.attr', 'aria-label', 'Quitar de favoritos');
  });
});
