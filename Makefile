.PHONY: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter spec --timeout 10000

test-watch:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter dot --timeout 10000 --watch
