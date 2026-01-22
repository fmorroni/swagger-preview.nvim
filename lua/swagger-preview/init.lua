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
---@field app string[]?
---@field hostname string?
---@field log_level LogLevel?
---@field port integer?

---@class SwaggerPreview.Message
-----@field code integer
---@field level vim.log.levels
---@field message string

---@param opts SwaggerPreview.SetupOptions?
M.setup = function(opts)
	opts = opts or {}
	M.app = opts.app or { "xdg-open" }
	M.hostname = opts.hostname or "localhost"
	---@type LogLevel
	M.log_level = opts.log_level or LogLevel.info
	M.config_port = opts.port or 0

	vim.api.nvim_create_autocmd("VimLeavePre", {
		callback = function()
			M.stop_server()
		end,
	})
end

---@param spec_root string
---@param spec_main_file string
---@param bufnr integer
---@return SwaggerPreview.Message?
M.start_server = function(spec_root, spec_main_file, bufnr)
	if server_job then
		---@type SwaggerPreview.Message
		return {
			message = string.format(
				"SwaggerPreview server is already running at `%s:%d` serving `%s`",
				M.hostname,
				M.used_port,
				M.spec_root
			),
			level = vim.log.levels.WARN,
		}
	end

	if not spec_root then
		---@type SwaggerPreview.Message
		return {
			message = "A path to the openapi specification root directory must be specified.",
			level = vim.log.levels.ERROR,
		}
	end

	if not spec_main_file then
		---@type SwaggerPreview.Message
		return { message = "The main specification file must be specified.", level = vim.log.levels.ERROR }
	end

	M.log_file = vim.fn.stdpath("log") .. "/" .. "swagger-preview.log"

	M.spec_root = spec_root
	M.spec_main_file = spec_main_file
	server_job = vim.system({
		"deno",
		"run",
		"--allow-env=OPENAPI_SPEC,PORT,APP",
		-- Must allow all `M.hostname` ports because if `M.port == 0` then a random port will be chosen.
		"--allow-net=" .. M.hostname,
		-- Read and write permissions needed for socket interaction.
		"--allow-run",
		"--allow-read",
		"--allow-write",
		string.format("%s/web/server/main.ts", helpers.plugin_root()),
		"--app=" .. table.concat(M.app, " "),
		"--hostname=" .. M.hostname,
		"--log-file=" .. M.log_file,
		"--log-level=" .. M.log_level,
		"--spec-root=" .. spec_root,
		"--spec-main-file=" .. spec_main_file,
		"--port=" .. M.config_port,
	}, {
		text = true,
		stdin = true,
		-- stderr = function(err, data)
		-- 	P({ err, data })
		-- end,
		stdout = function(err, data)
			if err then
				vim.notify("Error on server stdout: " .. err)
			end
			if data then
				local port = tonumber(data)
				if port then
					M.used_port = port
				else
					vim.notify("Error parsing port: " .. data)
				end
			end
		end,
	}, function(obj)
		if obj.code ~= 0 then
			vim.notify(obj.stderr, vim.log.levels.ERROR)
		end
	end)

	augroup = vim.api.nvim_create_augroup("SwaggerPreviewAugroup", { clear = true })

	vim.api.nvim_create_autocmd("BufWritePost", {
		group = augroup,
		pattern = spec_root .. "/**",
		callback = function()
			vim.schedule(function()
				server_job:write(stdin_commands.refresh_window)
			end)
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
