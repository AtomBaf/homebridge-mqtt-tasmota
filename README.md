# homebridge-mqtt-tasmota
This is an all-in-one homebridge plugin to control various tasmota devices via MQTT.

Since Tasmota MQTT topics are well known for a given device type, all the MQTT topics will be computed according to the device name (%topic% in the tasmota settings).


## Tested with
 - Tasmota 9.3.1 Kenneth and 9.4.0 Leslie
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
 - add support for power switch
 - add logs for sensors (temp, hum, watt, ...)

## Installation

If you are new to Homebridge, please first read the Homebridge documentation. To install the plugin use:
```
sudo npm install homebridge-mqtt-tasmota -g
```

## Common Configuration settings

### config.json example (for blinds, switches, humidity, smoke, temp, and fan)
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
            "accessory": "mqtt-tasmota-blinds",
            "name": "Living Room Blinds",
            "url": "mqtt://192.168.0.3",
            "topic": "living_room_shutter",
            "shutterIndex": "1"
        },
        {
            "accessory": "mqtt-tasmota-switch",
            "name": "Lounge",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_switch"
        },
        {
            "accessory": "mqtt-tasmota-switch",
            "name": "Dual Switch 1",
            "url": "mqtt://192.168.0.3",
            "topic": "dual_switch",
            "switchIndex": "1"
        },
        {
            "accessory": "mqtt-tasmota-switch",
            "name": "Dual Switch 2",
            "url": "mqtt://192.168.0.3",
            "topic": "dual_switch",
            "switchIndex": "2"
        },
        {
            "accessory": "mqtt-tasmota-smoke",
            "name": "Kitchen Smoke",
            "url": "mqtt://192.168.0.3",
            "topic": "smoke_alarm_kitchen"
        },
        {
            "accessory": "mqtt-tasmota-humidity",
            "name": "Lounge Humidity",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_temp"  
        },
        {
            "accessory": "mqtt-tasmota-temperature",
            "name": "Lounge Temp",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_temp"
        },
        {
            "accessory": "mqtt-tasmota-fan",
            "name": "Fan",
            "url": "mqtt://192.168.0.3",
            "topic": "lounge_fan"
        }
    ],

    "platforms": [
    ]
}
```
### Supported accessories

 - mqtt-tasmota-blinds
 - mqtt-tasmota-switch
 - mqtt-tasmota-temperature
 - mqtt-tasmota-humidity
 - mqtt-tasmota-fan
 - mqtt-tasmota-smoke


### Common Mandatory settings
| Variable | Description | Example |
| --- | --- | --- |
| accessory | Name of the accessory plugin. | mqtt-tasmota-blinds |
| name | Name for your device. | Living Room Blind |
| url | MQTT broker URL. | mqtt://192.168.0.10:1883 |
| topic | MQTT topic part related to the device. (will be used to compose actual tasmota topics) | my_blind |


### Common Optional settings
| Variable | Description | Example |
| --- | --- | --- |
| username | Your MQTT Broker username | username |
| password | Your MQTT Broker password | password |
| manufacturer | Manufacturer of your device | DIY |
| model | Model of your blind. | Prototype |
| serialNumberMAC | Serial number of your device. | 01.01.01.01 |



## Dedicated Switch settings
### Optional settings
| Variable | Description | Example | Default Value
| --- | --- | --- | --- |
| switchIndex | The switch index in tasmota (could be 1 to 4, default blank) | 1 | |


## Dedicated Blinds and Shutters settings
### Mandatory settings
| Variable | Description | Example |
| --- | --- | --- |
| shutterIndex | The shutter index in tasmota (could be 1 to 4) | 1 |

### Optional settings
Use these variables to override the computed topics (topic + shutterIndex). 

| Variable | Description | Example | Default Value
| --- | --- | --- | --- |
| shutterName | Shutter name as seen in tasmota. | Shutter1 | Shutter{shutterIndex} |
| teleTopic | Telemetry topic position from 0 to 100. | /tele/my_blind/SENSOR | /tele/{topic}/SENSOR |
| commandTopic | Topic to set position from 0 to 100. | /cmnd/my_blind/ShutterPosition1 | /cmnd/{topic}/ShutterPosition{shutterIndex} |
| resultTopic | Topic to get position from 0 to 100. | /stat/my_blind/RESULT | /stat/{topic}/RESULT |

## Contributing

Adding support for a new device type should be as simple as add a new ```device_type.js``` file in the ```src``` directory
Then add the device type in the main ```ìndex.js``` file
