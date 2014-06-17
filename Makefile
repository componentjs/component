
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 20s \
		--slow 3s \
		--bail \
		--reporter spec

.PHONY: test
