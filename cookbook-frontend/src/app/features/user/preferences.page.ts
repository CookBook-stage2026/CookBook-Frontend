import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Category, Ingredient } from '@shared/domain/ingredient';
import { ToastService } from '@core/services';
import { UserService } from '@shared/services/user';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ExcludeIngredientsComponent } from '@features/user/components/typescript/exclude-ingredients.component';
import { ExcludeCategoriesComponent } from '@features/user/components/typescript/exclude-categories.component';

@Component({
  selector: 'app-preferences-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    ToastComponent,
    ExcludeIngredientsComponent,
    ExcludeCategoriesComponent
  ],
  templateUrl: './preferences.page.html',
  styleUrl: './preferences.page.scss'
})
export default class PreferencesPage {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly excludedCategories = signal<Category[]>([]);
  readonly excludedIngredients = signal<Ingredient[]>([]);
  readonly isSaving = signal(false);

  readonly preferencesResource = rxResource({
    stream: () => this.userService.getPreferences()
  });

  constructor() {
    effect(() => {
      const data = this.preferencesResource.value();
      if (data) {
        untracked(() => {
          this.excludedCategories.set(data.excludedCategories ?? []);
          this.excludedIngredients.set(data.excludedIngredients ?? []);
        });
      }
    });
  }

  savePreferences(): void {
    this.isSaving.set(true);

    const prefs = {
      excludedCategories: this.excludedCategories(),
      excludedIngredientIds: this.excludedIngredients()
        .map(i => i.id)
        .filter((id): id is string => typeof id === 'string')
    };

    this.userService.updatePreferences(prefs).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.show('Preferences saved successfully', "success");
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.show('Failed to save preferences', "error");
      }
    });
  }
}
