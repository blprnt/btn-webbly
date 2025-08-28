# Working on the platform

This platform's codebase is split up into several sections:

- `./content` houses the user projects, as well as the special `__starter_projects` folder, and the `default` folder that is used to show some content while a project container is still loading.
- `./data` houses the sqlite databases (both the platform itself and the session db) and sql schema
- `./docs` houses the platform's documentation
- `./public` houses all the content that the platform's own server can ***statically*** serve. It does not have any "html pages", those are found in `src/server/pages`

All the "code" lives inside the `src` folder:

- `./src` houses the platform's client and server code
- `./src/client` houses all the JS that constitutes the browser-based editor code.
- `./src/server` houses all the code that is involved in running the platform itself

The server code is further split up into the following logical folders:

- `./src/server/caddy` is where the Caddy code and configs live
- `./src/server/database` is where the JS that deals with database interaction lives
- `./src/server/docker` is where the Docker code and base configs live
- `./src/server/pages` is where all the nunjucks-templated HTML lives, with fragments in the `fragments` subfolder
- `./src/server/routing` is where all the server route information can be found. If it has a URL, resolution for that URL can be found here.

