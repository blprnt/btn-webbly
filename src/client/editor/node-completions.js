import { javascriptLanguage } from "@codemirror/lang-javascript";

/**
 * Node.js globals and common patterns for autocomplete.
 */
const NODE_GLOBALS = [
  // Module system
  { label: "require", type: "function", info: "require(module) — Imports a module. e.g. require('express')" },
  { label: "module", type: "variable", info: "The current module object." },
  { label: "exports", type: "variable", info: "Shorthand for module.exports. Attach values to export from this module." },
  { label: "__dirname", type: "variable", info: "The directory path of the current module file." },
  { label: "__filename", type: "variable", info: "The full file path of the current module file." },

  // Process
  { label: "process", type: "variable", info: "Information about the current Node.js process." },
  { label: "process.env", type: "variable", info: "Object containing environment variables." },
  { label: "process.argv", type: "variable", info: "Array of command-line arguments." },
  { label: "process.exit", type: "function", info: "process.exit(code?) — Ends the process." },
  { label: "process.cwd", type: "function", info: "process.cwd() — Returns the current working directory." },
  { label: "process.on", type: "function", info: "process.on(event, listener) — Listens for process events." },

  // Global objects
  { label: "Buffer", type: "class", info: "Buffer — For working with binary data." },
  { label: "Buffer.from", type: "function", info: "Buffer.from(data, encoding?) — Creates a buffer from a string or array." },
  { label: "Buffer.alloc", type: "function", info: "Buffer.alloc(size) — Creates a zero-filled buffer of a given size." },
  { label: "global", type: "variable", info: "The global object (equivalent to window in browsers)." },

  // Timers (already in JS, but confirming Node supports them)
  { label: "setTimeout", type: "function", info: "setTimeout(fn, ms) — Calls fn after ms milliseconds." },
  { label: "setInterval", type: "function", info: "setInterval(fn, ms) — Calls fn every ms milliseconds." },
  { label: "clearTimeout", type: "function", info: "clearTimeout(id) — Cancels a setTimeout." },
  { label: "clearInterval", type: "function", info: "clearInterval(id) — Cancels a setInterval." },
  { label: "setImmediate", type: "function", info: "setImmediate(fn) — Calls fn after I/O events in the current loop." },

  // Common core module names (for use with require())
  { label: "fs", type: "variable", info: "const fs = require('fs') — File system operations." },
  { label: "path", type: "variable", info: "const path = require('path') — File path utilities." },
  { label: "http", type: "variable", info: "const http = require('http') — HTTP server/client." },
  { label: "https", type: "variable", info: "const https = require('https') — HTTPS server/client." },
  { label: "url", type: "variable", info: "const url = require('url') — URL parsing." },
  { label: "os", type: "variable", info: "const os = require('os') — Operating system info." },
  { label: "crypto", type: "variable", info: "const crypto = require('crypto') — Cryptographic functions." },
  { label: "events", type: "variable", info: "const events = require('events') — EventEmitter." },
  { label: "stream", type: "variable", info: "const stream = require('stream') — Streaming interfaces." },
  { label: "util", type: "variable", info: "const util = require('util') — Utility functions." },
  { label: "querystring", type: "variable", info: "const querystring = require('querystring') — URL query string parsing." },
  { label: "child_process", type: "variable", info: "const { exec, spawn } = require('child_process') — Run shell commands." },

  // fs methods
  { label: "fs.readFileSync", type: "function", info: "fs.readFileSync(path, encoding?) — Reads a file synchronously." },
  { label: "fs.writeFileSync", type: "function", info: "fs.writeFileSync(path, data) — Writes a file synchronously." },
  { label: "fs.existsSync", type: "function", info: "fs.existsSync(path) — Returns true if the path exists." },
  { label: "fs.mkdirSync", type: "function", info: "fs.mkdirSync(path, options?) — Creates a directory." },
  { label: "fs.readdirSync", type: "function", info: "fs.readdirSync(path) — Returns an array of filenames in a directory." },
  { label: "fs.readFile", type: "function", info: "fs.readFile(path, encoding, callback) — Reads a file asynchronously." },
  { label: "fs.writeFile", type: "function", info: "fs.writeFile(path, data, callback) — Writes a file asynchronously." },
  { label: "fs.promises.readFile", type: "function", info: "fs.promises.readFile(path, encoding?) — Reads a file (Promise)." },
  { label: "fs.promises.writeFile", type: "function", info: "fs.promises.writeFile(path, data) — Writes a file (Promise)." },

  // path methods
  { label: "path.join", type: "function", info: "path.join(...parts) — Joins path segments." },
  { label: "path.resolve", type: "function", info: "path.resolve(...parts) — Resolves an absolute path." },
  { label: "path.dirname", type: "function", info: "path.dirname(path) — Returns the directory of a path." },
  { label: "path.basename", type: "function", info: "path.basename(path, ext?) — Returns the filename of a path." },
  { label: "path.extname", type: "function", info: "path.extname(path) — Returns the file extension." },

  // Express patterns
  { label: "express", type: "function", info: "const express = require('express') — Web framework." },
  { label: "app.get", type: "function", info: "app.get(path, handler) — Handles GET requests." },
  { label: "app.post", type: "function", info: "app.post(path, handler) — Handles POST requests." },
  { label: "app.put", type: "function", info: "app.put(path, handler) — Handles PUT requests." },
  { label: "app.delete", type: "function", info: "app.delete(path, handler) — Handles DELETE requests." },
  { label: "app.use", type: "function", info: "app.use(middleware) — Registers middleware." },
  { label: "app.listen", type: "function", info: "app.listen(port, callback?) — Starts the server." },
  { label: "req.body", type: "variable", info: "The parsed request body (requires body-parser or express.json())." },
  { label: "req.params", type: "variable", info: "URL parameters from the route path (e.g. /users/:id → req.params.id)." },
  { label: "req.query", type: "variable", info: "Parsed query string parameters." },
  { label: "req.headers", type: "variable", info: "The request headers object." },
  { label: "res.send", type: "function", info: "res.send(body) — Sends an HTTP response." },
  { label: "res.json", type: "function", info: "res.json(obj) — Sends a JSON response." },
  { label: "res.render", type: "function", info: "res.render(view, locals?) — Renders a template." },
  { label: "res.redirect", type: "function", info: "res.redirect(url) — Redirects to another URL." },
  { label: "res.status", type: "function", info: "res.status(code) — Sets the HTTP status code." },

  // Async patterns
  { label: "async", type: "keyword", info: "Marks a function as async, allowing use of await inside it." },
  { label: "await", type: "keyword", info: "Pauses execution until a Promise resolves." },
  { label: "Promise.all", type: "function", info: "Promise.all(promises) — Resolves when all promises resolve." },
  { label: "Promise.resolve", type: "function", info: "Promise.resolve(value) — Returns a resolved Promise." },
  { label: "Promise.reject", type: "function", info: "Promise.reject(reason) — Returns a rejected Promise." },
];

function nodeCompletionSource(context) {
  const word = context.matchBefore(/[\w.]+/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: NODE_GLOBALS };
}

/**
 * CodeMirror extension that adds Node.js globals to JavaScript autocomplete.
 */
export const nodeCompletions = javascriptLanguage.data.of({
  autocomplete: nodeCompletionSource,
});
