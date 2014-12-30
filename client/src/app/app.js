goog.provide('auth');

goog.require('auth.admin');
goog.require('auth.user');

auth.module = angular.module('auth', ['LocalStorageModule']);

auth.module.provider('env', function() {
	var provider = {};
	var config = {}
	config.apiURL = 'http://localhost:8080';
	config.clientURL = 'http://localhost:8081';
	config.additionalCfg = {};

	provider.set = function(key, val) {
		config.additionalCfg[key] = val;
	}

	provider.get = function(key) {
		return config.additionalCfg[key];
	}

	provider.setAPIURL = function(url) {
		config.apiURL = url;
	}

	provider.getAPIURL = function() {
		return config.apiURL;
	}

	provider.setClientURL = function(url) {
		config.clientURL = url;
	}
	
	provider.getClientURL = function() {
		return config.clientURL;
	}

	provider.$get = function() {
		var env = {};

		env.get = function(key) {
			return config.additionalCfg[key];
		}

		env.apiURL = function() {
			if (window.location.host.indexOf('localhost') > -1) {
				return 'http://localhost:8080';
			} else {
				return config.apiURL;
			}
		}

		env.clientURL = function() {
			if (window.location.host.indexOf('localhost') > -1) {
				return 'http://localhost:8081';
			} else {
				return config.clientURL;
			}
		}

		return env;
	}

	return provider;
});

var app = angular.module('app', ['auth.admin', 'auth.user']);