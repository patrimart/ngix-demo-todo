
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';

import { Todo } from './todo.xfrm';


function genId (): string {
    return Math.random().toString(36).substr(2);
}

/**
 * Mock service that poorly simulates communicating to a backend.
 * Requests will fail 10% of the time.
 */
@Injectable()
export class TodoService {

    private todos$ = new BehaviorSubject<(todos: Todo[]) => Todo[]>(todos => [
        { trackId: 'id1', id: 'id1', timestamp: 1502509474813, title: 'Learn @ngix', isDone: false },
        { trackId: 'id2', id: 'id2', timestamp: 1502509772213, title: 'Become a @ngrx backer.', isDone: true },
        { trackId: 'id3', id: 'id3', timestamp: 1509509972893, title: 'Add anoter todo.', isDone: false },
    ]);

    private todosStore$ = this.todos$.scan((ts, f) => f(ts), [] as Todo[]);

    public static Factory (title: string): Todo {
        return { trackId: genId(), id: '', timestamp: Date.now(), title, isDone: false };
    }

    public refresh (): Observable<Todo[]> {
        return this.todosStore$.first().delay(500);
    }

    public add (todo: Todo): Observable<Todo> {

        if (Math.random() < 0.1) {
            return Observable.throw(new Error('An error occurred while adding the todo.'));
        } else {
            this.todos$.next(ts => ts.concat({ ...todo, timestamp: Date.now(), id: genId() }));
            return this.todosStore$
                .map(todos => todos.find(t => t.trackId === todo.trackId))
                .first()
                .delay(500);
        }
    }

    public update (todo: Todo): Observable<Todo> {

        if (Math.random() < 0.1) {
            return Observable.throw(new Error('An error occurred while updating the todo.'));
        } else {
            this.todos$.next(ts => ts.map(t => t.trackId === todo.trackId ? todo : t));
            return this.todosStore$
                .map(todos => todos.find(t => t.trackId === todo.trackId))
                .first()
                .delay(500);
        }
    }

    public remove (todo: Todo): Observable<boolean> {

        if (Math.random() < 0.1) {
            return Observable.throw(new Error('An error occurred while removing the todo.'));
        } else {
            this.todos$.next(ts => ts.filter(t => t.trackId !== todo.trackId));
            return Observable.of(true).delay(500);
        }
    }
}
