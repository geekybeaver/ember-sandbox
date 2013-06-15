App = Ember.Application.create();

App.DEFAULT_JS = (
 'App = Ember.Application.create();\n\n' +
 'App.Router.map(function() {\n' +
 '  this.route(\'about\');\n' +
 '});'
)

App.DEFAULT_HBS = (
  '<script type="text/x-handlebars">\n' +
  '  <h1>Ember Sandbox</h1>\n\n' +
  '  <nav>\n' +
  '    {{#linkTo index}}Home{{/linkTo}}\n' +
  '    {{#linkTo about}}About{{/linkTo}}\n' +
  '  </nav>\n\n' +
  '  {{outlet}}\n' +
  '</script>\n\n' +
  '<script type="text/x-handlebars" data-template-name="index">\n' +
  '  <h2>Welcome</h2>\n' +
  '  <p>Edit the bits of your app on left and see the result right here.</p>\n' +
  '  <p>All your code is kept in local storage, so it’ll be here when you get back.\n' +
  '</script>\n\n' +
  '<script type="text/x-handlebars" data-template-name="about">\n' +
  '  <h2>About</h2>\n' +
  '  <p>A little live editor for Ember, written in Ember.</p>\n' +
  '</script>'
)

App.DEFAULT_CSS = (
  'body {\n' +
  '  padding: 1em;\n' +
  '}'
)

// Routes

App.Router.map(function() {
  this.route('js');
  this.route('hbs');
  this.route('css');
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('js');
  }
});

// Controllers

App.ApplicationController = Ember.Controller.extend({
  js: localStorage['js'] || App.DEFAULT_JS,
  hbs: localStorage['hbs'] || App.DEFAULT_HBS,
  css: localStorage['css'] || App.DEFAULT_CSS,

  jsDidChange: function() {
    localStorage.js = this.get('js');
  }.observes('js'),

  hbsDidChange: function() {
    localStorage.html = this.get('hbs');
  }.observes('hbs'),

  cssDidChange: function() {
    localStorage.css = this.get('css');
  }.observes('css')
});

App.Controller = Ember.Controller.extend({
  needs: ['application'],
  jsBinding: 'controllers.application.js',
  hbsBinding: 'controllers.application.hbs',
  cssBinding: 'controllers.application.css'
});

App.ViewerController = App.Controller.extend();
App.JsController = App.Controller.extend();
App.HbsController = App.Controller.extend();
App.CssController = App.Controller.extend();

// Views

App.AceView = Ember.View.extend({
  classNames: ['ace-view'],
  theme: 'ember',
  focus: true,

  didInsertElement: function() {
    this._createEditor();
  },

  editorDidChange: function() {
    var editor = this.get('editor');
    this.set('value', editor.getValue());
  },

  _createEditor: function() {
    var editor = ace.edit(this.get('element')),
        session = editor.getSession();

    editor.setTheme('ace/theme/' + this.get('theme'));
    editor.setShowFoldWidgets(false);
    editor.setHighlightActiveLine(false);
    editor.setHighlightGutterLine(false);

    session.setMode('ace/mode/' + this.get('mode'))
    session.setUseSoftTabs(true);
    session.setTabSize(2);

    editor.setValue(this.get('value'));

    editor.getSelection().clearSelection();
    if (this.get('focus')) { editor.focus() }

    editor.on('change', $.proxy(this, 'editorDidChange'));

    this.set('editor', editor);
  }
});

App.FrameView = Ember.View.extend({
  tagName: 'iframe',
  src: 'iframe.html',
  classNames: ['pane frame'],
  attributeBindings: ['src'],

  contentDidChange: function() {
    var el = this.get('element'),
        contentWindow = el.contentWindow,
        content = this.get('content');

    Ember.run(function() { contentWindow.postMessage(content, '*') });
  }.observes('content'),

  content: function() {
    return this.getProperties('js', 'hbs', 'css');
  }.property('js', 'hbs', 'css'),

  didInsertElement: function() {
    var self = this,
        el = this.get('element');

    $(window).one('message', function() {
      self.notifyPropertyChange('content');
    });
  }
});

// Helpers

Ember.Handlebars.helper('ace', App.AceView);
Ember.Handlebars.helper('frame', App.FrameView);
