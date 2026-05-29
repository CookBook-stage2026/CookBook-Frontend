import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Household } from '@shared/domain/household';
import { User } from '@shared/domain/user';
import { getUserAvatarColor, getUserInitials } from '@shared/utils/user-avatar';

@Component({
  selector: 'app-household-card',
  templateUrl: '../html/household-card.component.html',
  styleUrls: ['../scss/household-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
})
export class HouseholdCardComponent {
  readonly household = input.required<Household>();
  readonly currentUser = input.required<User>();

  readonly detailClicked = output<string>();
  readonly manageInvitesClicked = output<string>();
  readonly leaveClicked = output<string>();

  private readonly MAX_VISIBLE_MEMBERS = 4;

  readonly visibleMembers = computed(() =>
    this.household().members.slice(0, this.MAX_VISIBLE_MEMBERS),
  );

  readonly extraMembersCount = computed(() =>
    Math.max(0, this.household().members.length - this.MAX_VISIBLE_MEMBERS),
  );

  readonly memberLabel = computed(() => {
    const count = this.household().members.length;
    return count === 1 ? '1 member' : `${count} members`;
  });

  readonly isCreator = computed(() =>
    this.currentUser().userId === this.household().creator.userId,
  );

  onDetailClick(): void {
    this.detailClicked.emit(this.household().id);
  }

  onManageInvitesClick(): void {
    this.manageInvitesClicked.emit(this.household().id);
  }

  onLeaveClick(): void {
    this.leaveClicked.emit(this.household().id);
  }

  protected readonly getInitials = getUserInitials;
  protected readonly getAvatarColor = getUserAvatarColor;
}
