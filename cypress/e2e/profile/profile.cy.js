/// <reference types="cypress" />

// Este archivo valida la edicion de perfil y la gestion de favoritos.

const {
  apiSuccess,
  episodeCountResponse,
  favoriteEpisodesResponse,
  locationCountResponse,
  profileUser,
} = require('../support/mocks');

describe('Profile page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', '**/episodes/favorites', {
      statusCode: 200,
      body: apiSuccess(favoriteEpisodesResponse),
    }).as('getFavorites');
  });

  it('edita los datos del perfil y conserva el borrador visible', () => {
    const updatedUser = {
      ...profileUser,
      nickname: 'Neo Nick',
      birthDate: '1994-04-15',
    };

    cy.intercept('PATCH', '**/users/profile', (req) => {
      expect(req.body).to.deep.equal({
        nickname: 'Neo Nick',
        birthDate: '1994-04-15',
      });

      req.reply({
        statusCode: 200,
        body: apiSuccess(updatedUser),
      });
    }).as('patchProfile');

    cy.visit('/auth/profile');

    cy.wait('@getMe');
    cy.wait('@getFavorites');

    cy.contains('User Info').should('be.visible');
    cy.contains('Favorite episodes').should('be.visible');
    cy.contains('Test User').should('be.visible');

    cy.get('[aria-label="Editar datos"]').click();
    cy.get('#profile-nickname').clear().type('Neo Nick');
    cy.get('#profile-birth-date').clear().type('1994-04-15');
    cy.get('#profile-location').clear().type('Neo Buenos Aires');
    cy.get('[aria-label="Guardar datos"]').click();

    cy.wait('@patchProfile');
    cy.contains('Neo Nick').should('be.visible');
    cy.contains('1994-04-15').should('be.visible');
    cy.contains('Neo Buenos Aires').should('be.visible');
  });

  it('permite quitar episodios de favoritos desde el perfil', () => {
    cy.intercept('DELETE', '**/episodes/favorites/1', {
      statusCode: 200,
      body: apiSuccess({}),
    }).as('deleteFavorite');

    cy.visit('/auth/profile');

    cy.wait('@getMe');
    cy.wait('@getFavorites');

    cy.get('[aria-label="Eliminar favoritos"]').click();
    cy.get('[aria-label="Quitar favorito"]').first().click();

    cy.wait('@deleteFavorite');
    cy.contains('Episodes 1 - Pilot').should('not.exist');
  });
});
