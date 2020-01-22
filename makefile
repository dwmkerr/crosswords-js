# Create the distributables.
build:
	npm i
	./node_modules/.bin/webpack-cli --mode=production

# Serve the sample site locally for testing.
serve:
	npm i
	./node_modules/.bin/webpack-dev-server

.PHONY: build serve
