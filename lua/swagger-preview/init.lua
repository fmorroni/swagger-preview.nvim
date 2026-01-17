local helpers = require("swagger-preview.helpers")

local M = {}
local job = nil

---@class SwaggerPreview.SetupOptions
---@field port integer?
---@field app string[]?

---@param opts SwaggerPreview.SetupOptions?
M.setup = function(opts)
	opts = opts or {}
	M.port = opts.port or 0
	M.app = opts.app or { "xdg-open" }
end

---@param callback_on_port fun(port: string)
---@return string
local start_handshake_socket = function(callback_on_port)
	local socket_path = vim.fn.tempname() .. ".sock"

	local server = vim.uv.new_pipe(false)
	assert(server)

	server:bind(socket_path)
	server:listen(1, function(err)
		assert(not err, err)

		local client = vim.uv.new_pipe(false)
		assert(client)
		server:accept(client)

		client:read_start(function(_, port)
			if port then
				callback_on_port(port)
			end

			client:close()
			server:close()
			os.remove(socket_path)
		end)
	end)

	return socket_path
end

---@param spec_path string
M.start_server = function(spec_path)
	if job then
		vim.notify("SwaggerPreview server is already running.", vim.log.levels.WARN)
		return
	end

	if not spec_path then
		vim.notify("A path to the openapi specification file must be specified.", vim.log.levels.ERROR)
		return
	end
	local socket_path = start_handshake_socket(function(port)
		local cmd = { unpack(M.app) }
		table.insert(cmd, "http://localhost:" .. port)
		vim.system(cmd)
	end)
	M.spec_path = spec_path
	job = vim.system({
		"deno",
		"run",
		"--allow-env=OPENAPI_SPEC,PORT,HANDSHAKE_SOCKET",
		-- Must allow all localhost ports because if `M.port == 0` then a random port will be chosen.
		"--allow-net=localhost",
		-- Read and write permissions needed for socket interaction.
		"--allow-read",
		"--allow-write",
		string.format("%s/web/server/main.ts", helpers.plugin_root()),
	}, {
		env = {
			NO_COLOR = "true",
			OPENAPI_SPEC = M.spec_path,
			PORT = M.port,
			HANDSHAKE_SOCKET = socket_path,
		},
		text = true,
	}, function(obj)
		if obj.code ~= 0 then
			vim.notify(obj.stderr, vim.log.levels.ERROR)
		end
	end)
end

M.stop_server = function()
	if not job then
		vim.notify("SwaggerPreview server is not running.", vim.log.levels.WARN)
		return
	end

	job:kill("sigterm")
	job = nil

	vim.notify("SwaggerPreview server stopped.", vim.log.levels.INFO)
end

return M
