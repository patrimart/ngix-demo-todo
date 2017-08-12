import { TodoExamplePage } from './app.po';

describe('todo-example App', () => {
  let page: TodoExamplePage;

  beforeEach(() => {
    page = new TodoExamplePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
