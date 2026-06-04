import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { filter, of, switchMap } from 'rxjs';
import { ToastService } from '@core/services';
import { User } from '@shared/domain/user';
import { HouseholdService } from '@shared/services/household/household.service';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { getUserAvatarColor, getUserInitials } from '@shared/utils/user-avatar';
import { CreateHouseholdRequest } from '@shared/domain/household';

@Component({
  selector: 'app-household-modal',
  templateUrl: '../html/household-modal.component.html',
  styleUrls: [ '../scss/household-modal.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class HouseholdModalComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly householdId = input<string | undefined>(undefined);
  readonly currentUser = input<User | undefined>(undefined);

  readonly closeModal = output<void>();
  readonly householdCreated = output<void>();
  readonly householdUpdated = output<void>();

  readonly isEditing = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly householdResource = rxResource({
    params: () => this.householdId(),
    stream: ({ params }) => {
      if (!params) return of(null);
      return this.householdService.getHouseholdById(params);
    },
  });

  readonly isCreator = computed(() => {
    const household = this.householdResource.value();
    const user = this.currentUser();
    if (!household || !user) return false;
    return household.creator.userId === user.userId;
  });

  form!: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      name: [ '', [ Validators.required, Validators.maxLength(50) ] ],
      description: [ '', [ Validators.maxLength(255) ] ],
    });
  }

  startEditing(): void {
    const household = this.householdResource.value();
    if (!household) return;
    this.form.patchValue({
      name: household.name,
      description: household.description,
    });
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const id = this.householdId();

    if (id) {
      this.householdService
        .updateHousehold({ name: value.name, description: value.description }, id)
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.isEditing.set(false);
            this.householdResource.reload();
            this.householdUpdated.emit();
            this.toastService.show('Household successfully updated!', 'success');
          },
          error: () => {
            this.isSubmitting.set(false);
            this.toastService.show('Failed to update household.', 'error');
          },
        });
    } else {
      const request: CreateHouseholdRequest = value;
      this.householdService.createHousehold(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toastService.show('Household successfully created!', 'success');
          this.householdCreated.emit();
          this.closeModal.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastService.show('Failed to create a household.', 'error');
        }
      });
    }
  }

  removeMember(userId: string, displayName: string): void {
    const id = this.householdId();
    if (!id) return;

    this.dialog
      .open(ConfirmDeleteComponent, {
        data: { message: `Remove ${displayName} from the household?` },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.householdService.removeMember(id, userId)),
      )
      .subscribe({
        next: () => {
          this.householdResource.reload();
          this.householdUpdated.emit();
        },
        error: () => {
          this.toastService.show('Failed to remove member.', 'error');
        },
      });
  }

  deleteHousehold(): void {
    const id = this.householdId();
    if (!id) return;

    this.dialog
      .open(ConfirmDeleteComponent, {
        data: { message: 'Delete this household permanently?' },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.householdService.deleteHousehold(id)),
      )
      .subscribe({
        next: () => {
          this.householdUpdated.emit();
          this.closeModal.emit();
        },
        error: () => {
          this.toastService.show('Failed to delete household.', 'error');
        },
      });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  protected readonly getInitials = getUserInitials;
  protected readonly getAvatarColor = getUserAvatarColor;
}
