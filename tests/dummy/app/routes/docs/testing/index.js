import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    this.replaceWith('docs.testing.acceptance-testing');
  }
})