import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RecipeSummary } from '@shared/domain/recipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe],
  templateUrl: '../html/recipe-card.component.html',
  styleUrl: '../scss/recipe-card.component.scss'
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeSummary;
}
