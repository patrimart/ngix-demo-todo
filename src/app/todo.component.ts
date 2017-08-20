
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { IterableX } from 'ix/iterable';
import { of } from 'ix/iterable/of';
import { map } from 'ix/iterable/map';

import { IxStore, lens, ixAction, ix } from '@ngix/store';

import { AppState } from './app.module';
import {
    TODO_LENS, Todo, TodoState, TodoStateMap,
    refresh, add, done, remove,
} from './todo.xfrm';
import { TodoService } from './todo.service';


@Component({
    selector: 'app-todo-list',
    template: `
        <div>
            <p>
                Todo: <input #title type="text" placeholder="Enter title...">
                <button (click)="onAdd(title.value)">Add</button>
            </p>
            <ul>
                <app-todo
                    *ngFor="let todo of todos | async; trackBy: track"
                    [todo]="todo"
                    (done)="onDone(todo)"
                    (remove)="onRemove(todo)"
                ></app-todo>
            </ul>
        </div>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartTodoComponent {

    public todos: Observable<Todo[]>;

    constructor (
        private store$: IxStore<AppState>,
        private todoSrv: TodoService,
    ) {
        this.todos = this.store$
            .view<TodoStateMap>(TODO_LENS)
            .map(todos => Object.keys(todos).reduce((p, k) => todos[k] !== undefined ? p.concat(todos[k]) : p, []))
            .map(todos => todos.sort((a, b) => a.timestamp - b.timestamp));
    }

    public onAdd (title: string) {
        this.store$.dispatchAsyncIx(add(this.todoSrv, title));
    }

    public onDone (todo: Todo) {
        this.store$.dispatchIx(done(this.todoSrv, todo));
    }

    public onRemove (todo: Todo) {
        this.store$.dispatchIx(remove(this.todoSrv, todo));
    }

    public track (todo: Todo) {
        return todo.trackId;
    }
}

/**
 * The DumbTodoComponent.
 * It doesn't do anything related to @ngix.
 */
@Component({
    selector: 'app-todo',
    template: `
        <li [class.error]="todo.error">
            <input type="checkbox" [checked]="todo.isDone" (click)="done.emit(todo)" [disabled]="todo.error">
            <span [class.done]="todo.isDone">
                <strong>{{ todo.title }} ({{ todo.id }})</strong>
                {{ todo.timestamp | date:'jm' }}
                <small>{{ todo.error }}</small>
            </span>
            <button (click)="remove.emit(todo)" [disabled]="todo.error">Remove</button>
        </li>
    `,
    styles: [
        'li.error { color: #900; }',
        'span { display: inline-block; width: 60% }',
        'span.done { text-decoration: line-through; }',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DumbTodoComponent {
    @Input()  public todo: Todo;
    @Output() public done = new EventEmitter<Todo>();
    @Output() public remove = new EventEmitter<Todo>();
}
