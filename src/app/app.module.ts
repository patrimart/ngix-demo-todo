import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { IxStoreModule } from '@ngix/store';
import { EffectsModule, Effect, Actions } from '@ngrx/effects';

import { INIT_STATE, TodoState } from './todo.xfrm';
import { TodoService } from './todo.service';
import { SmartTodoComponent, DumbTodoComponent } from './todo.component';

import { AppComponent } from './app.component';


export type AppState
  = TodoState
  | { appName: string };


export function getAppState(): AppState {
  return { ...INIT_STATE, appName: 'Todo Example App' };
}

@Injectable()
export class DebugEffects {

  @Effect({ dispatch: false })
  public $debugger = this.action$.do(a => console.log('Debug =>', a.type));

  constructor (private action$: Actions) { }
}


@NgModule({
  declarations: [
    AppComponent,
    SmartTodoComponent,
    DumbTodoComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    IxStoreModule.forRoot(getAppState()),
    EffectsModule.forRoot([DebugEffects]),
  ],
  providers: [
    TodoService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
