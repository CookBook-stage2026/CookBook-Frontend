import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { ToastService } from '@core/services';
import { User } from '@shared/domain/user';
import { HouseholdService } from '@shared/services/household/household.service';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { getUserAvatarColor, getUserInitials } from '@shared/utils/user-avatar';

@Component({
  selector: 'app-household-detail',
  templateUrl: '../html/household-detail.component.html',
  styleUrls: [ '../scss/household-detail.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class HouseholdDetailComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly householdId = input.required<string>();
  readonly currentUser = input.required<User>();

  readonly closeModal = output<void>();
  readonly householdUpdated = output<void>();

  readonly householdResource = rxResource({
    params: () => this.householdId(),
    stream: ({ params }) => this.householdService.getHouseholdById(params),
  });

  readonly isCreator = computed(() => {
    const household = this.householdResource.value();
    if (!household) return false;
    return household.creator.userId === this.currentUser().userId;
  });

  readonly isEditing = signal(false);
  readonly isSubmitting = signal(false);

  form!: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      name: [ '', [ Validators.required ] ],
      description: [ '' ],
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
    const value = this.form.getRawValue();

    this.householdService
      .updateHousehold({
        name: value.name,
        description: value.description,
      }, this.householdId())
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isEditing.set(false);
          this.householdResource.reload();
          this.householdUpdated.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastService.show('Failed to update household.', 'error');
        },
      });
  }

  removeMember(userId: string, displayName: string): void {
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          message: `Remove ${displayName} from the household?`,
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.householdService.removeMember(this.householdId(), userId)),
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
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          message: 'Delete this household permanently?',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.householdService.deleteHousehold(this.householdId())),
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
