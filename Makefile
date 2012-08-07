
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 5s \
		--slow 3s \
		--reporter spec

.PHONY: test