
# homebridge-mqtt-tasmota

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://badgen.net/npm/dt/homebridge-mqtt-tasmota?color=purple)](https://www.npmjs.com/package/homebridge-mqtt-tasmota)
[![npm](https://badgen.net/npm/v/homebridge-mqtt-tasmota?color=purple)](https://www.npmjs.com/package/homebridge-mqtt-tasmota)


This is an all-in-one [homebridge](https://homebridge.io/) plugin to control various [tasmota](https://tasmota.github.io/docs/) devices via MQTT.

Since [tasmota](https://tasmota.github.io/docs/) MQTT topics are well known for a given device type, all the MQTT topics will be computed according to the device name (`%topic%` in the [tasmota](https://tasmota.github.io/docs/) settings).

# Requirements
 - A MQTT broker ([mosquitto](https://mosquitto.org/) for instance)
 - A [tasmota](https://tasmota.github.io/docs/) flashed device (v9.3 or up)
 - [Homebridge](https://homebridge.io/) (v1.0.0 or up)

# Compatible with
 - [Sonoff devices](https://sonoff.tech/products/) :
    - RFR3
    - MINI
    - POWR2
    - iFan03
    - S26
    - 4CHPROR2
    - 433 RF Bridge (with smoke alarms)
    - T1 (dual switch)
  - Homemade ESP8266 Temperature sensor
  - Generic RGB LED strip controller
  - Probably all other devices supporting [tasmota](https://tasmota.github.io/docs/)

# Installation

If you are new to [homebridge](https://homebridge.io/), please first read the [homebridge documentation](https://github.com/homebridge/homebridge/wiki#installation).
To install the plugin use:
```
sudo npm install homebridge-mqtt-tasmota -g
```

# Configuration example

Here is [homebridge](https://homebridge.io/) `config.json` example:
```
{
    "bridge": {
        "name": "homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    "accessories": [
        {
            "accessory": "mqtt-tasmota",
            "type": "blinds",
            "name": "Living Room Blinds #1",
            "url": "mqtt://192.168.0.3",
            "topic": "living_room_shutter",
            "index": "1"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "blinds",
            "name": "Living Room Blinds #2",
            "url": "mqtt://192.168.0.3",
            "topic": "living_room_shutter",
            "index": "2"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "switch",
            "name": "Lounge",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_switch"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "switch",
            "name": "Dual Switch 1",
            "url": "mqtt://192.168.0.3",
            "topic": "dual_switch",
            "index": "1"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "switch",
            "name": "Dual Switch 2",
            "url": "mqtt://192.168.0.3",
            "topic": "dual_switch",
            "index": "2"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "lightbulb",
            "name": "RGB Led strip",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_rgb"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "smoke",
            "name": "Kitchen Smoke",
            "url": "mqtt://192.168.0.3",
            "topic": "smoke_alarm_kitchen"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "doorbell",
            "name": "Main Door Bell",
            "url": "mqtt://192.168.0.3",
            "topic": "door_bell"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "sensor",
            "name": "Lounge Temp&Humidity",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_temp"  
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "fan",
            "name": "Fan",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_fan"
        },
        {
            "accessory": "mqtt-tasmota",
            "type": "valve",
            "name": "Garden Irrigation",
            "url": "mqtt://192.168.0.3",
            "topic": "garden_irrigation",
            "icon": "irrigation"
        }
    ]
}
```
# Supported accessories

One single `mqtt-tasmota` type is supported, with `type` being one of:
 - blinds
 - doorbell
 - fan
 - lightbulb
 - smoke
 - switch
 - sensor (for both temperature and humidity)
 - valve


# Settings
| Variable | Description | Default | Example | Optional |
| --- | --- | --- | --- | --- |
| <b>Basic Settings</b> |
| accessory | Name of the accessory plugin. | | mqtt-tasmota | |
| type | Type of the accessory (as mentioned above) | | blinds |
| name | Name for your device. | | Living Room Blind |
| debug | Debug incoming MQTT messages for the device | false | true | :white_check_mark: |
| manufacturer | Manufacturer of your device | DIY | DIY | :white_check_mark: |
| model | Model of your blind. | Prototype | Prototype | :white_check_mark: |
| serialNumberMAC | Serial number of your device. | 01.01.01.01 | 01.01.01.01 | :white_check_mark: |
| <b>MQTT Settings</b> |
| url | MQTT broker URL. | | mqtt://192.168.0.10:1883 |
| username | Your MQTT Broker username | | username | :white_check_mark: |
| password | Your MQTT Broker password | | password | :white_check_mark: |
| topic | MQTT topic part related to the device. (will be used to compose actual [tasmota](https://tasmota.github.io/docs/) topics) | | my_blind |
| teleTopic | Telemetry topic (for instance position of shutter from 0 to 100) | /tele/{topic}/SENSOR | /tele/my_blind/SENSOR | :white_check_mark: |
| commandTopic | Command topic (for instance to set position of shutter to set position from 0 to 100) | /cmnd/{topic}/ShutterPosition{index} | /cmnd/my_blind/ShutterPosition1 | :white_check_mark: |
| resultTopic | Result topic (for instance to get shutter position from 0 to 100) | /stat/{topic}/RESULT | /stat/my_blind/RESULT | :white_check_mark: |
| shutter | shutterName | Shutter name as seen in [tasmota](https://tasmota.github.io/docs/). | Shutter{index} | Shutter1 | 
| <b>For devices with multiple accessories like switch, lightbulb, valve, shutter</b>
| index | The device index in [tasmota](https://tasmota.github.io/docs/) (could be 1 to 4) | | 1 | :white_check_mark: |

# About the `valve` accessory support
[Tasmota](https://tasmota.github.io/docs/) does not have an actual behaviour for an irrigation system or similar system, but it can be setup with some simple rules within the device.

For instance, if I want to setup a faucet that will be triggered by a click, and then will stay `ON` for 30 minutes, I can have these [rules](https://tasmota.github.io/docs/Rules/) in [tasmota](https://tasmota.github.io/docs/):

```
Rule1
  ON Power1#state=1 DO backlog RuleTimer1 1800; RuleTimer8 10; ENDON
  ON Rules#Timer=1 DO Power1 off ENDON
  ON Rules#Timer=8 DO RuleTimer8 10 ENDON
  ON Power1#state=0 DO RuleTimer0 0 ENDON
;
Rule1 1
```
This will start a timer once the button state changed to `ON`. Then, every 10 seconds a second timer will publish the current timer state to MQTT. This way, the [homebridge](https://homebridge.io/) accessors will be able to display the remaining time left. After 30 minutes the power button will be set to `OFF`.

Furthermore, you can also do a schedule with [timers](https://tasmota.github.io/docs/Timers/) to enable automatic irrigation schedule, or like I do, program a swimming pool filtration motor:

```
timers on;
Timer1 {"Enable":1,"Mode":0,"Time":"23:00","Window":0,"Days":"1111111","Repeat":1,"Output":1,"Action":1};
Timer2 {"Enable":1,"Mode":0,"Time":"03:00","Window":0,"Days":"1111111","Repeat":1,"Output":1,"Action":1};
Timer3 {"Enable":1,"Mode":0,"Time":"09:00","Window":0,"Days":"1111111","Repeat":1,"Output":1,"Action":1};
Timer4 {"Enable":1,"Mode":0,"Time":"15:00","Window":0,"Days":"1111111","Repeat":1,"Output":1,"Action":1};
Timer5 {"Enable":1,"Mode":0,"Time":"19:00","Window":0,"Days":"1111111","Repeat":1,"Output":1,"Action":1};
```


# TODO
 - for malfunctioning devices, get their state at startup and show them as broken
 - create a platform API and enable auto-discover of all [tasmota](https://tasmota.github.io/docs/) devices
 - add logs for sensors (temp, hum, watt, ...)


# Contributing

Adding support for a new device type should be as simple as add a new `device_type.js` file in the `src` directory
Then:
 - add the device type in the main `src/ìndex.js` file
 - add a dedicated section in the `config.schema.json` file if necessary
