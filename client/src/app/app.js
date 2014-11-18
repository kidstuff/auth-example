goog.provide('auth');

goog.require('auth.admin');

auth.module = angular.module('auth', ['LocalStorageModule']);

auth.module.provider('env', function() {
	var provider = {};
	var config = {}
	config.apiURL = 'http://localhost:8080';
	config.clientURL = 'http://localhost:8081';

	provider.setAPIURL = function(url) {
		return config.apiURL = url;
	}

	provider.getAPIURL = function() {
		return config.apiURL;
	}

	provider.setClientURL = function(url) {
		return config.clientURL = url;
	}
	
	provider.getClientURL = function() {
		return config.clientURL;
	}

	provider.$get = function() {
		var env = {};
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

var app = angular.module('app', ['auth.admin']);