# Makefile for amatiasq/jsbase

build:
	cat init.js > build.js

test:
	node init.test.js

browser-test:
	firefox test.html

