/* eslint-disable no-unused-vars */
export const enum Errors {
	invalidScoreRequest = 'missing required body { username: <string>, email: <string>, password: <string> }',
	notAuthorized = 'not authorized'
}

export const enum Environment {
	dev = 'development',
	stg = 'staging',
	prod = 'production'
}

export const Extentions = ['.png', '.jpg', '.jpeg', '.svg'];

export const enum Nums {
	oneDay = 86400000 // 24 * 60 * 60 * 1000
}