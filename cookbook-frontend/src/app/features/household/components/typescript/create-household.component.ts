import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HouseholdService } from '@shared/services/household/household.service';
import { CreateHouseholdRequest } from '@shared/domain/household';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-create-household',
  templateUrl: '../html/create-household.component.html',
  styleUrls: ['../scss/create-household.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class CreateHouseholdComponent {
  readonly householdCreated = output<void>();
  readonly closeModal = output<void>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly householdService = inject(HouseholdService);
  private readonly toastService = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const request: CreateHouseholdRequest = this.form.getRawValue();

    this.householdService.createHousehold(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.show("Household successfully created!", "success");
        this.householdCreated.emit();
        this.closeModal.emit();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.show('Failed to create a household.', 'error');
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
