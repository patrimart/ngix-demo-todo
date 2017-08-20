
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { IxStore, lens } from '@ngix/store';

import { AppState } from './app.module';
import { TodoStateMap, refresh } from './todo.xfrm';
import { TodoService } from './todo.service';


@Component({
  selector: 'app-root',
  template: `
    <h1>{{ title | async }}</h1>
    <p>
      This app has <strong>{{ count | async }} todos</strong> with
      <strong>{{ completed | async }} completed</strong>.
    </p>
    <div>
      <app-todo-list></app-todo-list>
    </div>
    <div>
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [
    'h1, p { text-align: center }',
    'div { float: left; width: 50% }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  public title: Observable<string>;
  public count: Observable<number>;
  public completed: Observable<number>;

  constructor (
    private store$: IxStore<AppState>,
    private todoSrv: TodoService,
  ) {
    this.title = this.store$.view(lens.lens('appName'));
    const todos = this.store$.view(lens.lens('todos'));
    this.count = todos.map(t => Object.keys(t).length);
    this.completed = todos.map(t => Object.keys(t).reduce((p, k) => p + t[k].isDone, 0));

    this.store$.dispatchAsyncIx<TodoStateMap>(refresh(this.todoSrv));
  }
}
