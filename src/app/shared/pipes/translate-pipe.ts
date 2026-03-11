import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  standalone:true
})
export class TranslatePipe implements PipeTransform {

  transform(value: string, type: 'status' | 'gender'): string {

    if (!value) return '';

    const statusMap: Record<string, string> = {
      alive: 'Vivo',
      dead: 'Muerto',
      unknown: 'Desconocido'
    };

    const genderMap: Record<string, string> = {
      male: 'Masculino',
      female: 'Femenino',
      genderless: 'Sin género',
      unknown: 'Desconocido'
    };

    if (type === 'status') {
      return statusMap[value.toLowerCase()] || value;
    }

    if (type === 'gender') {
      return genderMap[value.toLowerCase()] || value;
    }

    return value;
  }
}
