
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 5s \
		--slow 3s \
		--bail \
		--reporter spec

.PHONY: test