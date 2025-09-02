# Creating a starter project

- create a folder in `./content/__starter_projects` for your starter to live in!

## Defining the project

Create a `.container` folder with a `settings.json` file, with the following **_required_** fields:

- `description`: the short text description for the starter.
- `run_script`: whatever needs to run for the starter to do its work. Have a look at other starters for inspiration.

And the following **_optional_** fields:

- `env_vars`: whatever environment variables you need, in standard `key=value` form, separated with newlines.
- `default_file`: the file that should automatically get shown when the project loads. If omitted, the project will get loaded with "whichever file is first found" from the list in `default-files.js` (over in `src/client/files`).
- `default_collapse`: any folders that should automatically be shown "closed" like `node_modules`, `packages`, `vendor`, etc.
- `app_type`: if this project consists of static (or generated static) content, `"static"`. If it needs a persistent running process, `"docker"`. Note that this defaults to `"static"`.
- `root_dir`: if this is a generated static project, set this to the folder that the static generator builds into.

If your stater requires any special install instructions, remember to make that happen in the run script. For example, if it's a Node project that has dependencies, make sure your project has a `package.json` file, and an `npm install` instruction in your run script.

## The "protected" `.data` folder

You can add a `.data` folder to a starter, which is a protected folder that's only visible to project members, and does not get copied over when someone remixes a project. This is the only place where data can be safely stored such that it survives docker container restarts. Starter projects are special in that you can add a `.data` folder, with starter-relevant data, and remixing _will_ copy it over for the user, so if you use a `.data` folder it's a good idea to have a `README.md` or the like inside of it that explains what it's being used for, so that when folks remix the starter, they can read up on that in their new project.

## Getting your starter into the database

To see if your project does the right thing, run `node setup`, which will update the database based on your settings.json, after which you can remix the project on the main page (as long as you're logged in, of course).
