import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { StaticPagesService } from '../../../core/services/static-pages.service';
import { AboutUsContent } from '../../../core/models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private readonly staticPagesService = inject(StaticPagesService);

  readonly content$: Observable<AboutUsContent> = this.staticPagesService
    .getPage('about_us')
    .pipe(map(res => res.data.content as AboutUsContent));
}


