import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientService } from '@shared/services/ingredient';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  formatCategoryLabel,
  formatUnit,
  Ingredient
} from '@shared/domain/ingredient';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-ingredient-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatProgressSpinner, MatDialogActions, MatButton, MatError, MatChipOption, MatDialogContent, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatIcon, MatIconButton, MatChipListbox, MatDialogTitle, MatHint],
  templateUrl: './ingredient-modal.component.html',
  styleUrl: './ingredient-modal.component.scss'
})
export class IngredientModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ingredientService = inject(IngredientService);

  readonly isOpen = input.required<boolean>();
  readonly ingredient = input<Ingredient | null>(null);
  readonly initialName = input<string>('');

  readonly closeModal = output<void>();
  readonly ingredientSaved = output<Ingredient>();

  readonly isSubmitting = signal(false);
  readonly isEditMode = computed(() => this.ingredient() !== null);

  private readonly availableUnits = signal<string[]>([]);
  private readonly availableCategories = signal<string[]>([]);

  readonly formattedUnits = computed(() =>
    this.availableUnits().map(u => ({ value: u, label: formatUnit(u) }))
  );
  readonly formattedCategories = computed(() =>
    this.availableCategories().map(c => ({ value: c, label: formatCategoryLabel(c) }))
  );

  readonly selectedCategories = signal<string[]>([]);
  readonly selectedCategorySet = computed(() => new Set(this.selectedCategories()));

  readonly ingredientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    unit: ['', Validators.required],
    categories: [[] as string[], Validators.required]
  });

  constructor() {
    effect(() => {
      const activeIngredient = this.ingredient();
      if (this.isOpen()) {
        if (activeIngredient) {
          this.ingredientForm.patchValue({
            name: activeIngredient.name,
            unit: activeIngredient.defaultUnit ?? '',
            categories: activeIngredient.categories
          });
          this.selectedCategories.set(activeIngredient.categories);
        } else {
          this.ingredientForm.patchValue({ name: this.initialName() });
          this.selectedCategories.set([]);
        }
      } else {
        this.ingredientForm.reset({ name: '', unit: '', categories: [] });
        this.selectedCategories.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.ingredientService.getUnits().subscribe({
      next: (units) => this.availableUnits.set(units)
    });
    this.ingredientService.getCategories().subscribe({
      next: (cats) => this.availableCategories.set(cats)
    });
  }

  toggleCategory(category: string): void {
    const control = this.ingredientForm.get('categories');
    if (control !== null) {
      const current = this.selectedCategories();
      const updated = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      this.selectedCategories.set(updated);
      control.setValue(updated);
      control.markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.ingredientForm.invalid || this.isSubmitting()) {
      this.ingredientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.ingredientForm.value;
    const activeIngredient = this.ingredient();

    if (activeIngredient) {
      const updateDto: UpdateIngredientDto = {
        name: raw.name,
        defaultUnit: raw.unit,
        categories: raw.categories
      };

      this.ingredientService.updateIngredient(activeIngredient.id, updateDto).subscribe({
        next: () => {
          const syntheticUpdatedIngredient: Ingredient = {
            ...activeIngredient,
            name: updateDto.name,
            defaultUnit: updateDto.defaultUnit,
            categories: updateDto.categories
          };
          this.handleSuccess(syntheticUpdatedIngredient);
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      const createDto: CreateIngredientDto = {
        name: raw.name,
        defaultUnit: raw.unit,
        categories: raw.categories
      };

      this.ingredientService.createIngredient(createDto).subscribe({
        next: (saved) => this.handleSuccess(saved),
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  private handleSuccess(savedIngredient: Ingredient): void {
    this.isSubmitting.set(false);

    this.ingredientForm.reset({
      name: '',
      unit: '',
      categories: []
    });

    this.selectedCategories.set([]);

    this.ingredientSaved.emit(savedIngredient);
    this.closeModal.emit();
  }
}
