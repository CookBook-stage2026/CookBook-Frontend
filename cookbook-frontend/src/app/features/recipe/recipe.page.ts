import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RecipeCreateModalComponent } from './components/typescript/recipe-create-modal.component';
import {ToastComponent} from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-recipe-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCreateModalComponent, ToastComponent],
  templateUrl: './recipe.page.html',
  styleUrl: './recipe.page.scss'
})
export default class RecipePage {
  isCreateModalOpen = signal(false);

  openModal() {
    this.isCreateModalOpen.set(true);
  }

  closeModal() {
    this.isCreateModalOpen.set(false);
  }

  onRecipeCreated() {
    console.log('Recipe was created successfully!');
  }
}
