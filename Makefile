install:
	git clone git://github.com/visionmedia/node-jscoverage.git
	cd node-jscoverage && ./configure && make

coverage:
	node-jscoverage/jscoverage src src-cov
	CODE_COVERAGE=1 mocha -R html-cov > coverage.html
	rm -r src-cov

clean:
	rm coverage.html
