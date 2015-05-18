.PHONY: test

test:
	./node_modules/.bin/mocha --reporter spec --timeout 10000
