import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class LoaderComponent {
  @Input() message = 'Cargando...';
}
