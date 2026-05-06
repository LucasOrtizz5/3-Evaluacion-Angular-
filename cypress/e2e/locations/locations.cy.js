/// <reference types="cypress" />

// Este archivo valida la lista y el detalle de localizaciones.

const {
  apiSuccess,
  episodeCountResponse,
  locationDetailResponse,
  locationResidentsResponse,
  locationsListResponse,
  profileUser,
} = require('../support/mocks');

describe('Locations', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationsListResponse).as('getLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location/1', locationDetailResponse).as('getLocationDetail');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character/1,2', locationResidentsResponse).as('getLocationResidents');
  });

  it('muestra la lista y permite paginarla', () => {
    cy.visit('/locations');

    cy.wait('@getMe');
    cy.get('.location-card').should('have.length', 10);
    cy.contains('Citadel of Ricks').should('be.visible');

    cy.contains('Next').click();
    cy.get('.location-card').should('have.length', 2);
    cy.contains('Location 11').should('be.visible');
  });

  it('abre el detalle de una localizacion y muestra sus residentes', () => {
    cy.visit('/locations/1');

    cy.wait('@getMe');
    cy.wait('@getLocationDetail');
    cy.wait('@getLocationResidents');

    cy.contains('Info of the location').should('be.visible');
    cy.contains('Earth (C-137)').should('be.visible');
    cy.contains('Residents in this location').should('be.visible');
    cy.get('.location-resident-link').should('have.length', 2);
    cy.get('.location-resident-link').first().should('have.attr', 'href').and('include', '/characters/1');
  });
});
