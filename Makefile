
check: lint test

lint:
	./node_modules/.bin/jshint index.js test lib

test:
	./node_modules/.bin/mocha

.PHONY: test lint
