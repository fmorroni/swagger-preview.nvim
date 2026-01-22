# swagger-previewer.nvim

A Neovim plugin that starts a local Swagger UI server to preview OpenAPI specifications directly from your editor. It automatically reloads the preview when you save changes to your spec files.

The plugin spawns a Deno-based web server in the background, serves your OpenAPI spec, and opens the Swagger UI in your browser.

---

## Features

- 🚀 One-command Swagger UI preview for the current OpenAPI file
- 🔄 Automatic reload on file save
- 🌐 Configurable hostname and port (or random port assignment)
- 🧾 Configurable logging level and log file
- 🛑 Clean shutdown when Neovim exits

---

## Requirements

- **Neovim** ≥ 0.11
- **Deno** available in `$PATH`
- A browser or command to open URLs (defaults to `xdg-open`)

---

## Installation

Using a plugin manager (example with `lazy.nvim`):

```lua
{
  "fmorroni/swagger-preview.nvim",
  opts = {},
}
```

---

## Setup

The plugin exposes a `setup` function with the following options:

```lua
---@class SwaggerPreview.SetupOptions
---@field app string[]?        -- Command used to open the browser
---@field hostname string?     -- Hostname to bind the server to
---@field log_level LogLevel?  -- Log verbosity
---@field port integer?        -- Port to bind to (0 = random)
```

### Default values

```lua
require("swagger-preview").setup({
  app = { "xdg-open" },
  hostname = "localhost",
  log_level = "info",
  port = 0, -- random free port
})
```

---

## Usage

### Commands

#### `:SwaggerPreviewStart`

Starts the Swagger Preview server for the **current buffer**.

- The current buffer **must be an OpenAPI file** with a valid file path.
- The buffer's directory is used as the spec root.
- The buffer's filename is used as the main spec file.

If the server is already running, a warning is shown.

#### `:SwaggerPreviewStop`

Stops the running Swagger Preview server.

---

## Logging

Logging is controlled via the `log_level` option.

Available levels:

- `trace`
- `debug`
- `info`
- `warning`
- `error`
- `fatal`

Logs are written to:

```
vim.fn.stdpath("log") .. "/" .. "swagger-preview.log"
```
Usually:
```
~/.local/state/nvim/log/swagger-preview.log
```
