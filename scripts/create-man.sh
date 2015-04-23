marked-man usage.md \
	--version "v$(node -p "require('./package.json').version")" \
	--manual "itape" \
	> man/itape.1
