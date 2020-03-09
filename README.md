# password-manager-app


# Setup PostgreSQL

On MacOS open terminal and run below command

```
brew install postgresql
brew services start postgresql
rm -r /usr/local/var/postgres
initdb /usr/local/var/postgres


createdb pwd_manager;

psql pwd_manager;

CREATE EXTENSION pgcrypto;

CREATE ROLE root WITH LOGIN PASSWORD 'password';

ALTER ROLE root CREATEDB;
```

Now exit from the super user
`postgres=# \q`

Login back using new user created
`psql -d pwd_manager -U root`

Now create required tables

```
CREATE TABLE users (id serial PRIMARY KEY, email_id varchar(50) UNIQUE NOT NULL, password varchar(1000) NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE access_tokens (id serial PRIMARY KEY, user_id integer UNIQUE NOT NULL, access_token varchar(1000) NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT _FK_user_id FOREIGN KEY (user_id) REFERENCES users (id));

CREATE TABLE user_accounts (id serial PRIMARY KEY, user_id integer NOT NULL, account_name varchar(200) NOT NULL, username varchar(50) NOT NULL, password varchar(1000) NOT NULL, is_active integer NOT NULL DEFAULT 1, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unique_account_cred UNIQUE(user_id, account_name, username), CONSTRAINT _FK_users_id FOREIGN KEY (user_id) REFERENCES users (id));
```

Create DB for testing
```
createdb pwd_manager_test;

psql pwd_manager_test;

CREATE EXTENSION pgcrypto;

postgres=# \q

psql -d pwd_manager_test -U root
```

Clone the project and then : 

# Run Webserver

`npm install`
`npm start`

Use swagger url (/api-docs) to get api documentation, after running the server.