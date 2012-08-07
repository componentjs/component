
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 5s \
		--reporter spec

.PHONY: test