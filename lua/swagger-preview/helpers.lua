return {
	plugin_root = function()
		local source = debug.getinfo(1, "S").source:sub(2)
		return vim.fn.fnamemodify(source, ":p:h:h:h")
	end,
}
