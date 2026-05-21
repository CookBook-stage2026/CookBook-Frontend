import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientService } from '@shared/services/ingredient';
import { CreateIngredientDto, formatCategoryLabel, formatUnit, Ingredient } from '@shared/domain/ingredient';

@Component({
  selector: 'app-ingredient-create-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/ingredient-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class IngredientCreateModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ingredientService = inject(IngredientService);

  readonly isOpen = input.required<boolean>();
  readonly initialName = input<string>('');
  readonly closeModal = output<void>();
  readonly ingredientCreated = output<Ingredient>();

  readonly isSubmitting = signal(false);
  readonly availableUnits = signal<string[]>([]);
  readonly availableCategories = signal<string[]>([]);

  readonly ingredientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    unit: ['', Validators.required],
    categories: [[] as string[], Validators.required]
  });

  readonly formatCategoryLabel = formatCategoryLabel;
  readonly formatUnit = formatUnit;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const prefill = this.initialName();
        this.ingredientForm.patchValue({
          name: prefill
        });
      } else {
        this.ingredientForm.reset({ name: '', unit: '', categories: [] });
      }
    });
  }

  ngOnInit(): void {
    this.ingredientService.getUnits().subscribe(units => this.availableUnits.set(units));
    this.ingredientService.getCategories().subscribe(cats => this.availableCategories.set(cats));
  }

  isCategorySelected(category: string): boolean {
    const current: string[] = this.ingredientForm.get('categories')?.value ?? [];
    return current.includes(category);
  }

  toggleCategory(category: string): void {
    const control = this.ingredientForm.get('categories')!;
    const current: string[] = control.value ?? [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    control.setValue(updated);
    control.markAsTouched();
  }

  onSubmit(): void {
    if (this.ingredientForm.invalid || this.isSubmitting()) {
      this.ingredientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.ingredientForm.value;

    const dto: CreateIngredientDto = {
      name: raw.name,
      unit: raw.unit,
      categories: raw.categories
    };

    this.ingredientService.createIngredient(dto).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.ingredientCreated.emit(created);
        this.closeModal.emit();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
