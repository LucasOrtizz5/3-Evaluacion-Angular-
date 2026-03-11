import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {

  transform(status: string): string {

    const colors: Record<string, string> = {
      alive: 'text-success',
      dead: 'text-danger',
      unknown: 'text-warning'
    };

    return colors[status?.toLowerCase()] || '';
  }
}
