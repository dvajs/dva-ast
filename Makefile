
build:
	npm run build

publish: build
	npm publish

publish-sync: publish
	cnpm sync dva-ast
	tnpm sync dva-ast
