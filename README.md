# homebridge-mqtt-tasmota
This is a homebridge plugin to control various tasmota devices via mqtt.

## Installation

If you are new to Homebridge, please first read the Homebridge documentation. To install the plugin use:
```
sudo npm install homebridge-mqtt-tasmota -g
```

## Configuration

### config.json example (for blinds)
```
{
    "bridge": {
        "name": "homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    "accessories": [{
        "accessory": "mqtt-tasmota-blinds",
        "name": "Living Room Blinds",
        "manufacturer": "DIY",
        "model": "Prototype",
        "serialNumberMAC": "01.01.01.01",
        "url": "mqtt://192.168.0.10:1883",
        "username": "username",
        "password": "password",
        "topic": "my_blind",
        "shutterIndex": "1",
      }
    ],

    "platforms": [
    ]
}
```
### Basic
| Variable | Description | Example |
| --- | --- | --- |
| accessory | Name of the accessory plugin. | mqtt-tasmota-blinds |
| name | Name for your blinds. | Living Room Blind |
| manufacturer | Manufacturer of your device | DIY |
| model | Model of your blind. | Prototype |
| serialNumberMAC | Serial number of your device. | 01.01.01.01 |


### Blinds and Shutters
#### Basics
| Variable | Description | Example |
| --- | --- | --- |
| url| IP Adress of your MQTT Broker | mqtt://192.168.0.10:1883 |
| username | Your MQTT Broker username | username |
| password | Your MQTT Broker password | password|
| topic | The main topic of your blind | my_blind |
| shutterIndex | The shutter index in tasmota (could be 1 to 4) | 1 |

#### Optional override
Use these variables to override the computed topics (topic + shutterIndex). 

| Variable | Description | Example | Default Value
| --- | --- | --- | --- |
| shutterName | Shutter name as seen in tasmota. | Shutter1 | Shutter{shutterIndex} |
| teleTopic | Telemetry topic position from 0 to 100. | /tele/my_blind/SENSOR | /tele/{topic}/SENSOR |
| commandTopic | Topic to set position from 0 to 100. | /cmnd/my_blind/ShutterPosition1 | /cmnd/{topic}/ShutterPosition{shutterIndex} |
| resultTopic | Topic to get position from 0 to 100. | /stat/my_blind/RESULT | /stat/{topic}/RESULT |
