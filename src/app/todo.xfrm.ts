
import { of } from 'rxjs/observable/of'
import { empty } from 'rxjs/observable/empty';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMapTo';

import { map } from 'ix/iterable/map';

import { ixAction, IxAction, lens, ix } from '@ngix/store';

import { AppState } from './app.module';
import { TodoService } from './todo.service';


export interface TodoState {
    todos: TodoStateMap;
}

export interface TodoStateMap {
    [id: string]: Todo
}

export interface Todo {
    trackId: string;
    id: string;
    timestamp: number;
    title: string;
    isDone: boolean;
    error?: string;
}

export const INIT_STATE: TodoState = { todos: {} };

export const TODO_LENS = lens.lens('todos');
export const TODO_ACTION = ixAction<TodoStateMap>(TODO_LENS);
export const lmap = ix.lift<TodoStateMap>(map);


export function refresh (srv: TodoService) {

    return TODO_ACTION('Refresh', ix.identity(),
        state => srv.refresh()
            .map(todos => todos.reduce((ts, t) => ({ ...ts, [t.trackId]: t }), state))
            .map(todos => TODO_ACTION('Refresh Success', lmap(() => todos)))
            .catch(err => empty<IxAction<TodoStateMap>>()),
    );
}


export function done (srv: TodoService, todo: Todo) {

    const optTodo = { ...todo, isDone: !todo.isDone, error: undefined };
    const setter = lens.set<TodoStateMap>([todo.trackId]);
    const update = lmap(setter(optTodo));
    const rollback = lmap(setter({ ...todo, error: 'This todo failed to update.' }));

    return TODO_ACTION('Done', update,
        () => srv.update(optTodo)
            .mergeMapTo(empty<IxAction<TodoStateMap>>())
            .catch(err => of(TODO_ACTION('Done Failure', rollback))),
    );
}


export function add (srv: TodoService, title: string) {

    const todo = TodoService.Factory(title);
    const setter = lens.set<TodoStateMap>([todo.trackId]);
    const update = lmap(setter(todo));
    const rollback = lmap(setter({ ...todo, error: 'This todo failed to be added.' }));

    return TODO_ACTION('Add', update,
        () => srv.add(todo)
            .map(td => TODO_ACTION('Add Success', lmap(setter(td))))
            .catch(err => of(TODO_ACTION('Add Failure', rollback))),
    );
}


export function remove (srv: TodoService, todo: Todo) {

    const update = lmap(lens.del<TodoStateMap>([todo.trackId]));
    const rollback = lmap(lens.set<TodoStateMap>([todo.trackId])({ ...todo, error: 'This todo failed to be removed.' }));

    return TODO_ACTION('Remove', update,
        () => srv.remove(todo)
            .mergeMapTo(empty<IxAction<TodoStateMap>>())
            .catch(err => of(TODO_ACTION('Remove Failure', rollback))),
    );
}
