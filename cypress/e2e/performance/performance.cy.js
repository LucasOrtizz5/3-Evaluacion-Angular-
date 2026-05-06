/// <reference types="cypress" />

// Este archivo valida una referencia simple de tiempo de carga en la app.

const {
  apiSuccess,
  charactersListResponse,
  episodeCountResponse,
  locationCountResponse,
  profileUser,
} = require('../support/mocks');

describe('Performance', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', charactersListResponse).as('getCharacters');
  });

  it('carga la pagina principal dentro de un tiempo razonable', () => {
    const startedAt = Date.now();

    cy.visit('/characters');

    cy.wait('@getMe');
    cy.wait('@getCharacters');
    cy.get('.card-title').should('have.length', 2);

    cy.then(() => {
      const elapsedMs = Date.now() - startedAt;
      expect(elapsedMs).to.be.lessThan(5000);
    });
  });
});
