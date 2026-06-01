import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { RecipeSummary } from '@shared/domain/recipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { UserService } from '@shared/services/user';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe, MatCardModule, MatIconModule, RouterLink],
  templateUrl: '../html/recipe-card.component.html',
  styleUrl: '../scss/recipe-card.component.scss',
  host: {
    '[class.is-own-recipe]': 'recipe().creator === currentUser()?.displayName'
  }
})
export class RecipeCardComponent {
  private readonly userService = inject(UserService);

  recipe = input.required<RecipeSummary>();
  readonly currentUser = toSignal(this.userService.getCurrentUser());
}
