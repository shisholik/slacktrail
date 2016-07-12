var _ = require('lodash');
var AWS = require('aws-sdk');
var Q = require('q');
var ec2 = new AWS.EC2();

function describeInstances(instancesIds, region) {
	var deferred = Q.defer();
	var params = {
		InstanceIds: instancesIds
	};

	AWS.config.update({region: region});

	ec2.describeInstances(params, function (err, data) {
		var fields = [
			{
				title: instancesIds.length > 1 ? 'Instances' : 'Instance',
				value: _.join(instancesIds, ', '),
				short: true
			}
		];
		var additionalFields = [];

		if (err) {
			deferred.reject(err)
		} else {
			if (data.Reservations[0]) {
				var awsInstances = data.Reservations[0].Instances;
				var instanceTypes = _.uniq(_.map(awsInstances, function (item) {
					return item.InstanceType;
				}));
				var privateIpAddresses = _.map(awsInstances, function (item) {
					return item.PublicIpAddress;
				});
				var names = _.map(awsInstances, function (item) {
					return item.Tags.filter(function (obj) { return obj.Key == "Name" })[0].Value;
				});

				additionalFields = [
					{
						title: instanceTypes.length > 1 ? 'Instance Types' : 'Instance Type',
						value: _.join(instanceTypes, ', '),
						short: true
					},
					{
						title: instancesIds.length > 1 ? 'Ips' : 'Ip',
						value: _.join(privateIpAddresses, ', '),
						short: true
					},
					{
						title: instancesIds.length > 1 ? 'Instances Names' : 'Instance Name',
						value: _.join(names, ', '),
						short: true
					}
				]
			}

		}
		deferred.resolve(_.concat(fields, additionalFields))
	});

	return deferred.promise;
}

module.exports = {
	ConsoleLogin: function (event) {
		return Q.resolve([
			{
				title: 'Source IP',
				value: event.sourceIPAddress,
				short: true
			},
			{
				title: 'MFA Used',
				value: event.additionalEventData.MFAUsed,
				short: true
			}
		])
	},
	RunInstances: function (event) {
		var items = event.responseElements.instancesSet.items;
		var instances = _.map(items, function (item) {
			return item.instanceId;
		});

		return describeInstances(instances, event.awsRegion)
	},
	StartInstances: function (event) {
		var items = event.responseElements.instancesSet.items;
		var instances = _.map(items, function (item) {
			return item.instanceId;
		});

		return describeInstances(instances, event.awsRegion)
	},
	StopInstances: function (event) {
		var items = event.responseElements.instancesSet.items;
		var instances = _.map(items, function (item) {
			return item.instanceId;
		});

		return describeInstances(instances, event.awsRegion)
	},
	TerminateInstances: function (event) {
		var instances = _.map(event.requestParameters.instancesSet.items, function (item) {
			return item.instanceId;
		});

		return Q.resolve([
			{
				title: instances.length > 1 ? 'Instances' : 'Instance',
				value: _.join(instances, ', '),
				short: true
			}
		])
	},
	SetDesiredCapacity: function (event) {
		return Q.resolve([
			{
				title: 'Group Name',
				value: event.requestParameters.autoScalingGroupName,
				short: true
			},
			{
				title: 'Desired Capacity',
				value: event.requestParameters.desiredCapacity,
				short: true
			}
		])
	},
	UpdateService: function (event) {
		var fields = [
			{
				title: 'Cluster',
				value: event.requestParameters.cluster,
				short: true
			},
			{
				title: 'Service',
				value: event.requestParameters.service,
				short: true
			}
		];

		if (event.requestParameters.taskDefinition) {
			fields.push({
				title: 'Task Definition',
				value: event.requestParameters.taskDefinition,
				short: true
			});
		}

		if (event.requestParameters.desiredCount) {
			fields.push({
				title: 'Desired Count',
				value: event.requestParameters.desiredCount,
				short: true
			});
		}

		return Q.resolve(fields);
	}
};
