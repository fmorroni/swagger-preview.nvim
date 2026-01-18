local helpers = require("swagger-preview.helpers")

local M = {}
---@type vim.SystemObj?
local server_job = nil

---@class SwaggerPreview.SetupOptions
---@field port integer?
---@field app string[]?

---@class SwaggerPreview.Message
-----@field code integer
---@field message string
---@field level vim.log.levels

---@param opts SwaggerPreview.SetupOptions?
M.setup = function(opts)
	opts = opts or {}
	M.port = opts.port or 0
	M.app = opts.app or { "xdg-open" }

	local augroup = vim.api.nvim_create_augroup("SwaggerPreviewAugroup", { clear = true })

	vim.api.nvim_create_autocmd("VimLeavePre", {
		group = augroup,
		callback = function()
			M.stop_server()
		end,
	})
end

---@param spec_path string
---@return SwaggerPreview.Message?
M.start_server = function(spec_path)
	if server_job then
		---@type SwaggerPreview.Message
		return { message = "SwaggerPreview server is already running.", level = vim.log.levels.WARN }
	end

	if not spec_path then
		---@type SwaggerPreview.Message
		return { message = "A path to the openapi specification file must be specified.", level = vim.log.levels.ERROR }
	end

	M.spec_path = spec_path
	server_job = vim.system({
		"deno",
		"run",
		"--allow-env=OPENAPI_SPEC,PORT,APP",
		-- Must allow all localhost ports because if `M.port == 0` then a random port will be chosen.
		"--allow-net=localhost",
		-- Read and write permissions needed for socket interaction.
		"--allow-run",
		string.format("%s/web/server/main.ts", helpers.plugin_root()),
	}, {
		env = {
			NO_COLOR = "true",
			OPENAPI_SPEC = M.spec_path,
			PORT = M.port,
			APP = vim.json.encode(M.app),
		},
		text = true,
	}, function(obj)
		if obj.code ~= 0 then
			vim.notify(obj.stderr, vim.log.levels.ERROR)
		end
	end)
end

---@return SwaggerPreview.Message
M.stop_server = function()
	if not server_job then
		return { message = "SwaggerPreview server is not running.", level = vim.log.levels.WARN }
	end

	server_job:kill("sigterm")
	server_job = nil

	return { message = "SwaggerPreview server stopped.", level = vim.log.levels.INFO }
end

return M
