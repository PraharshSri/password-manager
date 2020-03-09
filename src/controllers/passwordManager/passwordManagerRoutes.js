'use strict';

module.exports = (router, expressApp, passwordManagerRoutesMethods) => {
  // route for adding password account.
  router.post('/accounts', expressApp.oauth.authorise(), passwordManagerRoutesMethods.addPasswordAccount);

  // route for updating password account.
  router.put('/accounts', expressApp.oauth.authorise(), passwordManagerRoutesMethods.updatePasswordAccount);

  // route for updating password account status.
  router.delete('/accounts', expressApp.oauth.authorise(), passwordManagerRoutesMethods.deletePasswordAccount);

  // route for getting password account.
  router.get('/accounts', expressApp.oauth.authorise(), passwordManagerRoutesMethods.getPasswordAccount);

  // route for getting password accounts.
  router.get('/accounts/all', expressApp.oauth.authorise(), passwordManagerRoutesMethods.getPasswordAccounts);

  // route for searching password accounts.
  router.get('/accounts/search', expressApp.oauth.authorise(), passwordManagerRoutesMethods.searchPasswordAccounts);

  return router;
};
