var Zlib = require('zlib');

var Q = require('q');
var _ = require('lodash');
var Slack = require('slack-node');
var Dotenv = require('dotenv');

var Fields = require('./fields');

function read(input) {
	var deferred = Q.defer();
	var unzip = Zlib.createGunzip();
	var payload = new Buffer(input, 'base64');

	Zlib.gunzip(payload, function (error, result) {
		if (!error) {
			logMessage = JSON.parse(result.toString('ascii'));
			events = _.map(logMessage.logEvents, function (logEvent) {
				return JSON.parse(logEvent.message);
			});

			deferred.resolve(events);
		} else {
			deferred.reject(error);
		}
	});

	return deferred.promise;
}

function filter(events) {

	var deferred = Q.defer();
	var ignoreEvents = process.env.IGNORE_EVENTS.split(',')

	filteredEvents = _.filter(_.compact(events))

	filteredEvents = _.reject(filteredEvents, function (event) {
		return _.some(ignoreEvents, function (ignoreEvent) {
			return event.eventName.indexOf(ignoreEvent) === 0
		})
	});

	if (filteredEvents.length > 0) {
		deferred.resolve(filteredEvents);
	} else {
		deferred.reject('No events.');
	}

	return deferred.promise;
}

function announce(events) {

	var attachments = _.map(events, function (event) {
			var deferred = Q.defer();
			var user;
			var fields;
			console.log(event)

			if (event.userIdentity.type === 'IAMUser') {
				user = event.userIdentity.userName;
			} else if (event.userIdentity.type === 'Root') {
				user = event.userIdentity.userName || 'Root';
			} else if (event.userIdentity.type === 'AssumedRole') {
				user = event.userIdentity.arn.split(':')[5].replace('assumed-role/', '');
			} else {
				user = event.userIdentity.arn.split(':')[5];
			}

			fields = [
				{
					title: 'EventID',
					value: event.eventID,
					short: true
				},
				{
					title: 'Timestamp',
					value: new Date(event.eventTime).toString(),
					short: true
				},
				{
					title: 'User',
					value: user,
					short: true
				},
				{
					title: 'Source',
					value: event.eventSource,
					short: true
				},
				{
					title: 'Name',
					value: event.eventName,
					short: true
				},
				{
					title: 'Region',
					value: event.awsRegion,
					short: true
				}

			]

			if (Fields[event.eventName]) {
				Fields[event.eventName](event)
					.then(function (arr) {
						fields = _.flatten(_.concat(fields, arr));
						deferred.resolve({
							color: '#789C45',
							fields: fields
						})
					}).catch(function (error) {
					deferred.reject(error)
				})

			} else {
				deferred.resolve({
					color: '#789C45',
					fields: fields
				})
			}

			return deferred.promise
		}
	)
	var deferred = Q.defer();
	Q.all(attachments).then(function (results) {
		var slack = new Slack();
		slack.setWebhook(process.env.SLACK_WEBHOOK);
		slack.webhook({
			text: '<https://us-east-1.console.aws.amazon.com/cloudtrail/home|Open CloudTrail Console>',
			attachments: _.flatten(results)
		}, function (error, response) {
			if (!error) {
				deferred.resolve(response);
			} else {
				deferred.reject(error);
			}
		});
	}).catch(function (error) { deferred.reject(error);})

	return deferred.promise;
}

exports.handler = function (input, context, callback) {
	Dotenv.config();
	console.log(input)
	read(input.awslogs.data)
		.then(filter)
		.then(announce)
		.then(function (result) {callback(null, result)})
		.catch(function (error) {callback(error)})
		.done();
}
