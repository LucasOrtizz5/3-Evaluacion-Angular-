import { SearchBarComponent } from './search-bar';

describe('SearchBarComponent', () => {
  // Renderiza con placeholder por defecto
  it('renderiza con placeholder por defecto', () => {
    cy.mount(SearchBarComponent);

    cy.get('input')
      .should('have.attr', 'placeholder')
      .and('include', 'Search...');
  });

  // Usa placeholder personalizado
  it('usa placeholder personalizado', () => {
    cy.mount(SearchBarComponent, {
      componentProperties: {
        placeholder: 'Search characters...',
      },
    });

    cy.get('input')
      .should('have.attr', 'placeholder')
      .and('include', 'Search characters...');
  });

  // Botón muestra label por defecto
  it('botón muestra label por defecto', () => {
    cy.mount(SearchBarComponent);

    cy.contains('button', 'Search').should('be.visible');
  });

  // Botón muestra label personalizado
  it('botón muestra label personalizado', () => {
    cy.mount(SearchBarComponent, {
      componentProperties: {
        buttonLabel: 'Find',
      },
    });

    cy.contains('button', 'Find').should('be.visible');
  });

  // Emite evento cuando hace click en boton
  it('emite evento search cuando hace click en boton', () => {
    let searchTerm = '';
    cy.mount(SearchBarComponent, {
      componentProperties: {
        buttonLabel: 'Search',
      },
    }).then(({ component }) => {
      // Subscribirse al evento
      component.search.subscribe((term: string) => {
        searchTerm = term;
      });
    });

    cy.get('input').type('Rick');
    cy.contains('button', 'Search').click();

    cy.then(() => {
      expect(searchTerm).to.equal('Rick');
    });
  });

  // Emite evento cuando presiona Enter
  it('emite evento cuando presiona Enter en el input', () => {
    let searchTerm = '';
    cy.mount(SearchBarComponent).then(({ component }) => {
      component.search.subscribe((term: string) => {
        searchTerm = term;
      });
    });

    cy.get('input').type('Morty{enter}');

    cy.then(() => {
      expect(searchTerm).to.equal('Morty');
    });
  });

  // El input retiene el valor despues de buscar
  it('retiene el valor del input despues de buscar', () => {
    cy.mount(SearchBarComponent);

    cy.get('input').type('test');
    cy.contains('button', 'Search').click();
    cy.get('input').should('have.value', 'test');
  });
});
