var _ = require('lodash');

module.exports = {
  ConsoleLogin: function(event) {
    return [
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
    ]
  },
  RunInstances: function(event) {
    var items = event.responseElements.instancesSet.items;
    var instances = _.map(items, function(item) {
      return item.instanceId;
    });
    var instanceTypes = _.uniq(_.map(items, function(item) {
      return item.instanceType;
    }));
    var privateIpAddresses = _.map(items, function(item) {
      return item.privateDnsName;
    });

    return [
      {
        title: instanceTypes.length > 1 ? 'Instance Types' : 'Instance Type',
        value: _.join(instanceTypes, ', '),
        short: true
      },
      {
        title: instances.length > 1 ? 'Instances' : 'Instance',
        value: _.join(instances, ', '),
        short: true
      },
      {
        title: instances.length > 1 ? 'Hostnames' : 'Hostname',
        value: _.join(privateIpAddresses, ', '),
        short: true
      }
    ]
  },
  SetDesiredCapacity: function(event) {
    return [
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
    ]
  },
  TerminateInstances: function(event) {
    var instances = _.map(event.requestParameters.instancesSet.items, function(item) {
      return item.instanceId;
    });

    return [
      {
        title: instances.length > 1 ? 'Instances' : 'Instance',
        value: _.join(instances, ', '),
        short: true
      }
    ]
  },
  UpdateFunctionCode20150331: function(event) {
    return [
      {
        title: 'Function',
        value: event.responseElements.functionName,
        short: true
      }
    ]
  },
  UpdateService: function(event) {
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
    ]

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

    return fields;
  }
}
