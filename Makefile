
templates/readme.js: templates/readme.md
	./node_modules/.bin/minstache < $< > $@

test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 10s \
		--slow 3s \
		--bail \
		--reporter spec \
		$(SCRIPTS)

test-remotes:
	@$(MAKE) test SCRIPTS=test/remotes.js

.PHONY: test test-remotes
