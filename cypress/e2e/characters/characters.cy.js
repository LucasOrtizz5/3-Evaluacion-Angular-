/// <reference types="cypress" />

// Este archivo valida listado, busqueda, paginacion y errores de la seccion de personajes.

const {
  apiSuccess,
  characterDetailResponse,
  characterEpisodesResponse,
  charactersListResponse,
  charactersSearchResponse,
  episodeCountResponse,
  locationCountResponse,
  testUser,
} = require('../support/mocks');

const buildCharactersPageResponse = () => {
  const baseCharacter = charactersListResponse.results[0];

  return {
    info: {
      ...charactersListResponse.info,
      count: 20,
    },
    results: Array.from({ length: 20 }, (_, index) => ({
      ...baseCharacter,
      id: index + 1,
      name: `Character ${index + 1}`,
    })),
  };
};

describe('Characters page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(testUser),
    }).as('getMe');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', buildCharactersPageResponse()).as('getCharacters');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*&name=Rick*', charactersSearchResponse).as('searchCharacters');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character/1', characterDetailResponse).as('getCharacterDetail');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode/1,2', characterEpisodesResponse).as('getCharacterEpisodes');
  });

  it('muestra el listado y permite paginar', () => {
    cy.visit('/characters');

    cy.wait('@getMe');
    cy.wait('@getCharacters');
    cy.get('.card-title').should('have.length', 10);
    cy.contains('.card-title', 'Character 1').should('be.visible');

    cy.contains('Next').should('be.visible').click();
    cy.wait('@getCharacters');
    cy.get('.card-title').should('have.length', 10);
    cy.contains('.card-title', 'Character 11').should('be.visible');
  });

  it('permite buscar un personaje y abrir su detalle', () => {
    cy.visit('/characters');

    cy.wait('@getMe');
    cy.wait('@getCharacters');

    cy.get('input.search-input-custom').type('Rick{enter}');
    cy.wait('@searchCharacters');
    cy.get('.card-title').should('have.length', 1);
    cy.contains('.card-title', 'Rick Sanchez').should('be.visible');

    cy.get('a .card').first().parent('a').click();

    cy.url().should('include', '/characters/1');
    cy.contains('Character Info').should('be.visible');
    cy.contains('Rick Sanchez').should('be.visible');
    cy.contains('List of Episodes appearances').should('be.visible');
    cy.contains('Episode 1 - Pilot').should('be.visible');
    cy.contains('Episode 2 - Lawnmower Dog').should('be.visible');
  });

  it('muestra un mensaje de error si falla la API', () => {
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', {
      statusCode: 500,
      body: 'Server error',
    }).as('getCharactersError');

    cy.visit('/characters');

    cy.wait('@getCharactersError');
    cy.contains('No se encontraron personajes. Intenta con otro nombre o recarga la página.').should('be.visible');
  });
});
