App.GistRoute = Ember.Route.extend(App.SandboxRoute, {
  model: function(params) {
    return $.getJSON('https://api.github.com/gists/' + params.gist_id)
    .then(function(gist) {
      return App.Sandbox.create({
        user_login: gist.user.login,
        gist_id: gist.id,
        js: gist.files['app.js'].content,
        hbs: gist.files['templates.html'].content,
        css: gist.files['style.css'].content
      });
    });
  },

  serialize: function(model) {
    return model.getProperties('user_login', 'gist_id');
  }
});
