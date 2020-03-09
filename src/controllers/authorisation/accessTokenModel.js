'use strict';

let userDBHelper;
let accessTokensDBHelper;

module.exports = (injectedUserDBHelper, injectedAccessTokensDBHelper) => {
  userDBHelper = injectedUserDBHelper;

  accessTokensDBHelper = injectedAccessTokensDBHelper;

  return {

    getClient: getClient,

    saveAccessToken: saveAccessToken,

    getUser: getUser,

    grantTypeAllowed: grantTypeAllowed,

    getAccessToken: getAccessToken,
  };
};

/* This method returns the client application which is attempting to get the accessToken.
 The client is normally be found using the  clientID & clientSecret. However, with user facing client applications such
 as mobile apps or websites which use the password grantType we don't use the clientID or clientSecret in the authentication flow.
 Therefore, although the client  object is required by the library all of the client's fields can be  be null. This also
 includes the grants field. Note that we did, however, specify that we're using the password grantType when we made the
 oAuth object in the index.js file.*/
function getClient(clientID, clientSecret, callback) {
  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null,
  };

  callback(false, client);
}


/* Determines whether or not the client which has to the specified clientID is permitted to use the specified grantType.
  The callback takes an eror of type truthy, and a boolean which indcates whether the client that has the specified clientID
  is permitted to use the specified grantType. As we're going to hardcode the response no error can occur
  hence we return false for the error and as there is there are no clientIDs to check we can just return true to indicate
  the client has permission to use the grantType. */
function grantTypeAllowed(clientID, grantType, callback) {
  callback(false, true);
}


/* The method attempts to find a user with the spcecified username and password. The callback takes 2 parameters.
   This first parameter is an error of type truthy, and the second is a user object. You can decide the structure of
   the user object as you will be the one accessing the data in the user object in the saveAccessToken() method. The library
   doesn't access the user object it just supplies it to the saveAccessToken() method */
function getUser(username, password, callback) {
  userDBHelper.getUserFromCrentials(username, password, callback);
}


/* saves the accessToken along with the userID retrieved the specified user */
function saveAccessToken(accessToken, clientID, expires, user, callback) {
  accessTokensDBHelper.saveAccessToken(accessToken, user.id, callback);
}


/* This method is called when a user is using a bearerToken they've already got as authentication
   The method effectively serves to validate the bearerToken. A bearerToken
   has been successfully validated if passing it to the getUserIDFromBearerToken() method returns a userID.
   It's able to return a userID because each row in the access_tokens table has a userID in it so we can use
   the bearerToken to query for a row which will have a userID in it.
 */
function getAccessToken(bearerToken, callback) {
  // try and get the userID from the db using the bearerToken
  accessTokensDBHelper.getUserIDFromBearerToken(bearerToken, (userID) => {
    // create the token using the retrieved userID
    const accessToken = {
      user: {
        id: userID,
      },
      expires: null,
    };

    // set the error to true if userID is null, and pass in the token if there is a userID else pass null
    callback(userID == null, userID == null ? null : accessToken);
  });
}
