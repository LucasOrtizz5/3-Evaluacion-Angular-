import { BreadcrumbComponent } from './breadcrumb';
import { provideRouter } from '@angular/router';

// Este archivo valida la navegacion del breadcrumb y el filtrado de labels invalidos.

describe('BreadcrumbComponent', () => {
  // Verifica que los items intermedios sean links y el ultimo quede como texto.
  it('muestra enlaces intermedios y deja el ultimo elemento como texto', () => {
    cy.mount(BreadcrumbComponent, {
      componentProperties: {
        items: [
          { label: 'Home', url: '/' },
          { label: 'Characters', url: '/characters' },
          { label: 'Detail' },
        ],
      },
      providers: [provideRouter([])],
    });

    cy.contains('a', 'Home').should('have.attr', 'href').and('include', '/');
    cy.contains('a', 'Characters').should('have.attr', 'href').and('include', '/characters');
    cy.contains('.breadcrumb-current', 'Detail').should('be.visible');
  });

  it('omite items vacios o con espacios', () => {
    cy.mount(BreadcrumbComponent, {
      componentProperties: {
        items: [
          { label: 'Home', url: '/' },
          { label: '   ' },
          { label: 'Characters' },
        ],
      },
      providers: [provideRouter([])],
    });

    // Verificar que Home es un link
    cy.contains('a.breadcrumb-link', 'Home').should('be.visible');
    // Verificar que Characters es texto (ultimo elemento, sin link)
    cy.contains('span.breadcrumb-current', 'Characters').should('be.visible');
    // Verificar que no hay dos links (el item vacio debe ser omitido)
    cy.get('.breadcrumb-link').should('have.length', 1);
  });
});
