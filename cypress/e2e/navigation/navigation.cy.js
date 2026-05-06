/// <reference types="cypress" />

// Este archivo valida la navegacion principal y la pantalla 404.

const {
  apiSuccess,
  charactersListResponse,
  episodesListResponse,
  locationsListResponse,
  profileUser,
} = require('../support/mocks');

describe('Navigation and not found', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodesListResponse).as('getEpisodeShell');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationsListResponse).as('getLocationShell');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', charactersListResponse).as('getCharacters');
  });

  it('recorre las secciones principales autenticadas', () => {
    cy.visit('/characters');
    cy.wait('@getMe');
    cy.get('.card-title').should('have.length', 2);

    cy.contains('Episodes').click();
    cy.url().should('include', '/episodes');
    cy.contains('Episodes').should('be.visible');

    cy.contains('Locations').click();
    cy.url().should('include', '/locations');
    cy.contains('Locations').should('be.visible');

    cy.contains('Characters').click();
    cy.url().should('include', '/characters');

    cy.contains('Test User').click();
    cy.contains('Profile').click();
    cy.url().should('include', '/auth/profile');
    cy.contains('User Info').should('be.visible');
  });

  it('muestra la pagina no encontrada en rutas inexistentes', () => {
    cy.visit('/multiverse/unknown-route');

    cy.contains('404').should('be.visible');
    cy.contains('You got lost in the multiverse').should('be.visible');
    cy.contains('Take Me To Characters').should('be.visible');
  });
});
