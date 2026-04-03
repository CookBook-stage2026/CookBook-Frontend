import { Component, inject, signal, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { IngredientListComponent } from './components/typescript/ingredient-list.component';
import { IngredientFormComponent } from './components/typescript/ingredient-form.component';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient } from '@shared/domain/ingredient';

@Component({
  selector: 'app-ingredient-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IngredientFormComponent, IngredientListComponent, ToastComponent],
  template: `
    <app-toast/>
    <main class="page-layout">
      <aside class="sidebar">
        <app-ingredient-form [isSubmitting]="isSubmitting()" (ingredientSubmitted)="onAddIngredient($event)"/>
      </aside>

      <section class="content">
        <header class="content-header">
          <h1>Ingredients Repository</h1>
        </header>
        <app-ingredient-list
          [ingredients]="ingredients()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [isLoading]="isLoading()"
          (pageChange)="onPageChange($event)"
          (sizeChange)="onSizeChange($event)"
        />
      </section>
    </main>
  `,
  styles: [`
    .page-layout {
      display: flex;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      align-items: flex-start;
    }

    .sidebar {
      flex: 0 0 320px;
      position: sticky;
      top: 2rem;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .content-header h1 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
      color: var(--text-main);
    }

    @media (max-width: 860px) {
      .page-layout {
        flex-direction: column;
      }
      .sidebar {
        position: static;
        flex: auto;
        width: 100%;
      }
    }
  `]
})
export default class IngredientPage {
  private readonly ingredientService = inject(IngredientService);
  private readonly formComponent = viewChild.required(IngredientFormComponent);

  readonly ingredients = signal<Ingredient[]>([]);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  loadIngredients(): void {
    this.isLoading.set(true);
    this.ingredientService.getIngredients(this.pageIndex(), this.pageSize()).subscribe({
      next: (data) => {
        this.ingredients.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onAddIngredient(ingredient: Ingredient): void {
    this.isSubmitting.set(true);
    this.ingredientService.addIngredient(ingredient).subscribe({
      next: () => {
        this.formComponent().resetForm();
        this.pageIndex.set(0);
        this.loadIngredients();
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  onPageChange(newIndex: number): void {
    this.pageIndex.set(newIndex);
    this.loadIngredients();
  }

  onSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageIndex.set(0);
    this.loadIngredients();
  }
}
