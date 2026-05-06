import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DetailMoreListComponent } from './detail-more-list';

// Este archivo valida el renderizado de items, estado vacio y accion de "ver mas".

@Component({
  selector: 'app-detail-more-list-items-host',
  standalone: true,
  imports: [DetailMoreListComponent, CommonModule],
  template: `
    <app-detail-more-list
      [items]="items"
      [hasMore]="false"
      [emptyMessage]="''"
      [moreLabel]="'Cargar más'"
      [itemTemplate]="itemTemplate"
    ></app-detail-more-list>

    <ng-template #itemTemplate let-item="$implicit">
      <div class="test-item">{{ item.name }}</div>
    </ng-template>
  `,
})
class DetailMoreListItemsHostComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];
}

@Component({
  selector: 'app-detail-more-list-more-host',
  standalone: true,
  imports: [DetailMoreListComponent, CommonModule],
  template: `
    <app-detail-more-list
      [items]="items"
      [hasMore]="hasMore"
      [emptyMessage]="''"
      [moreLabel]="'Cargar más'"
      [itemTemplate]="itemTemplate"
      (more)="moreCount = moreCount + 1"
    ></app-detail-more-list>

    <ng-template #itemTemplate let-item="$implicit">
      <div class="test-item">{{ item.name }}</div>
    </ng-template>

    <div class="more-count">{{ moreCount }}</div>
  `,
})
class DetailMoreListMoreHostComponent {
  items = [{ id: 1, name: 'Item 1' }];
  hasMore = true;
  moreCount = 0;
}

@Component({
  selector: 'app-detail-more-list-empty-message-host',
  standalone: true,
  imports: [DetailMoreListComponent, CommonModule],
  template: `
    <app-detail-more-list
      [items]="[]"
      [hasMore]="false"
      [emptyMessage]="'No hay items para mostrar'"
      [moreLabel]="'Cargar más'"
      [itemTemplate]="itemTemplate"
    ></app-detail-more-list>

    <ng-template #itemTemplate let-item="$implicit">
      <div class="test-item">{{ item.name }}</div>
    </ng-template>
  `,
})
class DetailMoreListEmptyMessageHostComponent {}

@Component({
  selector: 'app-detail-more-list-empty-host',
  standalone: true,
  imports: [DetailMoreListComponent, CommonModule],
  template: `
    <app-detail-more-list
      [items]="[]"
      [hasMore]="false"
      [emptyMessage]="''"
      [moreLabel]="'Cargar más'"
      [itemTemplate]="itemTemplate"
    ></app-detail-more-list>

    <ng-template #itemTemplate let-item="$implicit">
      <div class="test-item">{{ item.name }}</div>
    </ng-template>
  `,
})
class DetailMoreListEmptyHostComponent {}

describe('DetailMoreListComponent', () => {
  // Verifica que el template reciba y pinte correctamente cada item.
  it('renderiza items con template personalizado', () => {
    cy.mount(DetailMoreListItemsHostComponent);

    cy.get('.test-item').should('have.length', 2);
    cy.contains('Item 1').should('be.visible');
    cy.contains('Item 2').should('be.visible');
  });

  // Verifica que el boton no aparezca cuando no hay mas resultados.
  it('muestra boton more solo cuando hasMore es verdadero', () => {
    cy.mount(DetailMoreListItemsHostComponent);

    cy.get('button.ui-more-btn').should('not.exist');
  });

  // Verifica que el boton aparezca cuando el componente indica que hay mas.
  it('muestra boton more cuando hasMore es verdadero', () => {
    cy.mount(DetailMoreListMoreHostComponent);

    cy.get('button.ui-more-btn').should('be.visible').and('contain.text', 'Cargar');
  });

  // Verifica que el click del boton dispare el evento more.
  it('emite evento more cuando clickea el boton', () => {
    cy.mount(DetailMoreListMoreHostComponent);

    cy.get('.more-count').should('contain.text', '0');
    cy.get('button.ui-more-btn').click();
    cy.get('.more-count').should('contain.text', '1');
  });

  // Verifica el fallback visual cuando la lista esta vacia y hay mensaje.
  it('muestra mensaje vacio cuando no hay items', () => {
    cy.mount(DetailMoreListEmptyMessageHostComponent);

    cy.get('p.text-secondary').should('be.visible').and('contain.text', 'No hay items para mostrar');
    cy.get('.test-item').should('not.exist');
  });

  // Verifica que no se renderice contenido si no hay items ni mensaje.
  it('no muestra nada si items vacio y sin mensaje', () => {
    cy.mount(DetailMoreListEmptyHostComponent);

    cy.get('.detail-more-list-content').should('not.exist');
    cy.get('.test-item').should('not.exist');
    cy.get('p.text-secondary').should('not.exist');
  });
});
