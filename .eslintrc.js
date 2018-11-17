module.exports = {
	"root": true,
	"extends": "airbnb-base",
	"rules": {
		"class-methods-use-this": 0,
    "import/named": 0,
		"no-restricted-syntax": 0,
		"no-param-reassign": 0,
		"consistent-return": 0,
		"no-loop-func": 0,
		"operator-assignment": 0,
		"no-restricted-globals": 0,
		"no-shadow": 0,
		"curly": ["error", "multi-line"],
    "valid-jsdoc": ["error", {
			"requireReturn": true,
			"requireReturnType": true,
			"requireParamDescription": false,
			"requireReturnDescription": true
		}],
		"require-jsdoc": ["error", {
			"require": {
				"FunctionDeclaration": true,
				"MethodDefinition": true,
				"ClassDeclaration": true
			}
		}]
	}
};
