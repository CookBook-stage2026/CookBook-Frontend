import { ChangeDetectionStrategy, Component, computed, input, output, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Household } from '@shared/domain/household';
import { User } from '@shared/domain/user';

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

  readonly inviteClicked = output<string>();
  readonly opened = output<string>();

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

  getInitials(user: User): string {
    return user.displayName
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(user: User): string {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
      '#10b981', '#06b6d4', '#f59e0b', '#6366f1',
    ];
    const index = (user.userId.codePointAt(user.userId.length - 1) || 0) % colors.length;
    return colors[index];
  }

  onInviteClick(): void {
    this.inviteClicked.emit(this.household().id);
  }

  onOpen(): void {
    this.opened.emit(this.household().id);
  }
}
