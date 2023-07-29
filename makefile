# Create the distributables.
build:
	npm i
	./node_modules/.bin/webpack-cli --mode=production

# Serve the sample site locally for testing.
serve:
	./node_modules/.bin/webpack-dev-server

# Execute all tests/linting.
test:
	npm run lint
	npm run test:coverage

# Build the static site.
build-sample-site:
	# Clean up the artifacts folder, create the sample site location.
	rm -rf artifacts || true
	mkdir artifacts
	mkdir artifacts/sample-site
	cp -r dist/. sample/. artifacts/sample-site/.

.PHONY: build serve build-sample-site
