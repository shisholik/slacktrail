require('dotenv').config();

var spawn = require('child_process').spawn;

task('build', function() {
    var zip = spawn('zip', ['pkg/slacktrail', '-r', 'node_modules', '.env', 'slacktrail.js', 'fields.js'])

    zip.stdout.on('data', function (data) {
      console.log(data+'');
    });

    zip.stderr.on('data', function (data) {
      console.log(data+'');
    });
});

task('create', ['build'], function() {
    var aws = spawn('aws', [
      'lambda',
      'create-function',
      '--function-name', 'slacktrail',
      '--runtime', 'nodejs',
      '--handler', 'slacktrail.handler',
      '--role', process.env.ROLE_ARN,
      '--zip-file', 'fileb://pkg/slacktrail.zip'
    ])

    aws.stdout.on('data', function (data) {
      console.log(data+'');
    });

    aws.stderr.on('data', function (data) {
      console.log(data+'');
    });
});

task('update', ['build'], function() {
    var aws = spawn('aws', [
      'lambda',
      'update-function-code',
      '--function-name', 'slacktrail',
      '--zip-file', 'fileb://pkg/slacktrail.zip'
    ])

    aws.stdout.on('data', function (data) {
      console.log(data+'');
    });

    aws.stderr.on('data', function (data) {
      console.log(data+'');
    });
});
