local helpers = require("swagger-preview.helpers")
local stdin_commands = require("swagger-preview.stdin_commands")

local M = {}

---@type vim.SystemObj?
local server_job = nil

---@type integer?
local augroup = nil

---@enum LogLevel
local LogLevel = {
  trace = "trace",
	debug = "debug",
	info = "info",
	warning = "warning",
	error = "error",
	fatal = "fatal",
}

---@class SwaggerPreview.SetupOptions
---@field port integer?
---@field app string[]?
---@field log_level LogLevel?

---@class SwaggerPreview.Message
-----@field code integer
---@field message string
---@field level vim.log.levels

---@param opts SwaggerPreview.SetupOptions?
M.setup = function(opts)
	opts = opts or {}
	M.port = opts.port or 0
	M.app = opts.app or { "xdg-open" }
	---@type LogLevel
	M.log_level = opts.log_level or LogLevel.info

	vim.api.nvim_create_autocmd("VimLeavePre", {
		callback = function()
			M.stop_server()
		end,
	})
end

---@param spec_path string
---@param bufnr integer
---@return SwaggerPreview.Message?
M.start_server = function(spec_path, bufnr)
	if server_job then
		---@type SwaggerPreview.Message
		return { message = "SwaggerPreview server is already running.", level = vim.log.levels.WARN }
	end

	if not spec_path then
		---@type SwaggerPreview.Message
		return { message = "A path to the openapi specification file must be specified.", level = vim.log.levels.ERROR }
	end

	local log_file = vim.fn.stdpath("log") .. "/" .. "swagger-preview.log"

	M.spec_path = spec_path
	server_job = vim.system({
		"deno",
		"run",
		"--allow-env=OPENAPI_SPEC,PORT,APP",
		-- Must allow all localhost ports because if `M.port == 0` then a random port will be chosen.
		"--allow-net=localhost",
		-- Read and write permissions needed for socket interaction.
		"--allow-run",
		"--allow-read",
		"--allow-write",
		string.format("%s/web/server/main.ts", helpers.plugin_root()),
		"--spec-path=" .. M.spec_path,
		"--port=" .. M.port,
		"--app=" .. table.concat(M.app, " "),
		"--log-file=" .. log_file,
		"--log-level=" .. M.log_level,
	}, {
		text = true,
		stdin = true,
		-- stderr = function(err, data)
		-- 	P({ err, data })
		-- end,
		-- stdout = function(err, data)
		-- 	P({ err, data })
		-- end,
	}, function(obj)
		if obj.code ~= 0 then
			vim.notify(obj.stderr, vim.log.levels.ERROR)
		end
	end)

	augroup = vim.api.nvim_create_augroup("SwaggerPreviewAugroup", { clear = true })

	vim.api.nvim_create_autocmd("BufWritePost", {
		group = augroup,
		buffer = bufnr,
		callback = function()
			server_job:write(stdin_commands.refresh_window)
		end,
	})
end

---@return SwaggerPreview.Message
M.stop_server = function()
	if not server_job or not augroup then
		return { message = "SwaggerPreview server is not running.", level = vim.log.levels.WARN }
	end

	server_job:kill("sigterm")
	server_job = nil

	vim.api.nvim_del_augroup_by_id(augroup)

	return { message = "SwaggerPreview server stopped.", level = vim.log.levels.INFO }
end

return M
