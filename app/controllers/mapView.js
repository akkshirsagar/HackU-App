/*jslint devel: true, node: true, bitwise: false, debug: false, eqeq: false,
evil: false, forin: false, newcap: false, nomen: false, plusplus: false,
regexp: false, sub: false, vars: false, undef: false, unused: false,
white: false, quotmark: single, indent: 2, maxlen: 80 */

/*global $, Alloy, alert, Ti, _, OS_IOS, OS_ANDROID, Promise */

'use strict';

var args = arguments[0] || {};
var user = Ti.App.Properties.getObject('user', {});

// cloud
var Cloud = require('ti.cloud');

// user lat, long.
$.map.region = {
  latitude: user.latitude,
  longitude: user.longitude,
  longitudeDelta: 0.01,
  latitudeDelta: 0.01
};

var annotation = Alloy.Globals.Map.createAnnotation({
  latitude: user.latitude,
  longitude: user.longitude,
  title: user.name,
  subtitle: user.homeAddress,
  pincolor: Alloy.Globals.Map.ANNOTATION_RED,
  animate: true,
  user: user
});

$.map.addAnnotation(annotation);

function createEvent(event) {

  Cloud.Events.create({
    name: 'Car Pooling',
    start_time: new Date(),
    user: user.emailId,
    custom_fields: {
      address: user.homeAddress,
      coordinates : [ Number(user.latitude), Number(user.longitude)],
      seats: Number(event.seats),
      startTime: [Number(event.startHour), Number(event.startMin)],
      endTime: [event.endHour, event.endMin],
      deviceToken: user.deviceToken || '', // TODO
      channelId: user.channelId || '' //TODO
    }
  }, function (event) {

    if (event.success) {
      alert('CarPool event created.');
    } else {
      Ti.UI.createAlertDialog({
        title: 'Unsuccessful',
        message: 'Can\'t create event.'
      }).show();
    }
  });
}

function addEvent() {

  var startHour, startMin, endHour, endMin,
    labelStartPicker, startPicker, done,
    labelEndPicker,
    endPicker, value = new Date();

  value.setMinutes(0);
  value.setHours(0);

  startPicker = Ti.UI.createPicker({
    type: Ti.UI.PICKER_TYPE_TIME,
    value: value
  });

  labelStartPicker = Ti.UI.createLabel({
    text: 'Choose start time'
  });

  $.eventView.add(labelStartPicker);
  $.eventView.add(startPicker);

  startPicker.addEventListener('change', function (e) {
    var d = new Date(e.value);
    startHour = d.getHours();
    startMin = d.getMinutes();
  });

  endPicker = Ti.UI.createPicker({
    type: Ti.UI.PICKER_TYPE_TIME,
    value: value
  });

  labelEndPicker = Ti.UI.createLabel({
    text: 'Choose End time'
  });

  $.eventView.add(labelEndPicker);
  $.eventView.add(endPicker);

  endPicker.addEventListener('change', function (e) {
    var d = new Date(e.value);
    endHour = d.getHours();
    endMin = d.getMinutes();
  });

  done = Ti.UI.createButton({
    title: 'Done',
    height: '44dip',
    width: '88dip'
  });

  done.addEventListener('click', function () {

    if (! $.seats.value) {
      Ti.UI.createAlertDialog({
        title: 'Seats Required',
        message: 'Please, enter seats available'
      }).show();
      return;
    }

    if ((endHour + (endMin / 60)) <= (startHour + (startMin / 60))) {

      Ti.UI.createAlertDialog({
        title: 'Invalid',
        message: 'Please, enter valid time'
      }).show();
      return;
    }

    $.eventView.visible = false;

    // call to create event method.
    createEvent({
      seats: $.seats.value,
      startHour: startHour,
      startMin: startMin,
      endHour: endHour,
      endMin: endMin
    });
  });

  $.eventView.add(done);
  $.eventView.visible = true;
}
