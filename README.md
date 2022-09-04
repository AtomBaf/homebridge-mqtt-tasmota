
# homebridge-mqtt-tasmota

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://badgen.net/npm/dt/homebridge-mqtt-tasmota?color=purple)](https://www.npmjs.com/package/homebridge-mqtt-tasmota)
[![npm](https://badgen.net/npm/v/homebridge-mqtt-tasmota?color=purple)](https://www.npmjs.com/package/homebridge-mqtt-tasmota)


This is an all-in-one homebridge plugin to control various tasmota devices via MQTT.

Since Tasmota MQTT topics are well known for a given device type, all the MQTT topics will be computed according to the device name (%topic% in the tasmota settings).

## Requirements
 - A MQTT broker (mosquitto for instance)
 - A Tasmota flashed device (v9.3 or up)
 - Homebridge (v1.0.0 or up)

## Tested with
 - Sonoff devices :
    - RFR3
    - MINI
    - POWR2
    - iFan03
    - S26
    - 4CHPROR2
    - 433 RF Bridge (with smoke alarms)
    - T1 (dual switch)
  - Homemade ESP8266 Temperature sensor

## TODO
 - for malfunctioning devices, get their state at startup and show them as broken
 - create a platform API and enable auto-discover of all tasmota devices
 - add logs for sensors (temp, hum, watt, ...)

## Installation

If you are new to Homebridge, please first read the Homebridge documentation.
To install the plugin use:
```
sudo npm install homebridge-mqtt-tasmota -g
```

## Common Configuration settings

### config.json example (for blinds, switches, smoke, doorbell, sensor, and fan)
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
            "name": "Living Room Blinds",
            "url": "mqtt://192.168.0.3",
            "topic": "living_room_shutter",
            "index": "1"
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
        }
    ]
}
```
### Supported accessories

One single `mqtt-tasmota` type is supported, with `type` as one of:
 - blinds
 - doorbell
 - fan
 - lightbulb
 - smoke
 - switch
 - sensor (for both temperature and humidity)


### Common Mandatory settings
| Variable | Description | Example |
| --- | --- | --- |
| accessory | Name of the accessory plugin. | mqtt-tasmota |
| type | Type of the accessory | blinds |
| name | Name for your device. | Living Room Blind |
| url | MQTT broker URL. | mqtt://192.168.0.10:1883 |
| topic | MQTT topic part related to the device. (will be used to compose actual tasmota topics) | my_blind |
| debug | Debug incoming MQTT messages for the device | true |


### Common Optional settings
| Variable | Description | Example |
| --- | --- | --- |
| username | Your MQTT Broker username | username |
| password | Your MQTT Broker password | password |
| manufacturer | Manufacturer of your device | DIY |
| model | Model of your blind. | Prototype |
| serialNumberMAC | Serial number of your device. | 01.01.01.01 |


## Dedicated Switch/Lightbulb settings
### Optional settings
| Variable | Description | Example | Default Value
| --- | --- | --- | --- |
| index | The switch index in tasmota (could be 1 to 4, default blank) | 1 | |


## Dedicated Blinds and Shutters settings
### Mandatory settings
| Variable | Description | Example |
| --- | --- | --- |
| index | The shutter index in tasmota (could be 1 to 4) | 1 |

### Optional settings
Use these variables to override the computed topics (topic + index). 

| Variable | Description | Example | Default Value
| --- | --- | --- | --- |
| shutterName | Shutter name as seen in tasmota. | Shutter1 | Shutter{index} |
| teleTopic | Telemetry topic position from 0 to 100. | /tele/my_blind/SENSOR | /tele/{topic}/SENSOR |
| commandTopic | Topic to set position from 0 to 100. | /cmnd/my_blind/ShutterPosition1 | /cmnd/{topic}/ShutterPosition{index} |
| resultTopic | Topic to get position from 0 to 100. | /stat/my_blind/RESULT | /stat/{topic}/RESULT |

## Contributing

Adding support for a new device type should be as simple as add a new `device_type.js` file in the `src` directory
Then:
 - add the device type in the main `src/ìndex.js` file
 - add a dedicated section in the `config.schema.json` file if necessary
