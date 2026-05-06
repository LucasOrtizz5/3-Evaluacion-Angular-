/// <reference types="cypress" />

// Este archivo valida el dashboard de administracion y la expansion de favoritos.

const {
  adminDashboardUsersResponse,
  apiSuccess,
  episodeCountResponse,
  locationCountResponse,
  profileUser,
} = require('../support/mocks');

describe('Admin dashboard', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess({
        ...profileUser,
        role: 'admin',
      }),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', '**/users/admin/favorites', {
      statusCode: 200,
      body: apiSuccess(adminDashboardUsersResponse),
    }).as('getAdminUsers');
  });

  it('muestra usuarios, expande favoritos y expone enlaces de episodios', () => {
    cy.visit('/auth/admin-dashboard');

    cy.wait('@getMe');
    cy.wait('@getAdminUsers');

    cy.contains('Usuarios y episodios favoritos').should('be.visible');

    // Esperar a que se renderice el item del usuario Admin
    cy.get('.admin-user-item').should('have.length.greaterThan', 0);
    cy.get('.admin-user-item').first().should('contain', 'Admin User');

    cy.contains('Morty Smith').should('be.visible');
    cy.contains('.badge', 'admin').should('be.visible');

    // Verificar que los links de favoritos existen en la primera pagina ANTES de expandir
    cy.contains('a', 'Episode 1 - Pilot')
      .should('have.attr', 'href')
      .and('include', '/episodes/1');

    // Ahora expandir favoritos de Admin User para ver mas episodios
    cy.get('.admin-user-item').first().within(() => {
      cy.contains('Show more favorites').click();
    });
    cy.contains('Episode 3 - Anatomy Park').should('be.visible');

    // Paginar usuarios para mostrar mas
    cy.contains('Show more users').click();
    cy.contains('Jerry Smith').should('be.visible');
  });
});
