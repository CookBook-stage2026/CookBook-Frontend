import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecipeSummary } from '@shared/domain/recipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe, MatCardModule, MatIconModule, RouterLink],
  templateUrl: '../html/recipe-card.component.html',
  styleUrl: '../scss/recipe-card.component.scss'
})
export class RecipeCardComponent {
  recipe = input.required<RecipeSummary>();
}
