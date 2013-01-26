MOCHA=node_modules/.bin/mocha -u qunit -t 4000

test:
	$(MOCHA) -R spec

coverage:
	rm -rf src-cov
	jscoverage src src-cov
	@RANGE_COV=1 $(MOCHA) -R html-cov > test/coverage.html

.PHONY: test coverage