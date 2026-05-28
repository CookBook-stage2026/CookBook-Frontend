import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HouseholdInviteService } from '@shared/services/household-invite/household-invite.service';
import { HouseholdInvite } from '@shared/domain/household-invite';
import { ToastService } from '@core/services';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-invite-household',
  templateUrl: '../html/invite-household.component.html',
  styleUrls: ['../scss/invite-household.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatOption,
    MatSelect,
  ],
})
export class InviteHouseholdComponent {
  readonly householdId = input.required<string>();
  readonly closeModal = output<void>();
  readonly inviteCreated = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly inviteService = inject(HouseholdInviteService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly isCreating = signal(false);
  readonly isRevoking = signal(false);
  readonly isCopied = signal(false);
  readonly invite = signal<HouseholdInvite | null>(null);

  readonly inviteLink = computed(() => {
    const inv = this.invite();
    if (!inv) return null;
    return `${this.document.location.origin}/invite/${inv.token}`;
  });

  readonly hasNativeShare: boolean = 'share' in navigator;

  readonly durationOptions: { label: string; value: number | null }[] = [
    { label: '1 hour', value: 60 },
    { label: '24 hours', value: 1440 },
    { label: '7 days', value: 10080 },
  ];

  readonly form = this.fb.group({
    durationMinutes: [60 as number | null],
  });

  createInvite(): void {
    if (this.isCreating()) return;
    this.isCreating.set(true);

    const { durationMinutes } = this.form.getRawValue();

    this.inviteService
      .createInvite(this.householdId(), { durationMinutes })
      .subscribe({
        next: (invite) => {
          this.invite.set(invite);
          this.isCreating.set(false);
          this.inviteCreated.emit();
        },
        error: () => {
          this.isCreating.set(false);
          this.toastService.show('Failed to generate invite link.', 'error');
        },
      });
  }

  copyLink(): void {
    const link = this.inviteLink();
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    });
  }

  shareViaWhatsApp(): void {
    const link = this.inviteLink();
    if (!link) return;
    const text = encodeURIComponent(
      `You're invited to join my household! Accept here: ${link}`,
    );
    this.document.defaultView?.open(`https://wa.me/?text=${text}`, '_blank');
  }

  shareViaEmail(): void {
    const link = this.inviteLink();
    if (!link) return;
    const subject = encodeURIComponent("You're invited to join my household");
    const body = encodeURIComponent(
      `Hi!\n\nYou've been invited to join my household.\nClick the link below to accept:\n\n${link}`,
    );
    this.document.defaultView?.open(
      `mailto:?subject=${subject}&body=${body}`,
    );
  }

  shareViaNative(): void {
    const link = this.inviteLink();
    if (!link) return;
    navigator
      .share({ title: 'Household Invite', url: link })
      .catch(() => void 0);
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
