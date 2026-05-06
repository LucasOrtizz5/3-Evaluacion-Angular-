/// <reference types="cypress" />

// Este archivo valida los flujos de autenticacion: login, redirecciones y registro.

const {
  apiSuccess,
  apiUnauthorized,
  charactersListResponse,
  episodeCountResponse,
  locationCountResponse,
  profileUser,
  testUser,
} = require('../support/mocks');

describe('Auth flows', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 401,
      body: apiUnauthorized(),
    }).as('getMeUnauth');
  });

  it('permite iniciar sesion y redirige a characters', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { header: { resultCode: 0 } },
    }).as('postLogin');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', charactersListResponse).as('getCharacters');

    cy.visit('/auth/login');

    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password');

    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(testUser),
    }).as('getMeAuth');

    cy.get('[data-cy="login-submit-btn"]').click();

    cy.wait('@postLogin');
    cy.wait('@getMeAuth');

    cy.url().should('include', '/characters');
    cy.get('.card-title').should('have.length', 2);
  });

  it('redirige al usuario autenticado fuera de las rutas de invitado', () => {
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: apiSuccess(profileUser),
    }).as('getMeAuth');

    cy.intercept('GET', 'https://rickandmortyapi.com/api/episode?page=1*', episodeCountResponse).as('layoutEpisodes');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/location?page=1*', locationCountResponse).as('layoutLocations');
    cy.intercept('GET', 'https://rickandmortyapi.com/api/character?page=1*', charactersListResponse).as('getCharacters');

    cy.visit('/auth/login');
    cy.wait('@getMeAuth');
    cy.url().should('include', '/characters');

    cy.visit('/auth/register');
    cy.url().should('include', '/characters');
  });

  it('muestra validaciones y registra un usuario valido', () => {
    cy.visit('/auth/register');

    cy.contains('Sign Up').click();

    cy.contains('Please complete all fields correctly before signing up.').should('be.visible');
    cy.contains('Full name is required').should('be.visible');

    cy.get('input[formcontrolname="name"]').type('Jane Doe');
    cy.get('input[formcontrolname="email"]').type('jane@example.com');
    cy.get('input[formcontrolname="password"]').type('Secret12');
    cy.get('input[formcontrolname="confirmPassword"]').type('Secret12');
    cy.get('input[formcontrolname="address"]').type('Example Street 123');
    cy.get('input[formcontrolname="city"]').type('Cordoba');
    cy.get('input[formcontrolname="zip"]').type('5000');

    cy.intercept('POST', '**/auth/register', (req) => {
      expect(req.body).to.deep.equal({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Secret12',
        address: 'Example Street 123',
        city: 'Cordoba',
        country: 'Argentina',
        zip: '5000',
      });

      req.reply({
        statusCode: 200,
        body: apiSuccess({
          ...profileUser,
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
        }),
      });
    }).as('postRegister');

    cy.contains('Sign Up').click();

    cy.wait('@postRegister');
    cy.url().should('include', '/auth/login');
    cy.contains('Sign In').should('be.visible');
  });

  it('bloquea el registro cuando la password es demasiado corta', () => {
    cy.intercept('POST', '**/auth/register', () => {
      throw new Error('El registro no deberia enviarse con una password invalida');
    }).as('postRegisterInvalidShort');

    cy.visit('/auth/register');

    cy.get('input[formcontrolname="name"]').type('Test User');
    cy.get('input[formcontrolname="email"]').type('test@example.com');
    
    // Hacer focus en password para activar showPasswordRequirements
    cy.get('input[formcontrolname="password"]').focus();
    cy.get('input[formcontrolname="password"]').type('S1a');
    
    // Verificar que se muestra la lista de requisitos
    cy.get('.auth-password-requirements').should('be.visible');
    // El primer requisito debe estar incumplido (rojo, sin clase --met)
    cy.get('.auth-password-requirement').first().should('not.have.class', 'auth-password-requirement--met');

    cy.get('input[formcontrolname="confirmPassword"]').type('S1a');
    cy.get('input[formcontrolname="address"]').type('Test Street 123');
    cy.get('input[formcontrolname="city"]').type('Test City');
    cy.get('input[formcontrolname="zip"]').type('12345');

    // Intentar enviar el formulario
    cy.contains('button', 'Sign Up').click();
    // Deberia mostrar mensaje de validacion pero no enviar la request
    cy.contains('Please complete all fields correctly before signing up').should('be.visible');
  });

  it('bloquea el registro cuando falta una mayuscula o un numero', () => {
    cy.intercept('POST', '**/auth/register', () => {
      throw new Error('El registro no deberia enviarse con una password invalida');
    }).as('postRegisterInvalidStrength');

    cy.visit('/auth/register');

    cy.get('input[formcontrolname="name"]').type('Test User');
    cy.get('input[formcontrolname="email"]').type('test@example.com');
    
    // Hacer focus en password para activar showPasswordRequirements
    cy.get('input[formcontrolname="password"]').focus();
    cy.get('input[formcontrolname="password"]').type('secret12');
    
    // Verificar que se muestra la lista de requisitos
    cy.get('.auth-password-requirements').should('be.visible');
    // El segundo requisito (mayuscula) debe estar incumplido
    cy.get('.auth-password-requirement').eq(1).should('not.have.class', 'auth-password-requirement--met');

    cy.get('input[formcontrolname="confirmPassword"]').type('secret12');
    cy.get('input[formcontrolname="address"]').type('Test Street 123');
    cy.get('input[formcontrolname="city"]').type('Test City');
    cy.get('input[formcontrolname="zip"]').type('12345');

    // Intentar enviar el formulario
    cy.contains('button', 'Sign Up').click();
    // Deberia mostrar mensaje de validacion pero no enviar la request
    cy.contains('Please complete all fields correctly before signing up').should('be.visible');
  });
});
